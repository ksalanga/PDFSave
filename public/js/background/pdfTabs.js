/* eslint-disable no-undef */

// Sets up background actions for:
// TODO: - Accessing Current URLs

/**
 * On Install Routines:
 *  1. Check if any commands have collided with other extension commands
 */

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts();
  }
});

/**
 * Service Worker (B_S) Keyboard Command Messages to Content Script (C_S):
 * 
 * B_S:
 *  1. Listens for chrome keyboard commands
 *  2. On a command event,
 *  3. Send request that contains:
 *      {
 *          message (string): "command" (required),
 *          command (string): name of command
 *      }
 * 
 * C_S:
 *  1. Listens for B_S messages / requests
 *  2. If request.message is "command"
 *  3. Do something depending on the request.command
 */
chrome.commands.onCommand.addListener((command) => {
    const message = 
    {
        message: "command"
    }

    switch(command)
    {
        case "save-at-page":
            message.command = command
            sendMessageToActiveTab("Save At Page Command", message)
            break
        default:
            console.log("Invalid Command")
    }
});

/**
 * Load and send HTML templates (Web Accessible Resources aka WAR)
 * https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/
 * NOTE: IF LOADING AN HTML WAR: ADD IT INTO THE MANIFEST UNDER "web_accessible_resources"
 * 
 * Service Worker (B_S) and Content Script (C_S) WAR Messaging Pathway:
 * 
 * B_S:
 *  1. fetches HTML resource from the extension's directory via WAR url
 *  2. sends HTML Resource as a message / request to C_S
 *  3. Request contains:
 *      {
 *          message (string): "load" (required)
 *          resource (string): name of HTML element you want to load
 *          data (string): HTML string that the C_S will add into DOM
 *      }
 *   4. listen for response
 * 
 * C_S:
 *  1. Listens for B_S requests
 *  2. Once a request is received
 *  3. If request.message is "load"
 *  4. Depending on the resource type, do something with the request.data (HTML string)
 *      - can simply append resource to DOM, or do more with the elements with JS trickery
 *  6. Respond with the type of resource you received
 * 
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
    if (changeInfo.status === "complete")
    {
        // Send modal/dialog box template
        const modalURL = chrome.runtime.getURL('/templates/modal.html')
        loadHTML(modalURL, "modal")

        // Send Alert with Command Shortcut as a custom string
        chrome.commands.getAll((commands) =>
        {
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

            if (tab.url.startsWith("file"))
        {
            const alertOfflineURL = chrome.runtime.getURL('/templates/alertOffline.html')
            loadHTML(alertOfflineURL, "alert",
            (htmlString) =>
            {
                return htmlString.replace('INSERT COMMAND', saveCommandShortcut)
            })
        }
        else
        {
            const alertURL = chrome.runtime.getURL('/templates/alert.html')
            loadHTML(alertURL, "alert", 
            (htmlString) => 
            {
                htmlString = htmlString.replace('src=""', `src="${chrome.runtime.getURL('logo192.png')}"`)
                return htmlString.replace('INSERT COMMAND', saveCommandShortcut)
            })
        }
        })
    }
})

/**
 * Context Menus:
 * https://developer.chrome.com/docs/extensions/reference/contextMenus/
 * 
 * B_S and C_S Context Menu Messaging Pathway:
 * 
 * B_S:
 *  1. Listens for context menu clicks
 *  2. On a context menu click:
 *  3. Sends a request that contains:
 *      {
 *          message (string): "contextmenu" (value required)
 *          id: id of context menu item
 *      }
 * 
 * C_S:
 *  1. Listens for requests:
 *  2. If request.message is "contextmenu"
 *      3. depending on the request.id of that context menu,
 *          - do stuff with the DOM
 */
const saveAtPageContextMenuID = chrome.contextMenus.create(
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
        console.log("Created Save at Page Context Menu")
    }
)

chrome.contextMenus.onClicked.addListener((info, tab) =>
{
    if (info.menuItemId === saveAtPageContextMenuID)
    {
        const message =
        {
            message: "contextmenu",
            id: saveAtPageContextMenuID
        }
        sendMessageToActiveTab("Save At Page Context Menu", message)
    }
})

/**
 * Utility Functions:
 */

/**
 * 
 * @param url (string) - chrome runtime url of .html file 
 * @param resource (string) - the type of HTML resource you want to message over
 * and want the listener to receive. If you don't know how to name the resource, just make this string
 * the name of the html file you're sending.
 * ex: modal, alert.
 * @param modifyHTMLString (callback) *OPTIONAL - callback function (htmlstring) that modifies the HTML string and returns the newly modified string
 */
function loadHTML(url, resource, modifyHTMLString)
{
    fetch(url)
    .then(r => r.text())
    .then(htmlString => {
        if (modifyHTMLString)
        {
            htmlString = modifyHTMLString(htmlString)
        }

        const message =
        {
            message: "load",
            resource: resource,
            data: htmlString
        }

        sendMessageToActiveTab(message.resource + " load", message)
    })
    .catch((err) =>
    {
        console.log(`Fetching ${message.resource} Resource Error:`, err)
    })
}

/**
 * 
 * @param messageType (string) - The type of message you're sending to Tab, messageType will be referenced whenever an error occurs
 * @param message (object) - message to send to active tab
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