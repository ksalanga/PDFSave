/* eslint-disable no-undef */

// TODO: Listen for form submit requests

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
 * Loads the URL Redirect Listener
 * 
 * 
 * IMPORTANT NOTES:
 * - Auto Open / Redirect only happens for urls with the base .pdf (url that is a .pdf extension)
 * - If you add the query #page=X where X is a number after .pdf: the extension will not detect the reload / auto open for that url.
 * - This is intended for two reason: 
 *      1. If you have a bookmark or wanna jump to a page,
 *      the extension doesn't want to auto open to a different page from the one that was intended.
 *      2. More importantly, the extension itself reloads the base .pdf at #page=X
 *          - If we also reload with the #page query, we end up in an infinite reload loop
 * 
 * 
 * URL Redirect Condition:
 * ALL Conditions must be met for a URL Redirect Action:
 * 1. tab URL extension is .pdf
 * 2. tab base URL (url up to and ending in .pdf) has auto open features on
 * 
 * URL Redirect Action:
 * 1. redirect tab to <url>.pdf#page=X
 *      - where X is the recorded saved page in our conditions
 */
function urlRedirect()
{
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
    {
        /**
         * 1. Check if our tab url contains .pdf
         * 2. If it does contian .pdf and the tab has completed loading,
         *      3. Split the base url to:
         *          - base url: .pdf url (url only up to and ending in .pdf)
         *          - query: any string after the last .pdf in url
         *      4. if query doesn't contain #page=X where X is a number,
         *          5. Look up base url in storage:
         *          6. grab base url's autoOpenOn and savedPage features
         *          7. If Redirect Condition 2 is satisfied:
         *              - update and reload the tab
         */
        const url = tab.url.toLowerCase()

        if (url.includes('.pdf') && changeInfo.status === 'complete')
        {
            const [baseURL, query] = split(url, url.lastIndexOf('.pdf') + 4)

            const hasPageQuery = /#page=\d/.exec(query)
            
            if (!hasPageQuery)
            {
                const urlQuery = {
                    autoOpenOn: false,
                    savedPage: 0
                }

                for (const dbRecord of fakeDb)
                {
                    if (dbRecord.filePath.toLowerCase() === baseURL)
                    {
                        urlQuery.autoOpenOn = dbRecord.autoOpenOn
                        urlQuery.savedPage = dbRecord.savedPage
                        break
                    }
                }

                if (urlQuery.autoOpenOn)
                {
                    const savedPage = urlQuery.savedPage

                    chrome.tabs.update(tabId, {url: tab.url + "#page=" + savedPage}, () => {
                        chrome.tabs.reload(tabId)
                    })
                    return
                }
            }
        }
    })
}

/**
 * Listens for active tab content script's load requests and sends corresponding resources for those requests.
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
         *  3. Send a request that contains:
         *      {
         *          message (string): "userInput" (required)
         *          command (string): name of C_S command 
         *      }
         *  4. Logs the Response (Object):
         *      {
         *          message (string) - message that the C_S responds with
         *      }
         * 
         * @param command - command event
         */
        chrome.commands.onCommand.addListener((command) => {
            const request = 
            {
                message: "userInput"
            }
        
            switch(command)
            {
                case "save-at-page":
                    request.command = command
                    sendMessageToActiveTab("Save At Page Keyboard Command", request)
                    break
                case "bookmark":
                    request.command = command
                    sendMessageToActiveTab("Bookmark Keyboard Command", request)
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

        const bookmarkID = chrome.contextMenus.create(
            {
                id: "bookmark",
                title: "Bookmark at Page",
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
         *          command: name of C_S command
         *      }
         * 
         *  4. Logs the Response (Object):
         *      {
         *          message (string) - message that the C_S responds with
         *      }
         */
        chrome.contextMenus.onClicked.addListener((info, tab) =>
        {
            const request =
            {
                message: "userInput"
            }

            if (info.menuItemId === saveAtPageID)
            {
                request.command = saveAtPageID
                sendMessageToActiveTab("Save At Page Context Menu", request)
            }
            if (info.menuItemId === bookmarkID)
            {
                request.command = bookmarkID
                sendMessageToActiveTab("Bookmark Context Menu", request)
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
    
        // Send save-at-page modal/dialog box template
        const savePageModalURL = chrome.runtime.getURL('/templates/savePageModal.html')
        const savePageModalTemplate = await getHTMLTemplate(savePageModalURL, "modal")
        htmlTemplates.push(savePageModalTemplate)

        // Send bookmark modal/dialog box template
        const bookmarkModal = chrome.runtime.getURL('/templates/bookmarkModal.html')
        const bookmarkModalTemplate = await getHTMLTemplate(bookmarkModal, "modal")
        htmlTemplates.push(bookmarkModalTemplate)
    
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

            console.log(`${messageType}:`, response.message);
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

/**
 * Split a string:
 * 
 * @param str (string)
 * @param index (number)
 * @returns two element array:
 * 
 * first element: the part of the string up to, but not including the provided index
 * second element: the rest
 */
function split(str, index) {
    const result = [str.slice(0, index), str.slice(index)];

    return result;
}

// TODO: Delete Later. Dummy Database
const fakeDb =
[
    {
        filePath: "http://aroma.vn/web/wp-content/uploads/2016/11/code-complete-2nd-edition-v413hav.pdf",
        autoOpenOn: true,
        savedPage: 420
    },
    {
        filePath: "http://triggs.djvu.org/djvu-editions.com/BIBLES/DRV/Download.pdf",
        autoOpenOn: true,
        savedPage: 69
    }
]
/* eslint-disable no-undef */