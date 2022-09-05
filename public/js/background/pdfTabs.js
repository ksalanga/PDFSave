/* eslint-disable no-undef */

/**
 * Definitions:
 * C_S: Content Script
 * B_S: Service Worker
 * message === request
 * WAR - Web Accessible Resources
 */

/**
 * On Install Routines:
 *  1. Check if any commands have collided with other extension commands
 */
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts()
  }
});

urlRedirect()
sendResources()
sendUserInputs()

/**
 * Loads the URL Redirect Listener:
 * 
 * ALL Conditions must be met for a URL Redirect Action:
 * 1. tab URL extension is .pdf
 * 2. tab URL exists in DB
 * 2. tab URL has a recorded saved page
 * 3. tab URL has auto open features on
 * 
 * URL Redirect Action:
 * 1. redirect tab to <url>.pdf#page=X
 *      - where X is the recorded saved page in our conditions
 */
function urlRedirect()
{
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
    {
        if (changeInfo.status === 'complete')
        {
            // TODO: Delete Later. Dummy Data
            const saved_url = "http://aroma.vn/web/wp-content/uploads/2016/11/code-complete-2nd-edition-v413hav.pdf"
            const saved_page = 100
            const auto_open_on = true

            // TODO: Make isPDFExtension Function
            // endsWith.pdf is not sufficient because the url can be .pdf#?#?#? and that won't be detected
            if (
                tab.url.endsWith('.pdf')
                && tab.url === saved_url
                && auto_open_on
            )
            {
                chrome.tabs.update(tabId, {url: tab.url + "#page=" + saved_page}, () => {
                    chrome.tabs.reload(tabId)
                })
                return
            }
        }
    })
}

/**
 * Listens for C_S load requests and sends corresponding resources for those requests.
 */
function sendResources()
{
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
    {
        if (request.message === "load")
        {
            /**
             * On an HTML Load Request,
             * get a list of HTML Templates:
             * 
             * HTML Template (Object):
             * {
             *  name: "string",
             *  data: "HTML string"
             * }
             * 
             * and send that list as a response
             * to the C_S
             */
            if (request.type === "html")
            {
                getHTMLTemplates(request.url)
                .then((htmlTemplates) => sendResponse(htmlTemplates))
                .catch((error) =>
                {
                    console.log("B_S Load HTML Template Message Error: ", error)
                })
                
                return true
            }
        }
    })
}

/**
 * Listens for user inputs (ex: keyboard commands or context menus)
 * and sends those inputs to the active tab's content script.
 */
function sendUserInputs()
{
    loadKeyboardCommandsListener()
    loadContextMenusListener()

    /**
     * Loads the Listener for any Keyboard Commands that the B_S will consume and send to C_S as a message
     */
    function loadKeyboardCommandsListener()
    {
        /**
         * B_S Keyboard Command Messages to C_S:
         *  1. Listens for chrome keyboard commands
         *  2. On a command event,
         *  3. Send message that contains:
         *      {
         *          message (string): "userInput" (required),
         *          type: "keyboard" (required),
         *          command (string): name of command
         *      }
         *  4. Logs the Response (Object):
         *      {
         *          message (string) - message that the C_S responds with
         *      }
         * 
         * @param command - command event
         */
        chrome.commands.onCommand.addListener((command) => {
            const message = 
            {
                message: "userInput",
                type: "keyboard"
            }
        
            switch(command)
            {
                case "save-at-page":
                    message.command = command
                    sendMessageToActiveTab("Save At Page Keyboard Command", message)
                    break
                default:
                    console.log("Invalid Command")
            }
        });
    }
    
    /**
     * Loads the listener for any Context Menus the B_S will consume and send to C_S as a message
     */
    function loadContextMenusListener()
    {
        const message =
        {
            message: "userInput",
            type: "contextmenu"
        }
    
        /**
         * Create Context Menus
         */
        const saveAtPageID = chrome.contextMenus.create(
            {
                id: "save-at-page",
                title: "Save at Page",
                contexts: ["all"],
                documentUrlPatterns: [
                    "*://*/*.pdf",
                    "file:///*/*.pdf"
                ]
            },
            () =>
            {
                if (chrome.runtime.lastError)
                {
                    console.log("Error creating Context Menu: ", chrome.runtime.lastError)
                }
            }
        )
        
        /**
         * B_S Context Menu Requester:
         *  1. Listens for context menu clicks
         *  2. On a context menu click:
         *  3. Sends a request to C_S (active tab) that contains:
         *      {
         *          message (string): "userInput" (value required)
         *          type (string): "contextmenu" (required)
         *          command: id of context menu item
         *      }
         * 
         *  4. Logs the Response (Object):
         *      {
         *          message (string) - message that the C_S responds with
         *      }
         */
        chrome.contextMenus.onClicked.addListener((info, tab) =>
        {
            if (info.menuItemId === saveAtPageID)
            {
                message.command = saveAtPageID
                sendMessageToActiveTab("Save At Page Context Menu", message)
            }
        })
    }
}

/**
 * Utility Functions:
 */

/**
 * gets HTML Templates list
 * 
 * @param url - URL of C_S
 * - Important to distinguish because a file scheme will send different HTML resources than a https scheme
 * - cause of WAR B.S.
 */
async function getHTMLTemplates(url)
{
    try
    {
        var htmlTemplates = []
    
        // Send modal/dialog box template
        const modalURL = chrome.runtime.getURL('/templates/modal.html')
        const modalTemplate = await getHTMLTemplate(modalURL, "modal")
        htmlTemplates.push(modalTemplate)
    
        // Send Alert with Command Shortcut as a custom string
        const commands = await chrome.commands.getAll()
    
        var saveCommandShortcut
    
        for (let {name, shortcut} of commands)
        {
            if (name === 'save-at-page')
            {
                if (shortcut === '') 
                {
                    saveCommandShortcut = "Not Binded, Set a Shortcut in PDF Save Extension Settings"
                }
                else
                {
                    saveCommandShortcut = shortcut
                }
                break
            }
        }
    
        if (url.startsWith("file"))
        {
            const alertOfflineURL = chrome.runtime.getURL('/templates/alertOffline.html')
            const alertOfflineTemplate = await getHTMLTemplate(alertOfflineURL, "alert",
            (htmlString) =>
            {
                return htmlString.replace('INSERT COMMAND', saveCommandShortcut)
            })
    
            htmlTemplates.push(alertOfflineTemplate)
        }
        else
        {
            const alertURL = chrome.runtime.getURL('/templates/alert.html')
            const alertTemplate = await getHTMLTemplate(alertURL, "alert", 
            (htmlString) => 
            {
                htmlString = htmlString.replace('src=""', `src="${chrome.runtime.getURL('logo192.png')}"`)
                return htmlString.replace('INSERT COMMAND', saveCommandShortcut)
            })
    
            htmlTemplates.push(alertTemplate)
        }
    
        return htmlTemplates
    } catch (error)
    {
        console.log("Error Loading Resources from loadResources Function: ", error)
    }
}

/**
 * Get an HTML Template from our file directory, and convert it into a readable HTML String.
 * 
 * @param url (string) - chrome runtime url of .html file (resource we wish to retrieve)
 * @param name (string) - the type of HTML resource you want to message over
 * and want the listener to receive. If you don't know how to name the resource, just make this string
 * the name of the html file you're sending.
 * ex: modal, alert.
 * @param modifyHTMLString (callback) *OPTIONAL - callback function (htmlstring) that modifies the HTML string and returns the newly modified string
 * 
 * returns:
 * HTML Template (Object):
 * {
 *  name: "string",
 *  data: "HTML string"
 * }
 */
async function getHTMLTemplate(url, name, modifyHTMLString)
{
    try
    {
        const response = await fetch(url)
        var html = await response.text()
    
        if (modifyHTMLString)
        {
            html = modifyHTMLString(html)
        }
    
        const template =
        {
            name: name,
            data: html
        }
    
        return template
    } catch (error)
    {
        console.log("Error Loading HTML Resource: ", error)
    }
}

/**
 * Sends a message to active tab (C_S).
 * 
 * If response is successful, logs a response object:
 * Response (Object)
 * {
 *  message (string) - message that the C_S responds with
 * }
 * 
 * Else it logs a runtime.lastError
 *  
 * @param messageType (string) - The type of message you're sending to Tab, messageType will be referenced whenever an error occurs
 * @param message (object) - message to send to active tab
 *
 */
function sendMessageToActiveTab(messageType, message)
{
    chrome.tabs.query( {active: true, currentWindow: true}, (tabs) =>
    {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) =>
        {
            if (chrome.runtime.lastError)
            {
                if (tabs[0].url.includes('.pdf'))
                {
                    console.log(`${messageType} Message Error: `, chrome.runtime.lastError)
                }
                return
            }

            console.log(response.message);
        })
    })
}

/**
 * Check if any commands are registered:
 * https://developer.chrome.com/docs/extensions/reference/commands/#verify-commands-registered
 */
// Only use this function during the initial install phase. After
// installation the user may have intentionally unassigned commands.
function checkCommandShortcuts() {
  chrome.commands.getAll((commands) => {
    let missingShortcuts = [];

    for (let {name, shortcut} of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }

    if (missingShortcuts.length > 0) {
        // TODO: Update the extension UI to inform the user that one or more
        // commands are currently unassigned.
    }
  });
}
/* eslint-disable no-undef */