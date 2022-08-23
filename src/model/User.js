import { openDB, PDFSaveDB } from './DB'

export const dummyUsers = [
    {
        name: 'CoolPerson',
        phoneNumber: '+123456789',
        email: 'email@email.com'
    }
]

// get user
export async function get(key) {
    try {
        const db = await openDB()
        return await db.get(PDFSaveDB.userStore, key)    
    } catch (error) {
        console.log(`Something went wrong getting User ${key}`)
    }
}

// update user
export async function update(key) {
    try {
        const db = await openDB()
        const userStore = db.transaction(PDFSaveDB.userStore, 'readwrite').store
        const user = await userStore.get(key)
    
        const valueKeys = Object.keys(values)
    
        valueKeys.forEach((key) => {
            user[key] = values[key]
        })

        await userStore.put(user, key)

        console.log('successfully updated user', key)
    } catch (error) {
        console.log("Something went wrong updating user", error)
    }
}