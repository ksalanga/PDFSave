import { openDB, ClientDB, update as updateDB, batchUpdate } from './DB'
import { add as addToDeleteStore } from './Deletes'
import { incorrectStringFormat, notBoolean, notInteger } from '../utils/Formatting'
import { CodeError } from '../view/utils/Error'

/** 
 * PDFs Object Store for the Client Database
 * 
 * description:
 * holds records for all pdfs that are opened through a Chrome based browser.
 * 
 * pdf record in Object Store keys:
 * - primary_key (int) - indexedDB auto generated key.
 * - name (string) - title of the pdf that user can decide.
 * - file_path (string) - absolute file path of the pdf from the chrome url.
 * - current_page (int) - current page that the user is reading or left off at.
 * - length (int) - the length in pages of the pdf.
 * - last_week_latest_page (int) [DEFAULT: 0] - the latest page that the user read last week for reading progress notification purposes.
 * - current_week_latest_page (int) [DEFAULT: 0] - the latest page that the user is currently reading this week for reading progress notification purposes.
 * - bookmarks (list(Bookmark)) - list of bookmark objects (see Bookmark Object keys below).
 * - auto_save_on (boolean) - indicates if this pdf has auto saving on or not.
 * - progress_notification_on (boolean) - turns on reading progress notification for this specific pdf.
 * 
 * !NOTE! Bookmark objects are not their own separate object store that has a many to one relationship with a pdf object store.
 * !NOTE! Their implementation and keys are simple enough that...
 * !NOTE! we can just store them as a list of objects with their own separate ids within pdfs object stores.
 * 
 * Bookmark Object keys:
 * - id (string) - id generated by application.
 * - name (string) - name of bookmark.
 * - page (num) - page that the bookmark of the pdf represents.
 * 
 * Indexes:
 * file_name
 * progress_notification_on
 * **/

// expected keys and type pairs for a PDF model
export const pdfKeyTypes = {
    name: 'string',
    file_path: 'string',
    current_page: 'number',
    length: 'number',
    last_week_latest_page: 'number',
    current_week_latest_page: 'number',
    bookmarks: 'object', // specifically a LIST
    auto_save_on: 'boolean',
    progress_notification_on: 'boolean'
}

// expected keys and type pairs for a Bookmark Object
export const bookmarkKeyTypes = {
    id: 'string',
    name: 'string',
    page: 'number'
}

// pdf record keys that can be updated
// where the key is a constant value that other modules trying to update a PDF's keys can access as an "enumeration"
// and the value is the actual key value inside the record
export const pdfUpdateKeys = 
{
    name: 'name',
    currentPage: 'current_page',
    lastWeekLatestPage: 'last_week_latest_page',
    currentWeekLatestPage: 'current_week_latest_page',
    bookmarks: 'bookmarks',
    autoSaveOn: 'auto_save_on',
    progressNotificationOn: 'progress_notification_on'
}

// expected keys list that can be updated in the object store
// ex: name, current_page, etc.
const expectedPDFUpdateKeys = Object.values(pdfUpdateKeys)


const checkIncorrectPageFormat = (pageNumber, length) => {
    if (notInteger(pageNumber)
    || pageNumber < 0
    || pageNumber > length) {
        throw new CodeError('Error: page must be a number between 0 and length of pdf', 404)
    }
}

// function for updating a page number within a PDF whether that's the current page, the last weekly page, or the current weekly page
// the function has built in format checking to throw errors regarding page number
// primaryKey: primary key of pdf record
// updateKey: the key in the pdf record we wish to update
// page: page number (number) value
const updatePage = async (primaryKey, updateKey, page) => {
    try {
        const db = await openDB()
        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store
        const pdf = await pdfStore.get(primaryKey)

        checkIncorrectPageFormat(pdfStore.get(primaryKey), pdf.length)
        
        await updateDB(
            pdfStore,
            primaryKey,
            updateKey,
            page
        )
    } catch(error) {
        console.log(`Something went wrong updating PDF ${primaryKey}'s ${updateKey} page`, error)
    }
}

// function for updating a boolean within a PDF.
// the function has built in format checking to throw errors regarding wrong booleans
// primaryKey: primary key of pdf record
// updateKey: the boolean key we wish to update
// b: boolean value
const updateBoolean = async (primaryKey, updateKey, b) => {
    try {
        if (notBoolean(b)) {
            throw new CodeError('updating value must be a boolean', 404)
        }
    
        const db = await openDB()
    
        await updateDB(
            db.transaction(ClientDB.pdfStore, 'readwrite').store,
            primaryKey,
            updateKey,
            b
        )
    } catch (error) {
        console.log(`Something went wrong updating PDF ${primaryKey}'s ${updateKey} page`, error)
    }
}

// updates name in PDF record with key: key
// key: PDF primary key
// name: name / title value to update to
export async function updateName(key, name) {
    try {
        if (incorrectStringFormat(name)) {
            throw new CodeError('Error: Incorrect String Format for name', 404)
        }

        const db = await openDB()
        await updateDB(
            db.transaction(ClientDB.pdfStore, 'readwrite').store,
            key,
            pdfUpdateKeys.name,
            name
        )
    } catch(error) {
        console.log(`Something went wrong updating PDF ${key} name`, error)
    }
}
export async function updateCurrentPage(key, currentPage) { await updatePage(key, pdfUpdateKeys.currentPage, currentPage) }
export async function updateLastWeekLatestPage(key, lastWeekLatestPage) { await updatePage(key, pdfUpdateKeys.lastWeekLatestPage, lastWeekLatestPage) }
export async function updateCurrentWeekLatestPage(key, currentWeekLatestPage) { await updatePage(key, pdfUpdateKeys.currentWeekLatestPage, currentWeekLatestPage) }
export async function updateAutoSaveOn(key, autoSaveOn) { updateBoolean(key, pdfUpdateKeys.autoSaveOn, autoSaveOn) }
export async function updateProgressNotificationOn(key, progressNotificationOn) { updateBoolean(key, pdfUpdateKeys.progressNotificationOn, progressNotificationOn) }

// creates new bookmark to pdf with primaryKey: key
// key: primaryKey of pdf record
// id: application generated id of bookmark
// name: name of bookmark
// page: page of bookmark
export async function createBookmark(key, id, name, page) {
    try {
        if (incorrectStringFormat(id)) {
            throw new CodeError('Bookmark id ought to be a nonempty stirng', 404)
        }

        if (incorrectStringFormat(name)) {
            throw new CodeError('Name ought to be a nonempty string', 404)
        }

        checkIncorrectPageFormat(page)

        const db = await openDB()
        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store
        const pdf = await pdfStore.get(key)

        pdf.bookmarks.push(
            {
                id: id,
                name: name,
                page: page
            }
        )

        await pdfStore.put(pdf, key)
    } catch (error) {
        console.log(`Something went wrong creating PDF ${key}'s new bookmark`, error)
    }
}

// updates a bookmark of id: id, with values
// key: key of pdf record
// id: id of bookmark to update
// name: name of bookmark
// page: page of bookmark
export async function updateBookmark(key, id, name, page) {
    try {
        if (incorrectStringFormat(id)) {
            throw new CodeError('Bookmark id ought to be a nonempty string', 404)
        }
        
        if (incorrectStringFormat(name)) {
            throw new CodeError('Name ought to be a string', 404)
        }

        checkIncorrectPageFormat(page)

        const db = await openDB()
        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store
        const pdf = await pdfStore.get(key)

        pdf.bookmarks = pdf.bookmarks.map(bookmark => {
            if (bookmark.id === id) {
                return {
                    name: name,
                    page: page,
                    ...bookmark
                }
            }
            return bookmark
        })

        await pdfStore.put(pdf, key)
    } catch (error) {
        console.log(`Something went wrong updating PDF ${key}'s Bookmark: ${id}`, error)
    }
}


// deletes a bookmark in pdf with primaryKey: key
// key: primaryKey of pdf record
// id: application generated id of bookmark
export async function deleteBookmark(key, id) {
    try {
        if (incorrectStringFormat(id)) {
            throw new CodeError('Bookmark id ought to be a stirng', 404)
        }

        const db = await openDB()
        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store
        const pdf = await pdfStore.get(key)

        pdf.bookmarks = pdf.bookmarks.filter(bookmark => bookmark.id !== id)

        await pdfStore.put(pdf, key)
    } catch (error) {
        console.log(`Something went wrong deleting PDF ${key}'s Bookmark: ${id}`, error)
    }
}

// gets pdf with key
export async function getWithKey(key) {
    try {
        const db = await openDB()
        return await db.get(ClientDB.pdfStore, key)    
    } catch (error) {
        console.log(`Something went wrong getting PDF ${key}`)
    }
}

// gets pdf with file name index
export async function getWithFile(file_path) {
    try {
        const db = await openDB()
        return await db.getFromIndex(ClientDB.pdfStore, 'file_path', file_path)
    } catch (error) {
        console.log(`Something went wrong getting PDF in ${file_path}`)
    }
}

// add a PDF to pdfs Object Store
// name: name of PDF
// filePath: filepath of PDF
// length: length in pages of pdf
export async function add(
    name,
    filePath,
    length
) {
    try {
        if (incorrectStringFormat(name)) {
            throw new CodeError('Error creating PDF: name must be a non empty string', 404)
        }
        if (incorrectStringFormat(filePath)) {
            throw new CodeError('Error creating PDF: file path must be a non empty string', 404)
        }
        if (notInteger(length)
        || length < 1) {
            throw new CodeError('Error creating PDF: length of pdf must be a number > 0', 404)
        }

        const db = await openDB()

        const pdf =
        {
            name: name,
            file_path: filePath,
            current_page: 0,
            length: length,
            last_week_latest_page: 0,
            current_week_latest_page: 0,
            bookmarks: [],
            auto_save_on: true,
            progress_notification_on: false
        }

        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store
        
        await pdfStore.add(pdf)
    } catch (error) {
        console.log("Something went wrong adding a PDF", error)
    }
}

// returns a list of all PDF Objects including the primary key as key: key.
// inside each returned Object.
export async function getAllWithPrimaryKey() {
    try {
        const db = await openDB()
        const pdfs = []

        let cursor = await db.transaction(ClientDB.pdfStore).store.openCursor()

        while (cursor) {
            pdfs.push({key: cursor.key, ...cursor.value})
            cursor = await cursor.continue()
        }

        return pdfs
    } catch (error) {
        console.log("Something went wrong reading PDFs", error)
    }
}

// returns a list of all PDF Objects EXCLUDING the primary key value.
// only has the values stored in each record.
export async function getAll() {
    try {
        const db = await openDB()
        const pdfStore = db.transaction(ClientDB.pdfStore).store

        const pdfs = await pdfStore.getAll()

        return pdfs
    } catch (error) {
        console.log("Something went wrong reading PDFs", error)
    }
}

// batch update a pdf record of key: key
// with a values object of key, value pairs to update
export async function update(key, values) {
    try {
        const db = await openDB()

        const pdfStore = db.transaction(ClientDB.pdfStore, 'readwrite').store

        await batchUpdate(
            pdfStore, 
            key, 
            values, 
            expectedPDFUpdateKeys
        )

    } catch (error) {
        console.log("Something went wrong updating PDF", error)
    }
}

// removes pdf of key: key
export async function remove(key) {
    try {
        if (notInteger(key)) {
            throw new CodeError('key ought to be an integer', 404)
        }
        const db = await openDB()
        const tx = db.transaction([ClientDB.pdfStore, ClientDB.deleteStore], 'readwrite')

        const pdfStore = tx.objectStore(ClientDB.pdfStore)
        const deleteStore = tx.objectStore(ClientDB.deleteStore)

        // first add pdf's file to delete store
        const pdf = await pdfStore.get(key)
        await addToDeleteStore(pdf.file_path, deleteStore)

        await pdfStore.delete(key)
    } catch (error) {
        console.log("Something went wrong deleting PDF", error)
    }
}