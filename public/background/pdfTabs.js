/* eslint-disable no-undef */

// Sets up background actions for:
// - Keyboard shortcuts
// - Context Menu 
// - Accessing Current URLs

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);
});

chrome.tabs.onUpdated.addListener((tabid, changeinfo, tab) =>
{

})

/* eslint-disable no-undef */