/* eslint-disable no-undef */

// Sets up background actions for:
// - Keyboard shortcuts
// - Context Menu 
// - Accessing Current URLs

chrome.commands.onCommand.addListener((command) => {
    switch(command)
    {
        case "save-at-page":
            const queryInfo = {active: true, lastFocusedWindow: true};
            
            chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
                // Grab Active URL:
                const url = tabs[0].url;

                if (url.endsWith('.pdf'))
                {
                    // Send Message to indicate that we are requesting a save at page
                    // I'm thinking a content script has to respond to this message:
                    // https://stackoverflow.com/a/53508273

                    // Because currently, popups cannot be programtically opened.

                    // TODO: Decide how we handle this message in some separate content script or our app.
                    chrome.runtime.sendMessage({sender: "background", message:"save-at-page"}, (response) =>
                    {
                        console.log("Got response: ", response)
                    })
                }
            });
            break
        default:
            console.log("Invalid Command")
    }
});

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) => {})

/* eslint-disable no-undef */