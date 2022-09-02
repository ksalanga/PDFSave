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
                        console.log("Error: ", chrome.runtime.lastError)
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

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) => {})

/* eslint-disable no-undef */