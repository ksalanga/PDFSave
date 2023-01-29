# PDFSave

Chrome extension with various features for the Chrome/Brave PDF viewer. Version 0.0.1 (WIP)

## Features
* Save page position (Integrating and storing into DB in progress) 💾
* Auto-open saved page position (Integrating and loading from DB in progress) 📖
* Bookmark pages 🔖
* Get progress notifications 📱 (Not Yet Implemented)

## Development
*Requirements*
* node
* yarn

*Run*

1. `yarn start`

Runs the React App page into a localhost:3000 browser site
- Recommended for:
    1. faster iterations
    2. developing UI
    3. frontend and db integration

## Building for Chrome Extensions Development:
1. `yarn build`
2. go to: brave://extensions/
- if extension is already loaded:
    1. refresh and update
- if the extension is not loaded:
    1. click load unpacked
    2. from the project's root directory:
    3. select build folder

Loads the React App into the Chrome Extension Windows
- Recommended for:
    1. seeing the extension natively on Chrome 
    2. using Chrome exclusive features like: 
        - Keyboard Shortcut Commands
        - Context Menu Commands