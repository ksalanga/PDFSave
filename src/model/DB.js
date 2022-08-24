import { openDB as openIDB, deleteDB as deleteIDB } from "idb";
import { defaultUser, dummyUser } from './Users'
import { dummyPDF, dummyPDFs } from './PDFs'

const devEnvironment = process.env.REACT_APP_ENVIRONMENT === 'DEVELOPMENT'

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
 * - deleted_pdfs (see Deletes.js)
 * **/

export const ClientDB = {
    name: 'PDFSaveProto',
    version: 1,
    pdfStore: 'pdfs',
    userStore: 'users',
    deleteStore: 'deletes'
}

export async function openDB() {
    return await openIDB(ClientDB.name, ClientDB.version, {
        upgrade(db) {
            db.createObjectStore('users', { autoIncrement: true })
            const pdfStore = db.createObjectStore('pdfs', { autoIncrement: true })

            pdfStore.createIndex('file_path', 'file_path', { unique: true })

            db.createObjectStore('deletes', { keyPath: 'file_path' })
        }
    })
}

export async function initDB() {
    try {
        const db = await openDB()

        console.log(`initializing ${ClientDB.name} database...`)

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

        console.log('initialization complete!')
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
    
        await store.put(record)
    } catch (error) {
        throw 'Something went wrong updating record', error
    }
}


// batch update multiple key, values in a specific store to a single write transaction
// key: key of the record in object store we want to update
// store: Object Store
// values: Object of key,values pairs that we wish to update in our object store
// expectedKeys: list of string keys that this stores allows to update 
export async function batchUpdate(store, key, values, expectedKeys) {
    try {
        const valueKeys = Object.keys(values)

        if (valueKeys.length > expectedKeys.length )
        {
            throw `Error: updating more keys than expected for this record`
        }

        valueKeys.forEach((valueKey) => {
            if (!expectedKeys.includes(valueKey)) {
                throw `Error: ${valueKey} is not a key that you can update in this record`
            }
        })

        const record = await store.get(key)
    
        valueKeys.forEach((key) => {
            record[key] = values[key]
        })
    
        await store.put(record, key)
    } catch (error) {
        throw 'Something went wrong batch updating values in store:', error
    }
}

export async function deleteDB() {
    const deletePromise = await deleteIDB(ClientDB.name)

    console.log(`deleting ${ClientDB.name} database...`)
    await deletePromise()
    console.log('deletion complete!')
}