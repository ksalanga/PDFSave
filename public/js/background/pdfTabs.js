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


// Load and fetch Resources:
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
    if (changeInfo.status === "complete"
    && tab.url.endsWith(".pdf"))
    {
        // save prompt (modal.html):
        const modalURL = chrome.runtime.getURL('/templates/modal.html')
        fetch(modalURL)
        .then(r => r.text())
        .then(htmlString => {
            const message =
            {
                message: "load",
                resource: "modal",
                data: htmlString
            }
            chrome.tabs.query( {active: true, currentWindow: true}, (tabs) =>
            {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) =>
                {
                    if (chrome.runtime.lastError)
                    {
                        console.log("Modal Load Message Error: ", chrome.runtime.lastError)
                        return
                    }

                    console.log(response.message);
                })
            })
        })
        .catch((err) =>
        {
            console.log("Fetching Modal Resource Error:", err)
        })

        // alert (alert.html) + pdf logo
        const alertURL = chrome.runtime.getURL('/templates/alert.html')
        fetch(alertURL)
        .then(r => r.text())
        .then(html => html.replace('src=""', `src="${chrome.runtime.getURL('logo192.png')}"`))
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
})
    // save alert (alert.html):

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) => {})

/* eslint-disable no-undef */