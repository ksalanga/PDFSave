// Content Script that will try to load popups in the PDF Viewer.

// Popup:
// TODO: Fetching this dialog.html does not work with file:// Content Scripts
// have to revert BACK to just prepending html as a variable:
// https://wtools.io/html-to-javascript-converter

// Maybe we can still load web accessible resources via our service worker ?
// https://stackoverflow.com/questions/69736887/web-accessible-resources-manifest-key-is-ignored-if-respective-resources-are-i

// If this pdf has save / auto open on,
// Send a notification saying:
// Make sure to save your .pdf before you close!
// We might ask you to save it if you don't ;)

function openSavePageAlert(saveNotification)
{

    $("body").prepend(saveNotification)

    function showAlert() {
        $("#saveNotification").addClass("in");
    }

    window.setTimeout(function () {
        showAlert();
        
        window.setTimeout(function () {
            $('.alert').alert('close')
        }, 50000)
    }, 1000);
}

// openSavePageAlert(saveNotification)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    if (request.message === "save-at-page-popup")
    {
        window.onbeforeunload = null
        $("#savePagePrompt").modal('show')

        sendResponse({message: "popup added"})
    }

    if (request.message === "load")
    {
        if (request.resource === "modal")
        {
            $("body").prepend(request.data)

            sendResponse({message: "Modal added"})
        }

        if (request.resource === "alert")
        {
            openSavePageAlert(request.data)

            sendResponse({message: "Alert added"})
        }
    }

    return true
})