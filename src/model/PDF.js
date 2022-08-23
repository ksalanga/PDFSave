import { openDB, PDFSaveDB } from './DB'
import uniqid from 'uniqid'

var id = uniqid()

export var dummyPDF =  
{
    name: `pdf${id}`,
    file_path: `/pdf/pdf${id}.pdf`,
    bookmarks: [
        {
            id: 1,
            name: 'Bookmark 1',
            page: 1
        },
    ],
    progressNotification: false,
    autoSavePage: true
}

// TODO (Kenny): Delete dummy PDF array later
export var dummyPDFs = [
    {
        name: 'PDF 1',
        file_path: '/pdf/pdf1.pdf',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: 2,
                name: 'Bookmark 2',
                page: 2
            },
            {
                id: 3,
                name: 'Bookmark 3',
                page: 3
            },
            {
                id: 4,
                name: 'Bookmark 4',
                page: 4
            },
            {
                id: 5,
                name: 'Bookmark 5',
                page: 5
            },
        ],
        progressNotification: false,
        autoSavePage: true
    },
    {
        name: 'PDF 2',
        file_path: '/pdf/pdf2.pdf',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: 2,
                name: 'Bookmark 2',
                page: 2
            }
        ],
        progressNotification: false,
        autoSavePage: true
    },
    {
        name: 'PDF 3',
        file_path: '/pdf/pdf3.pdf',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
        ],
        progressNotification: false,
        autoSavePage: true
    }
]

export async function getWithKey(key) {
    try {
        const db = await openDB()
        return await db.get(PDFSaveDB.pdfStore, key)    
    } catch (error) {
        console.log(`Something went wrong getting PDF ${key}`)
    }
}

export async function getWithFile(file_path) {
    try {
        const db = await openDB()
        return await db.getFromIndex(PDFSaveDB.pdfStore, 'file_path', file_path)
    } catch (error) {
        console.log(`Something went wrong getting PDF in ${file_path}`)
    }
}

// add a PDF to pdfs Object Store
export async function add(pdf) {
    try {
        const db = await openDB()
        const pdfStore = db.transaction(PDFSaveDB.pdfStore, 'readwrite').store

        await pdfStore.add(pdf)
    } catch (error) {
        console.log("Something went wrong adding a PDF", error)
    }
}

// grab a list of PDFs
export async function list() {
    try {
        const db = await openDB()
        const pdfs = []

        let cursor = await db.transaction(PDFSaveDB.pdfStore).store.openCursor()

        while (cursor) {
            pdfs.push({key: cursor.key, ...cursor.value})
            cursor = await cursor.continue()
        }

        return pdfs
    } catch (error) {
        console.log("Something went wrong reading PDFs", error)
    }
}

export async function update(key, values) {
    try {
        const db = await openDB()
        const pdfStore = db.transaction(PDFSaveDB.pdfStore, 'readwrite').store
        const pdf = await pdfStore.get(key)
    
        const valueKeys = Object.keys(values)
    
        valueKeys.forEach((key) => {
            pdf[key] = values[key]
        })

        await pdfStore.put(pdf, key)

        console.log('successfully updated pdf', key)
    } catch (error) {
        console.log("Something went wrong updating PDF", error)
    }
}

export async function remove(key) {
    try {
        const db = await openDB()
        const pdfStore = db.transaction(PDFSaveDB.pdfStore, 'readwrite').store
        await pdfStore.delete(key)
    } catch (error) {
        console.log("Something went wrong deleting PDF", error)
    }
}