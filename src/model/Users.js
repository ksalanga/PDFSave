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
 * - progress_notification_on (boolean) - if it's on, users will get emails or texts about their reading progression
 * 
 * (see defaultUser const in this module for starting default values)
 *  **/

export const defaultUser =
{
    name: 'user',
    phone_number: '',
    email: '',
    progress_notification_on: false
}

// expected keys and type pairs for a User model
export const userKeyTypes =
{
    name: 'string',
    phone_number: 'string',
    email: 'string',
    progress_notification_on: 'boolean'
}

// const values for user record keys that can be updated in the object store
// where the key is our "enumeration"/ access to all possible update keys
// and the value is the actual key value inside the record
export const userUpdateKeys = 
{
    name: 'name',
    phoneNumber: 'phone_number',
    email: 'email',
    progressNotificationOn: 'progress_notification_on'
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