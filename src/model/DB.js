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


export async function deleteDB() {
    const deletePromise = await deleteIDB(ClientDB.name)

    console.log(`deleting ${ClientDB.name} database...`)
    await deletePromise()
    console.log('deletion complete!')
}