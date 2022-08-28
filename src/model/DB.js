import { openDB as openIDB, deleteDB as deleteIDB } from "idb";
import { defaultUser } from './Users'
import { dummyUser, dummyPDFs } from "../tests/DummyData";
import { CodeError } from "../view/utils/Error";

/** 
 * Client Database
 * 
 * description:
 * Client side storage using IndexedDB w/ Promise based IDB API.
 * For local and offline usage in saving PDF data and user phone numbers to send progress notifications if they opt in.
 * 
 * Version: 1
 * 
 * Object Stores:
 * - users (see Users.js for more info)
 * - pdfs (see PDFs.js for more info)
 * - deletedFiles (see DeletedFiless.js)
 * **/

/**
 * Object where you can access data about the Client DB's
 * Name, version, and store names
 */
export const ClientDB = {
    name: 'ClientDB',
    version: 1,
    pdfStoreName: 'pdfs',
    userStoreName: 'users',
    deletedFileStoreName: 'deletedFiles'
}

export async function openDB() {
    return await openIDB(ClientDB.name, ClientDB.version, {
        upgrade(db) {
            db.createObjectStore(ClientDB.userStoreName, { autoIncrement: true })
            const pdfStore = db.createObjectStore(ClientDB.pdfStoreName, { autoIncrement: true })

            pdfStore.createIndex('file_path', 'file_path', { unique: true })
            pdfStore.createIndex('progress_notification_on', 'progress_notification_on', { unique: false })

            db.createObjectStore(ClientDB.deletedFileStoreName, { keyPath: 'file_path' })
        }
    })
}

export async function initDB() {
    try {
        const devEnvironment = process.env.REACT_APP_ENVIRONMENT === 'DEVELOPMENT'
        const db = await openDB()

        const userStore = db.transaction('users', 'readwrite').store
        const users = await userStore.getAll()

        const userExists = users.length > 0
        if (!userExists) {
            if (!devEnvironment) {
                await userStore.add(defaultUser)
            }

            if (devEnvironment) {
                await userStore.add(dummyUser)
            }
        }

        const pdfStore = db.transaction('pdfs', 'readwrite').store
        const pdfs = await pdfStore.getAll()
        
        const pdfsExist = pdfs.length > 0
        if (devEnvironment && !pdfsExist) {
            dummyPDFs.forEach(async (pdf) => {
                await pdfStore.add(pdf)
            })
        }
    } catch (error) {
        console.log('Something went wrong initializing DB', error)
    }
}


// update a specific key and value within an object store
// store: object Store
// primaryKey: primaryKey of the record in object store we want to update
// key: key of the record we want to update
// value: value of the record we want to update
export async function update(store, primaryKey, key, value) {
    try {
        const record = await store.get(primaryKey)
        record[key] = value
    
        await store.put(record, primaryKey)
    } catch (error) {
        console.log('Something went wrong updating a store', error)
        throw new CodeError('Something went wrong updating record', 404)
    }
}


// batch update multiple key, values in a specific store to a single write transaction
// key: key of the record in object store we want to update
// store: Object Store
// values: Object of key,values pairs that we wish to update in our object store
// expectedKeys: list of string keys that this stores allows to update 
export async function batchUpdate(store, key, values, expectedKeys) {
    try {
        const updateKeys = Object.keys(values)

        if (updateKeys.length > expectedKeys.length) {
            throw new CodeError(`Error: updating more keys than expected for this record`, 404)
        }

        if (updateKeys.length === 0) {
            throw new CodeError('Error: cannot update nothing', 404)
        }

        updateKeys.forEach((updateKey) => {
            if (!expectedKeys.includes(updateKey)) {
                throw new CodeError(`Error: ${updateKey} is not a key that you can update in this record`, 404)
            }
        })

        const record = await store.get(key)
    
        updateKeys.forEach((key) => {
            record[key] = values[key]
        })
    
        await store.put(record, key)
    } catch (error) {
        console.log('Something went wrong batch updating values in store', error)
        throw new CodeError('Something went wrong batch updating values in record', 404)
    }
}

export async function deleteDB() {
    try {
        await deleteIDB(ClientDB.name, {
            blocked(db) {
                db.close()
            }
        })
    } catch (error) {
        console.log('Error deleting Database', error)
    }
}