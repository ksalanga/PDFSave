/* eslint-disable no-undef */

// Sets up background actions for:
// - Keyboard shortcuts
// - Context Menu 
// - Accessing Current URLs

console.log("Right here...")

chrome.commands.onCommand.addListener((command) => {
    console.log("Hello?")
    switch(command)
    {
        case "save-at-page":
            // Grab Active URL:
            console.log("Saving at page")
            const queryInfo = {active: true, lastFocusedWindow: true};
            chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
                const url = tabs[0].url;

                console.log(url)

                // // If url is valid (ends in .pdf):
                if (url.endsWith('.pdf'))
                {
                    chrome.runtime.sendMessage({status: "open"}, (response) =>
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

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) =>
{
    console.log("WHYT DONT COMMANDS WOKR???")
})

/* eslint-disable no-undef */