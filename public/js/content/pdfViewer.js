// Content Script that will try to load popups in the PDF Viewer.

// Popup:
// TODO: Fetching this dialog.html does not work with file:// Content Scripts
// have to revert BACK to just prepending html as a variable:
// https://wtools.io/html-to-javascript-converter

window.onbeforeunload = confirmExit;

function confirmExit(e) {
    $("#exampleModalCenter").modal('show');
    return "This is the return message. Hopefullyh it is a custom message?"
}

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
            $("#exampleModalCenter").modal('show');

        sendResponse({message: "popup added"})
    }

    return true
})