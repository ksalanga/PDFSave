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
// var pdfviewObserver = new MutationObserver((records, observer) =>
// {
//     alert("Something going on")
//     let i = 0
//     for (const record of records)
//     {
//         i++
//     }
//     alert(i)
// })

// pdfviewObserver.observe(pdfview[0], { childList: true, subtree: true, attributes: false, characterData: false })

// Looks like we can't access the shadow dom and see changes directly from the dom parent:
// Possible solutions?:
// Try to use CSS tricks?
// https://stackoverflow.com/questions/16633057/is-it-possible-to-access-shadow-dom-elements-through-the-parent-document

// Or see if you can grab custom elements:
// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements


// SHADOW DOM IS MAD ANNOYING MAN JUST LET ME GRAB THE CONTENTS FOR PETES SAKE

alert("Before load: " + document.body.firstElementChild.src)

window.addEventListener ("load", myMain, false);

function myMain (evt) {
    var jsInitChecktimer = setInterval (checkForJS_Finish, 15000);

    function checkForJS_Finish () {
        let pdfview = document.getElementsByTagNameNS('*', 'pdf-viewer')
        alert("After load: " + document.body.firstElementChild.src)
        if (    typeof SOME_GLOBAL_VAR != "undefined"
            ||  document.querySelector ("#viewer")
        ) {
            clearInterval (jsInitChecktimer);
            // alert("JS Finished.")
            var viewer = document.getElementById('viewer')
            alert("JS Finished Viewer:" + viewer)
        }
    }
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