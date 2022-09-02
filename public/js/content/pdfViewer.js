// Content Script that will try to load popups in the PDF Viewer.

// Popup:
// Inject HTML into Content Script: https://stackoverflow.com/a/16336073

fetch(chrome.runtime.getURL('/templates/dialog.html')).then(r => r.text()).then(html => {
    $("body").prepend(html)
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    if (request.message === "save-at-page-popup")
    {
        // If DOM has the popup element
            // sendResponse: message: popup exists
        
        // Else
            // TODO: Inject popup with CSS into DOM
            $("#exampleModalCenter").modal('show');

        sendResponse({message: "popup added"})
    }

    return true
})