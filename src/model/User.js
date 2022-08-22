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
    // gotten access to the database object that we have requested
    const db = event.target.result;
    
    // the reason we add 'complete' event listeners to each object store is because 
    // if we only use the oncomplete method that this db's transaction has:
        // ex: db.createObjecStore('store1').transaction.oncomplete((e) => {...})
        // ex: db.createObjecStore('store2').transaction.oncomplete((e) => {...})
    // the second object store will overwrites the oncomplete method because
    // both object stores are referring to the same transaction (version change) 
    // (https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction#mode_constants)
    // so the oncomplete method will only be called once
    
    // so for each new object store created within the single transaction, we have to add a new event listener 
    // that listens for when each object store has been completed
    // more info:
    // https://stackoverflow.com/questions/34156045/how-create-data-to-two-store-in-indexeddb-in-onupgradeneeded/34162457#34162457

    db.createObjectStore('users', { autoIncrement: true })
    .transaction // transaction refers to our version change transaction: 
    .addEventListener('complete',
        (e) => {
            console.log("complete users")
            const users = db.transaction('users', 'readwrite', {durability: 'strict'}).objectStore('users')

            dummyUsers.forEach((user) => {
                users.add(user)
            })
        }
    )


    db.createObjectStore('pdfs', {autoIncrement: true})
    .transaction
    .addEventListener('complete', 
        (e) => {
            const pdfs = db.transaction('pdfs', 'readwrite', {durability: 'strict'}).objectStore('pdfs')

            dummyPDFs.forEach((pdf) => {
                pdfs.add(pdf)
            })
        }
    )

    console.log(db.createObjectStore('test', {autoIncrement:true}).transaction.mode)
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