let db

const pdfs = [
    {
        id: 1,
        file: '/pdf/pdf1.pdf',
    },
    {
        id: 2,
        file: '/pdf/pdf2.pdf',
    }
]

// Open the database
const request = window.indexedDB.open('TestDBUpgrade', 1)

request.onsuccess = (event) => {
    db = event.target.result
    console.log('Database opened successfully');
}

// This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('pdfs', {autoIncrement: true})
    console.log('Database created successfully')
}

request.onerror = (event) => {
    console.log('Error opening database');
}