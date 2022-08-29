/* eslint-disable no-undef */

// Listen to the current url:
// Set up a listener for when a tab is switched.
// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated

function tabActivated()
{
    console.log('Tab Activated man.')
}

chrome.tabs.onActivated.addListener(tabActivated)

// Get the active url:
// Set up a listener for when a tab has finished switching and has updated.
// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated

function grabActiveUrl()
{
    const queryInfo = {active: true, lastFocusedWindow: true};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
        const url = tabs[0].url;
        alert('Hello there updated: ' + url)
    });
}


// Send a message to Content Script:
// https://stackoverflow.com/questions/14245334/sendmessage-from-extension-background-or-popup-to-content-script-doesnt-work

/* eslint-disable no-undef */