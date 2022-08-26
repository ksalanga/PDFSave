import 'dotenv/config.js'
import "fake-indexeddb/auto";
import { dummyUser } from "./DummyData"
import { add as addPDF, getAll as getAllPDFs, getWithKey as getPDFWithKey } from "../model/PDFs";
import { deleteDB, initDB } from "../model/DB";
import { defaultUser, get, get as getUser, userKeyTypes } from "../model/Users"
import { generateRandomString, generateRandomInt } from './utils/Random';
import {jest} from '@jest/globals'
import { indexedDB } from "fake-indexeddb";

// run test: npx jest --detectOpenHandles --watch --verbose false

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
    describe('User tests',
    () =>
    {
        test('Dummy User is initialized with correct values',
        async () => 
        {
            const user = await getUser(1)
            expect(user).toStrictEqual(dummyUser)
        })
        
        test("Dummy User's keys are the correct types", 
        async () => 
        {
            const user = await getUser(1)
            const userKeys = Object.keys(user)
    
            userKeys.forEach((key) => {
                expect(typeof(user[key])).toEqual(userKeyTypes[key])
            })
        })
    }) 
    
    describe('PDF tests',
    () =>
    {
        const initialValues =
        {
            current_page: 0,
            last_week_latest_page: 0,
            current_week_latest_page: 0,
            bookmarks: [],
            auto_save_on: true,
            progress_notification_on: false,
        }

        test("Adding a PDF results in correct initial fields",
        async () =>
        {
            const name = generateRandomString(7)
            const filePath = generateRandomString(10)
            const length = generateRandomInt(50)

            const dummyCreatePDF =
            {
                name: name,
                file_path: filePath,
                length: length,
                ...initialValues
            }

            await addPDF(name, filePath, length)
            const createdDBPDF = await getPDFWithKey(4)
            const pdfs = await getAllPDFs()

            expect(createdDBPDF).toStrictEqual(dummyCreatePDF)
            expect(pdfs.length).toEqual(4)
        })

        test("Amount of items in a freshly reset PDF store is 3", 
        async () => 
        {
            const pdfs = await getAllPDFs()
            expect(pdfs.length).toEqual(3)
            console.log('finished getting items')
        })
    })
})


describe.skip('Production ClientDB Tests', () => {
    beforeEach(async () => {
        process.env.REACT_APP_ENVIRONMENT = 'PRODUCTION'
        await initDB()
    })

    test('Default User is initialized with default values', async () => {
        const user = await getUser(1)
        expect(user).toStrictEqual(dummyUser)
    })
    
    test("Default User's keys are the correct types", async () => {
        const user = await getUser(1)

        const userKeys = Object.keys(user)

        userKeys.forEach((key) => {
            expect(typeof(user[key])).toEqual(userKeyTypes[key])
        })
    })
})