/**
 * Service Worker/Background Script for accessing any tab with a PDF Extension
 * and then changing that PDF extension url to the page left off at.
 */

/**
 * IF we can access the DOM with service workers, our PDFTab Browser View will stricty use 
 * that so that we don't have to use content script file access permissions.
 * 
 * If accessing the DOM is only available through content scripts though. We just have to deal with it.
 */

// https://stackoverflow.com/questions/1891738/how-to-modify-current-url-location-in-chrome-via-extensions