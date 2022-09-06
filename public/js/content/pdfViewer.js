// Content Script that will try to load popups in the PDF Viewer.

// TODO: Add bookmark Context Menu and Keyboard Command HTML Element Renders based on outputs

/**
 * Definitions:
 * C_S: Content Script
 * B_S: Service Worker
 * message === request
 */

requestHtmlTemplates()
receiveUserInputs()

/**
 * Loads the listener for receiving B_S user input requests
 */
function receiveUserInputs()
{
    /**
     * Listen for user input request messages from B_S:
     * If we get a user input request,
     * check through all of the valid commands.
     * 
     * If the request is a valid command,
     * - send a response object:
     * {
     *      message (string): a success message
     * }
     * 
     * If the request is NOT a valid command,
     * - send a response object:
     * {
     *      message (string): an invalid message
     * }
     * 
     * @param request:
     *  Message Object that B_S requests
     *  Message Object:
     *  {
     *      message: "userInput" (required)
     *      command (string): command to execute
     *  }
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
    {
        /**
         * Goes through a list of valid commands and manipulates the dom if it is a valid command.
         * 
         * @param command (string) - command of request
         * @returns true if the requested commands is in the list of possible commands.
         * false otherwise.
         */
        function validCommand(command)
        {
            if (command === "save-at-page")
            {
                $("#savePagePrompt").modal('show')
                
                return true
            }
            if (command === "bookmark")
            {
                $("#bookmarkPrompt").modal('show')
                
                return true
            }
            return true
        }

        if (request.message === "userInput")
        {
            if (validCommand(request.command))
            {
                sendResponse({message: `${request.command} input is successful`})
            }
            else
            {
                sendResponse({message: "Invalid input"})
            }

            return true
        }
    })
}

/**
 * Loads HTML Templates into the DOM
 * by sending requests for B_S to provide HTML Templates
 */
function requestHtmlTemplates()
{
    const loadHTMLRequest = 
    {
        message: "load",
        type: "html",
        url: location.href
    }
    /**
     * Request B_S for HTMLTemplates:
     * 
     * @param loadHTMLRequest: message object that is sent to the B_S to process
     *      Request (Object):
     *      {
     *       message: "load" (required)
     *       type: "html"
     *       url: url of content_script
     *      }
     * 
     * @param (htmlTemplates) => {}: callback where htmlTemplates is the Response Object
     *      Response (list(HTML Template Objects)):
     *      HTML Template Object:
     *      {
     *          name - name of template
     *          data - html string of template
     *      }
     */
    chrome.runtime.sendMessage(loadHTMLRequest, (htmlTemplates) => 
    {
        for (const htmlTemplate of htmlTemplates)
        {
            if (htmlTemplate.name === "modal")
            {
                $("body").prepend(htmlTemplate.data)
            }
        
            if (htmlTemplate.name === "alert")
            {
                openSavePageAlert(htmlTemplate.data)
            }
        }
    })
}

/**
 * Utility Functions:
 */

/**
 * Opens save notification Bootstrap alert after a specified amount of time and closes after a closed amount of time
 * @param saveNotification (string) - HTML string of a save notification element
 */
function openSavePageAlert(saveNotification)
{

    $("body").prepend(saveNotification)

    function showAlert() {
        $("#saveNotification").addClass("in");
    }

    window.setTimeout(function () {
        showAlert();
        
        window.setTimeout(function () {
            $('.alert').alert('close')
        }, 50000)
    }, 1000);
}