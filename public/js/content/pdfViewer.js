// Content Script that will try to load popups in the PDF Viewer.

/**
 * Definitions:
 * C_S: Content Script
 * B_S: Service Worker
 * message === request
 */

requestHtmlTemplates()
receiveUserInputs()
receiveReloadRequests()

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
                $("#bookmarkPrompt").modal('hide')
                return true
            }
            if (command === "bookmark")
            {
                $("#bookmarkPrompt").modal('show')
                $("#savePagePrompt").modal('hide')
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
        var $notificationParent = $("<div>", {"aria-live": "polite", "aria-atomic": "true", "class": "fixed-top"});
        $("body").prepend($notificationParent)

        // Notification Container holds all of our Toast Elements
        var $notificationContainer = $("<div>", {"class": "toast-container position-absolute top-0 end-0 p-3"})
        $($notificationParent).prepend($notificationContainer)
        
        for (const htmlTemplate of htmlTemplates)
        {
            if (htmlTemplate.name === "savePageModal")
            {
                $("body").prepend(htmlTemplate.data)

                $(document).ready(function()
                {
                    var savePageForm = $("#savePageForm")
                    /**
                     * Save Page Modal Form Submission Function:
                     * 
                     * Sends a request to B_S:
                     * {
                     *  message: "form",
                     *  type: "save-at-page",
                     *  data: List(Form Inputs)
                     * }
                     * which will further process the form
                     */
                    function submitSavePageForm(e)
                    {
                        e.preventDefault()
        
                        const request =
                        {
                            message: "form",
                            type: "save-at-page",
                        }
                        request.data = savePageForm.serializeArray()

                        chrome.runtime.sendMessage(request, (response) =>
                        {
                            if (response.message === "valid")
                            {
                                const page = request.data[0].value
                                showConfirmedSavePage(page)
                            }
                            else
                            {
                                showDeniedSavePage()
                            }

                            function showConfirmedSavePage(page)
                            {
                                var confirmedSavePageEl = $("#confirmedSavePage")
                                var confirmedSavePageText = "This pdf will reopen at pg. " + page
                                $(confirmedSavePageEl).find(".toast-body").html(confirmedSavePageText)
                                var confirmedSavePageToast = bootstrap.Toast.getOrCreateInstance(confirmedSavePageEl)
                                confirmedSavePageToast.show()
                            }
                            
                            function showDeniedSavePage()
                            {
                                var deniedSavePageEl = $("#deniedSavePage")
                                var deniedSavePageToast = bootstrap.Toast.getOrCreateInstance(deniedSavePageEl)
                                deniedSavePageToast.show()
                            }

                            return true
                        })

                        savePageForm.trigger("reset")
                        $("#savePagePrompt").modal('hide')
                    }

                    savePageForm.submit(submitSavePageForm)
                    $("#savePageButton").click(submitSavePageForm)
                })
            }

            if(htmlTemplate.name === "bookmarkModal")
            {
                $("body").prepend(htmlTemplate.data)

                $(document).ready(function()
                {
                    var bookmarkForm = $("#bookmarkForm")
                    /**
                     * Bookmark Modal Form Submission Function:
                     * 
                     * Sends a request to B_S:
                     * {
                     *  message: "form",
                     *  type: "bookmark",
                     *  data: List(Form Inputs)
                     * }
                     * which will further process the form
                     */
                    function submitBookmarkForm(e)
                    {
                        e.preventDefault()

                        const request =
                        {
                            message: "form",
                            type: "bookmark",
                        }
                        request.data = bookmarkForm.serializeArray()

                        chrome.runtime.sendMessage(request, (response) =>
                        {
                            if (response.message === "valid")
                            {
                                showConfirmedAddBookmark()
                            }
                            else
                            {
                                showDeniedAddBookmark()
                            }

                            function showConfirmedAddBookmark()
                            {
                                var confirmedAddBookmarkEl = $("#confirmedAddBookmark")
                                var confirmedAddBookmarkToast = bootstrap.Toast.getOrCreateInstance(confirmedAddBookmarkEl)
                                confirmedAddBookmarkToast.show()
                            }
                            function showDeniedAddBookmark()
                            {
                                var deniedAddBookmarkEl = $("#deniedAddBookmark")
                                var deniedAddBookmarkToast = bootstrap.Toast.getOrCreateInstance(deniedAddBookmarkEl)
                                deniedAddBookmarkToast.show()
                            }

                            return true
                        })

                        bookmarkForm.trigger("reset")
                        $("#bookmarkPrompt").modal('hide')
                    }

                    bookmarkForm.submit(submitBookmarkForm)
                    $("#addBookmarkButton").click(submitBookmarkForm)
                })
            }
        
            if (htmlTemplate.name === "alert")
            {
                openSavePageAlert(htmlTemplate.data)
            }

            if (htmlTemplate.name === "toast")
            {
                $($notificationContainer).prepend(htmlTemplate.data)
            }
        }

        if (chrome.runtime.lastError)
        {
            console.log(chrome.runtime.lastError)
            return
        }
    })
}

/**
 * Reloads window on reload request message from B_S.
 */
function receiveReloadRequests()
{
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
    {
        if (request.message === "reload")
        {
            sendResponse({message: "C_S reload successful"})
            window.location.reload()
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

    setTimeout(() =>
    {
        var myAlert = document.getElementById('saveNotification')
        var bsAlert = new bootstrap.Alert(myAlert)
        bsAlert.close()
    }, 50000)
}