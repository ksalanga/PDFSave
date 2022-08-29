/**
 * PDF Controller:
 * 
 * Communicates between different Views:
 * - Input from one view typically outputs into the other view
 * 
 * How will view to view work with Chrome extensions?:
 * - Message passing:
 * Browser View (Background Script) <------- Message Passing (Controller) -------> App (React.js)
 * 
 * Communicates between Model and View:
 * - Inputs ALWAYS start from the View level
 * - Input sometimes comes from view into the model, and output back out to the view.
 *     - ex: App View and PDF Model interactions
 *     - ex: View Request -> Grab Model Items -> Process -> View Update
 * - Input might also start from the view and have no output, just gets input lastly into the Model:
 *     - ex: Browser View and PDF Model interactions
 *     - ex: View Request -> Update Model Items
 * 
 */

/**
 * Browser View Input to App View Output Functions (Input -> Output):
 * - Open New PDF Tab in Browser View -> Select PDF Item in App View
 * - Open Existing PDF Tab -> Select PDF Item
 */
export function openTab()
{
    /* eslint-disable no-undef */
    
    // Listen to the current url:
    // view ./src/chrome/backgroundTab.js

    // if the current url is a pdf extension (ends in .pdf):

        // search filepath in PDF Store

        // If filepath exists:
            // Send a message: select existing item in App View

        // If filepath doesn't exist:
            // put new filepath into PDF Store
            // Send a message: select existing item in App View

    /* eslint-disable no-undef */
}

/**
 * Browser View Input to Model Input Function(s):
 * - Update Current Page
 */

/**
 * App View Input to Browser View Output Function(s):
 * - Open PDF Item -> Open Existing PDF Tab
 */

/**
 * App View Input to Model Input Functions:
 * - CRUD PDF and Deleted File operations
 */