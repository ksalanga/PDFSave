import { openDB, ClientDB, batchUpdate } from './DB'

/**
 * Users Object Store for the Client Database
 * 
 * description:
 * holds record of a user's name, phone number, and email for notification purposes.
 * since this DB is local and there is no login system yet,
 * Version 1 of the user object store will only hold ONE user. This one user is the local user and is key 1.
 * 
 * user record in Object Store keys:
 * - primary_key (number) - indexedDB auto generated key.
 * - name (string) - name of user.
 * - phone_number (string) - phone number of user for notification purposes.
 * - email (string) - email of user for notification purposes (might not be used).
 * 
 * (see defaultUser const in this module for starting default values)
 *  **/

export const dummyUser = 
{
    name: 'CoolPerson',
    phone_number: '+12345678912',
    email: 'email@email.com'
}

export const defaultUser =
{
    name: 'user',
    phone_number: '',
    email: ''
}

// const values for user record keys that can be updated
export const userUpdateKeys = 
{
    name: 'name',
    phoneNumber: 'phone_number',
    email: 'email'
}

// expected keys list that can be updated
// ex: name, phone_number, etc.
const expectedUserUpdateKeys = Object.values(userUpdateKeys)

// get user
export async function get(key) {
    try {
        const db = await openDB()
        return await db.get(ClientDB.userStore, key)    
    } catch (error) {
        console.log(`Something went wrong getting User ${key}`)
    }
}

// update user
export async function update(key, values) {
    try {
        const db = await openDB()
        const userStore = db.transaction(ClientDB.userStore, 'readwrite').store

        await batchUpdate (
            userStore,
            key,
            values,
            expectedUserUpdateKeys
        )
    } catch (error) {
        console.log("Something went wrong updating user", error)
    }
}