
// TODO (Kenny): Delete dummy PDF array later
export var dummyPDFs = [
    {
        id: 1,
        name: 'PDF 1',
        file: '/pdf/pdf1.pdf',
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
        id: 2,
        name: 'PDF 2',
        file: '/pdf/pdf2.pdf',
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
        id: 3,
        name: 'PDF 3',
        file: '/pdf/pdf3.pdf',
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

export function PDF() {
    const request = window.indexedDB.open('PDFSaveProto', 1)
    
    request.onsuccess = (event) => {
        // console.log('success trying to retrieve store PDF')
    
        const db = event.target.result

        // read from pdfs object store
        const pdfs = db.transaction('pdfs').objectStore('pdfs')

        // retrieve all pdfs
        pdfs.getAll().onsuccess = (event) => {
            console.log(`Got all pdfs: ${event.target.result}`)
        }
    };
}