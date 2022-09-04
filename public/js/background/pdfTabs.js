/* eslint-disable no-undef */

// Sets up background actions for:
// - Keyboard shortcuts
// - Context Menu 
// - Accessing Current URLs

chrome.commands.onCommand.addListener((command) => {
    switch(command)
    {
        case "save-at-page":

            chrome.tabs.query( {active: true, currentWindow: true}, (tabs) =>
            {
                chrome.tabs.sendMessage(tabs[0].id, {message: "save-at-page-popup"}, (response) =>
                {
                    if (chrome.runtime.lastError)
                    {
                        console.log("Command Message Error: ", chrome.runtime.lastError)
                        return
                    }

                    console.log(response.message);
                })
            })

            break
        default:
            console.log("Invalid Command")
    }
});


/**
 * 
 * @param url (string) - chrome runtime url of .html file 
 * @param resource (string) - the type of HTML resource you want to message over
 * and want the listener to receive. If you don't know how to name the resource, just make this string
 * the name of the html file you're sending.
 * ex: modal, alert.
 */
function loadHTML(url, resource)
{
    fetch(url)
    .then(r => r.text())
    .then(htmlString => {
        const message =
        {
            message: "load",
            resource: resource,
            data: htmlString
        }

        chrome.tabs.query( {active: true, currentWindow: true}, (tabs) =>
        {
            chrome.tabs.sendMessage(tabs[0].id, message, (response) =>
            {
                if (chrome.runtime.lastError)
                {
                    console.log(`${message.resource} Load Message Error: `, chrome.runtime.lastError)
                    return
                }

                console.log(response.message);
            })
        })
    })
    .catch((err) =>
    {
        console.log(`Fetching ${message.resource} Resource Error:`, err)
    })
}

// Load and fetch Resources:
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
    if (changeInfo.status === "complete"
    && tab.url.endsWith(".pdf"))
    {
        // save prompt (modal.html):
        const modalURL = chrome.runtime.getURL('/templates/modal.html')
        loadHTML(modalURL, "modal")

        if (tab.url.startsWith("file"))
        {
            const alertOfflineURL = chrome.runtime.getURL('/templates/alertOffline.html')
            loadHTML(alertOfflineURL, "alert")
        }
        else
        {
            // alert (alert.html) + pdf logo
            const alertURL = chrome.runtime.getURL('/templates/alert.html')
            fetch(alertURL)
            .then(r => r.text())
            .then((html) => {
                if (alertURL.startsWith("file"))
                {
                    return html.replace('src=""', 'src="https://www.clipartmax.com/png/middle/134-1345050_letter-p-free-clipart-letter-p.png"')
                }
                return html.replace('src=""', `src="${chrome.runtime.getURL('logo192.png')}"`)
            })
            .then(htmlString => {
                const message =
                {
                    message: "load",
                    resource: "alert",
                    data: htmlString
                }
                chrome.tabs.query( {active: true, currentWindow: true}, (tabs) =>
                {
                    chrome.tabs.sendMessage(tabs[0].id, message, (response) =>
                    {
                        if (chrome.runtime.lastError)
                        {
                            console.log("Alert Load Message Error: ", chrome.runtime.lastError)
                            return
                        }
    
                        console.log(response.message);
                    })
                })
            })
            .catch((err) =>
            {
                console.log("Fetching Alert Resource Error:", err)
            })
        }

    }
})
    // save alert (alert.html):

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) => {})

/* eslint-disable no-undef */