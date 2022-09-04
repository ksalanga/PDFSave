// Content Script that will try to load popups in the PDF Viewer.

/**
 * Listen for B_S messages (requests)
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    /**
     * Service Worker (B_S) Keyboard Command Messaging Pathway to Content Script (C_S):
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
    if (request.message === "command")
    {
        // load savePagePrompt modal
        if (request.command === "save-at-page")
        {
            window.onbeforeunload = null
            $("#savePagePrompt").modal('show')
    
            sendResponse({message: "popup added"})
        }
    }

    /**
     * Load and send HTML templates (Web Accessible Resources aka WAR)
     * https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/
     * 
     * Service Worker (B_S) and Content Script (C_S) WAR Messaging Pathway:
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
     *  3. depending on the request.id of that context menu,
     *      - do stuff with the DOM
     */
    if (request.message === "contextmenu")
    {
        // load savePagePrompt modal
        if (request.id === "save-at-page")
        {
            window.onbeforeunload = null
            $("#savePagePrompt").modal('show')
    
            sendResponse({message: "Context Menu Save at Page Clicked"})
        }
    }

    return true
})

/**
 * Utility Functions:
 */

/**
 * Opens save notification Bootstrap alert after a specified amount of time and closes after a closed amount of time
 * @param saveNotification (string) - HTML string of a save notification element
 */
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