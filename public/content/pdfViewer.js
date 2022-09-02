// Content Script that will try to load popups in the PDF Viewer.

// Listen to chrome messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    if (request.message === "save-at-page-popup")
    {
        // If DOM has the popup element
            // sendResponse: message: popup exists
        
        // Else
            // TODO: Inject popup with CSS into DOM
            // sendResponse: message: popup added
        sendResponse({message: "popup added"})
    }

    return true
})