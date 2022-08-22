import {PDF, dummyPDFs} from './PDF'

const dummyUsers = [
    {
        phoneNumber: '+123456789'
    }
]

// This is what our customer data looks like.
var customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
];

// Open the database
const request = window.indexedDB.open('PDFSaveProto', 1)

// This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
    const db = event.target.result

    db.createObjectStore('users', { autoIncrement: true })
    db.createObjectStore('pdfs', {autoIncrement: true})

    const transaction = event.target.transaction

    const users = transaction.objectStore('users')
    const pdfs = transaction.objectStore('pdfs')

    // initialize pdfs in upgrade (not good practice only for development purposes)
    dummyUsers.forEach((user) => {
        users.add(user)
    })

    dummyPDFs.forEach((pdf) => {
        pdfs.add(pdf)
    })
};

request.onsuccess = (event) => {
    const db = event.target.result
    
    // read from users object store
    const users = db.transaction('users').objectStore('users')
    
    // retrieve all users
    users.getAll().onsuccess = (event) => {
        console.log(`Got all users: ${event.target.result}`)
    }
};

PDF()

request.onerror = (event) => {
    console.log('Error opening database');
};