/* eslint-disable no-undef */

// Listen to the current url:
// Set up a listener for when a tab is switched.
// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated

// Get the active url:
// Set up a listener for when a tab has finished switching and has updated.
// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated

// export function grabActiveUrl()
// {
//     const queryInfo = {active: true, lastFocusedWindow: true};

//     chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
//         const url = tabs[0].url;
//         alert('Hello there updated: ' + url)
//     });
// }

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) =>
{
    if (changeinfo.status === "complete"
    && tab.url.endsWith('.pdf'))
    {
        const secondsToStartScript = 15
        console.log("Completed loading:" + tab.url)
        console.log("Starting script in " + secondsToStartScript + " seconds")

        var seconds = 1
        function countUp()
        {
            console.log(seconds)
            if (seconds === secondsToStartScript)
            {
                clearInterval(timer)
            }
            seconds++
        }

        function executeScript()
        {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['./view/PDF.js']
            })
        }
        
        const timer = setInterval(countUp, 1000)
        setTimeout(executeScript, secondsToStartScript * 1000)
    }
})


function PDFScript(tabid, changeinfo, tab)
{
    if (tab.url.endsWith('.pdf'))
    {
        if (changeinfo.status === "complete")
        {
            const secondsToStartScript = 10
            console.log("Completed loading:" + tab.url)
            console.log("Starting script in " + secondsToStartScript + " seconds")

            var seconds = 1
            function countUp()
            {
                console.log(seconds)
                if (seconds === secondsToStartScript)
                {
                    clearInterval(timer)
                }
                seconds++
            }

            function executeScript()
            {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['./view/PDF.js']
                }, (results) =>
                {
                    console.log("Results:")
                    for (const result of results)
                    {
                        console.log(result)
                    }
    
                    function return_msg_callback(response)
                    {
                        console.log('CS Response:')
                        console.log(response)
                    }
                    
                    chrome.tabs.sendMessage(tabid,{
                        text: 'hey_cs'
                    }, return_msg_callback);
                });
            }
            
            const timer = setInterval(countUp, 1000)
            setTimeout(executeScript, secondsToStartScript * 1000)
        }
    }
}
// Send a message to Content Script:
// https://stackoverflow.com/questions/14245334/sendmessage-from-extension-background-or-popup-to-content-script-doesnt-work

/* eslint-disable no-undef */