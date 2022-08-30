/* eslint-disable no-undef */
/**
 * Content Script for accessing any tab with a PDF Extension
 * and then changing that PDF extension url to the page left off at.
 */

// content scripts run properly IF it's in our public folder and not associated with our react app,
// we need to figure out how to not run that script in our actual app.

/**
 * Has to match url-pattern with rules:
 * <url-pattern> := <scheme>://<host><path>
 * see (https://developer.chrome.com/docs/extensions/mv3/match_patterns/)
 */

// Since we are only interested in .pdf extensions we must match all url patterns:
// *://*/*.pdf

// In order to grab the current page,
// We have to observe any changes in the viewer.
// Check out mutation observer

// const callback = (mutationList, observer) => {
//   for (const mutation of mutationList) {
//     if (mutation.type === 'childList') {
//       alert('A child node has been added or removed.');
//     } else if (mutation.type === 'attributes') {
//       alert(`The ${mutation.attributeName} attribute was modified.`);
//     } else {
//         alert('Something else changed')
//     }
//   }
// };



window.addEventListener ("load", myMain, false);

function myMain (evt) {

    var jsInitChecktimer = setInterval (checkForJS_Finish, 1000);

    function checkForJS_Finish () {
        if (    typeof SOME_GLOBAL_VAR != "undefined"
            ||  document.querySelector ("#viewer")
        ) {
            clearInterval (jsInitChecktimer);
            // alert("JS Finished.")
            var viewer = document.getElementById('viewer')
            alert("JS Finished Viewer:" + viewer)
        }
    }
    // let shadowDom = viewer.shadowRoot
    // let toolbar = shadowDom.getElementById('toolbar')
    // let toolbarShadow = toolbar.shadowRoot
    // let center = toolbarShadow.getElementById('center')
    // let pageSelector = center.getElementsByTagName('viewer-page-selector')[0]
    // let pageSelectorShadow = pageSelector.shadowRoot
    // let currentPageInput = pageSelectorShadow.getElementById('pageSelector')
    
    // alert(currentPageInput.value)
}

/**
 * Accessing the DOM is only available via content scripts.
 * In order to resolve this, we'll give the user a popup option to allow the extension
 * to read and update .pdf extensions:
 * 
 * First check if the user has file access or not.
 * https://stackoverflow.com/questions/33575973/how-to-get-content-scripts-to-execute-in-file-urls-in-a-chrome-extension
 * 
 * Then, send a message telling them to head over and Allow access to File URLs:
 * https://stackoverflow.com/questions/33575973/how-to-get-content-scripts-to-execute-in-file-urls-in-a-chrome-extension
 */

/* eslint-disable no-undef */