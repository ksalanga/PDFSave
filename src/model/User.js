let db

const users = [
    {
        phoneNumber: '+123456789'
    }
]

// Open the database
const request = window.indexedDB.open('PDFSaveProto', 1)

request.onsuccess = (event) => {
    db = event.target.result
    console.log('Database opened successfully');
};

// This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('users', {autoIncrement: true})
};

request.onerror = (event) => {
    console.log('Error opening database');
};