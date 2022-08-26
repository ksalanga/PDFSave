import 'dotenv/config.js'
import "fake-indexeddb/auto";
import { initDB } from "../model/DB";
import { get as getUser } from "../model/Users"
import { dummyUser } from "./DummyData"
import { generateRandomString, generateRandomInt } from './utils/Random';

// run test: npx jest

// Jest by default runs in a node environment, so our 
// - indexedDB isn't running on a DOM (indexedDB requires it)
//     - to solve this, refer to Jest + IndexedDB setup:
// - react environment variables weren't being imported.
//     - to solve this, run the dotenv config by importing 'dotenv/config.js'
//     - this gives us all of our environment variables

// Jest + IndexedDB set up:
// https://dev.to/andyhaskell/testing-your-indexeddb-code-with-jest-2o17

// Jest ES6 support set up:
// https://stackoverflow.com/a/52224329

jest.setTimeout(1000)

beforeEach(
async () => {
    await initDB()
})

// for clearing fake indexeddb (in memory idb) databases
// https://github.com/dumbmatter/fakeIndexedDB/issues/2
afterEach(
async () => {
    await indexedDB._databases.clear()
})

describe('Development Client DB Tests', () => {

            const name = generateRandomString(7)
            const filePath = generateRandomString(10)
            const length = generateRandomInt(50)


describe('Production ClientDB Tests', () => {
    beforeAll(async () => {
        process.env.REACT_APP_ENVIRONMENT = 'PRODUCTION'
        await initDB()
    })

    afterAll(async() => {
        await deleteDB()
    })

    test('Default User is initialized with default values', async () => {
        const user = await getUser(1)

        expect(user).toStrictEqual(dummyUser)
    })
    
    test("Default User's keys are the correct types", async () => {
        const user = await getUser(1)

        for (var key in Object.keys(user)) {
            expect(typeof(user[key])).toEqual(userKeyTypes[key])
        }
    })
})