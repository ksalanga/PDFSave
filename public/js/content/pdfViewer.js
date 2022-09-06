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
     * check through all of the valid request types and commands.
     * 
     * If the request is a valid type and command,
     * - send a response object:
     * {
     *      message: "[input type] input: [input command] is successful"
     * }
     * 
     * If the request is NOT a valid type and command,
     * - send a response object:
     * {
     *      message: "Invalid input Type"
     * }
     * 
     * @param request:
     *  Message Object that B_S requests
     *  Message Object:
     *  {
     *      message: "userInput" (required)
     *      type (string): type of input the background script requests
     *      command (string): command of the specific input type
     *  }
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
    {
                $("#bookmarkPrompt").modal('show')
        if (request.message === "userInput")
        {
            var validInput = false

            switch(request.type)
            {
                /**
                 * C_S Keyboard Command Message Listener:
                 *  1. Listens for B_S request
                 *  2. If request.type is "keyboard"
                 *  3. Do something depending on the request.command
                 */
                case "keyboard":
                    // load savePagePrompt modal
                    if (request.command === "save-at-page")
                    {
                        window.onbeforeunload = null
                        $("#savePagePrompt").modal('show')
                        
                        validInput = true
                    }
                    break

                /**
                 * C_S Context Menu Message Listener:
                 *  1. Listens for B_S request
                 *  2. If request.type is "contextmenu"
                 *  3. Do something depending on the request.command
                 */
                case "contextmenu":
                    // load savePagePrompt modal
                    if (request.command === "save-at-page")
                    {
                        window.onbeforeunload = null
                        $("#savePagePrompt").modal('show')
                
                        validInput = true
                    }
                    break 
            }

            if (validInput)
            {
                sendResponse({message: `${request.type} input: ${request.command} successful`})
            }

            if (!validInput)
            {
                sendResponse({message: "Invalid input Type"})
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