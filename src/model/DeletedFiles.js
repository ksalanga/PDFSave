import { openDB, ClientDB } from "./DB"

/** 
 * Delete Object Store for the Client Database
 * 
 * description:
 * holds records for all pdf file paths that are deleted so that the app
 * doesn't automatically add the pdf back into the pdfs object store upon reopening.
 * this is a permanent solution for not allowing autosave.
 * 
 * deleted pdf record in Object Store keys:
 * - primary_key (string) - file_path
 * - file_path (string) - file_path of pdf
 * **/

// add a file_path to deleteStore delete Object Store. Only used as a helper function to our PDFStore.
export async function add(file_path, deleteStore) {
    try {
        await deleteStore.add({file_path: file_path})
    } catch (error) {
        console.log("Something went wrong adding PDF to delete store", error)
        throw("Something went wrong adding PDF to delete store")
    }
}

// remove PDF with file path string as a key
export async function remove(file_path) {
    try {
        const db = await openDB()
        const deleteStore = db.transaction(ClientDB.deletedFileStoreName, 'readwrite').store

        await deleteStore.delete(file_path)
    } catch (error) {
        console.log(`Something went wrong removing PDF ${file_path} in delete store`)
    }
}

// add a file_path to deleteStore delete Object Store. Only used as a helper function to our PDFStore.
export async function get(file_path, deleteStore) {
    try {
        await deleteStore.get({file_path: file_path})
    } catch (error) {
        console.log("Something went wrong adding PDF to delete store", error)
        throw("Something went wrong adding PDF to delete store")
    }
}

export async function getAll()
{
    try {
        const db = await openDB()
        const deleteStore = db.transaction(ClientDB.deletedFileStoreName).store

        return await deleteStore.getAll()
    } catch (error) {
        console.log("Something went wrong getting all PDFs from the delete store", error)
    }
}