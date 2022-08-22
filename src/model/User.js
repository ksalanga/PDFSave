import {PDF, dummyPDFs} from './PDF'

const users = [
    {
        phoneNumber: '+123456789'
    }
]

// Open the database
const request = window.indexedDB.open('PDFSaveProto', 1)

// This event is only implemented in recent browsers
request.onupgradeneeded = async (event) => {
    console.log('upgrade')
    console.log('DB')

    const db = event.target.result;

    const userStore = db.createObjectStore('users', {autoIncrement: true})

    users.forEach((user) => {
        userStore.add(user)
    })

    const pdfStore = db.createObjectStore('pdfs', {autoIncrement: true})

    dummyPDFs.forEach((pdf) => {
        pdfStore.add(pdf)
    })

    // userStore.transaction.oncomplete = (event) => {
    //     const userObjectStore = db.transaction('users', 'readwrite').objectStore('users')
        
    //     users.forEach((user) => {
    //         userObjectStore.add(user)
    //     })
        
    //     const pdfStore = db.createObjectStore('pdfs', {autoIncrement: true})

    //     pdfStore.transaction.oncomplete = (event) => {
    //         const pdfStore = db.transaction('pdfs', 'readwrite').objectStore('pdfs')
    //         const pdfs = dummyPDFs
            
    //         pdfs.forEach((pdf) => {
    //             pdfStore.add(pdf)
    //         });
    //         console.log("pdf store creation complete")
    //     }
    // }
    
    console.log('User and PDF Object Stores created!')
};

request.onsuccess = (event) => {
    console.log('success trying to retrieve store user')
    const db = event.target.result
    
    // retrieve all users
    const users = db.transaction('users').objectStore('users')
    
    users.getAll().onsuccess = (event) => {
        console.log(`Got all users: ${event.target.result[0].phoneNumber}`)
    }
};

PDF()

request.onerror = (event) => {
    console.log('Error opening database');
};