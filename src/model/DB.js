import { openDB as openIDB, deleteDB as deleteIDB } from "idb";
import { dummyUsers } from './User'
import { dummyPDF, dummyPDFs } from './PDF'

const devEnvironment = process.env.REACT_APP_ENVIRONMENT === 'DEVELOPMENT'

export const PDFSaveDB = {
    name: 'PDFSaveProto',
    version: 1,
    pdfStore: 'pdfs',
    userStore: 'users'
}

export async function openDB() {
    return await openIDB(PDFSaveDB.name, PDFSaveDB.version, {
        upgrade(db) {
            db.createObjectStore('users', { autoIncrement: true })
            const pdfStore = db.createObjectStore('pdfs', { autoIncrement: true })

            pdfStore.createIndex('file_path', 'file_path', { unique: true })
        }
    })
}

export async function initDB() {
    try {
        const db = await openDB()

        console.log(`initializing ${PDFSaveDB.name} database...`)

        const userStore = db.transaction('users', 'readwrite').store
        const users = await userStore.getAll()

        const userExists = users.length > 0
        if (!userExists) {
            if (!devEnvironment) {
                await userStore.add({
                    name: 'user',
                    phone_number: '',
                    email: ''
                })
            }

            if (devEnvironment) {
                await userStore.add(dummyUsers[0])
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
    const deletePromise = await deleteIDB(PDFSaveDB.name)

    console.log(`deleting ${PDFSaveDB.name} database...`)
    await deletePromise()
    console.log('deletion complete!')
}