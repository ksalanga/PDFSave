import 'dotenv/config.js';
import "fake-indexeddb/auto";
import { dummyPDFs, dummyUser } from "./DummyData";
import { initDB } from "../model/DB";
import { defaultUser, get as getUser, update as updateUser, expectedUserKeyTypes } from "../model/Users";
import { 
    add as addPDF,
    expectedPDFKeyTypes,
    getAll as getAllPDFs,
    pdfUpdateKeys,
    getWithKey as getPDFWithKey,
    updateName as updatePDFName,
    updateCurrentPage as updatePDFCurrentPage,
    updateLastWeekLatestPage as updatePDFLastWeekLatestPage,
    updateCurrentWeekLatestPage as updatePDFCurrentWeekLatestPage,
    updateAutoSaveOn as updatePDFAutoSaveOn,
    updateProgressNotificationOn as updatePDFProgressNotificationOn
} from "../model/PDFs";
import { generateRandomString, generateRandomInt, generateRandomBoolean } from './utils/Random';
import {jest} from '@jest/globals';
import { indexedDB } from "fake-indexeddb";
import cloneDeep from 'lodash.clonedeep';

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

// for clearing fake indexeddb (in memory idb) databases
// https://github.com/dumbmatter/fakeIndexedDB/issues/2
afterEach(
async () => {
    await indexedDB._databases.clear()
})

// NOTE: Difference between Development DB and Production DB are the initial values in the object stores.
// both have the same Object Stores (PDF, User, Deleted) and Database (ClientDB)
// Differences:
// Development DB:
// - Initializes PDF store with three Dummy PDFs
// - Initializes a dummyUser with dummy Data
// Production DB:
// - Initializes no PDFs in store
// - Initializes a defaultUser with default user configuration values
// Other than that, functionality for both is virtually the same

describe('Development Client DB Tests', () => {
    beforeEach(
    async () => {
        await initDB()
    })

    describe.skip('User tests',
    () =>
    {
        test('Dummy User is initialized with correct values in DB',
        async () => 
        {
            const dummyDBuser = await getUser(1)
            expect(dummyDBuser).toStrictEqual(dummyUser)
        })
        
        test('Dummy User\'s keys are the correct types', 
        async () => 
        {
            const dummyDBuser = await getUser(1)
            const userKeys = Object.keys(dummyDBuser)
    
            userKeys.forEach((key) => {
                expect(typeof(dummyDBuser[key])).toEqual(expectedUserKeyTypes[key])
            })
        })

        test(`Updating some of a user's keys:
        (phone_numer, email, and progress notifications on)
        via batch updating correctly updates the user store in the ClientDB`,
        async () =>
        {
            
            const someUpdateValues =
            {
                phone_number: '202-555-0177',
                email: 'updatedemail@email.com',
                progress_notification_on: true
            }

            const dummyUpdateUser =
            {
                ...dummyUser,
                ...someUpdateValues
            }

            await updateUser(1, someUpdateValues)

            const updatedDBUser = await getUser(1)

            expect(updatedDBUser).toStrictEqual(dummyUpdateUser)
        })

        test.only(`Batch updating all of a user's keys gives us the correct types
        for each corresponding value`, 
        async () =>
        {
            const allUpdateValues = 
            {
                name: 'updatedName',
                phone_number: '202-555-0177',
                email: 'updatedemail@email.com',
                progress_notification_on: true
            }

            await updateUser(1, allUpdateValues)

            const updatedDBUser = await getUser(1)
            
            const updatedDBUserKeys = Object.keys(updatedDBUser)

            updatedDBUserKeys.forEach((key) =>
            {
                const updatedValue = updatedDBUser[key]
                const updatedValueType = typeof(updatedValue)

                const expectedValueType = expectedUserKeyTypes[key]

                expect(updatedValueType).toEqual(expectedValueType)
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
        
        test("Adding a PDF results in correct initial values",
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

        test("Adding a PDF has correct types for each value",
        async () => 
        {
            const name = generateRandomString(7)
            const filePath = generateRandomString(10)
            const length = generateRandomInt(50)

            await addPDF(name, filePath, length)
            const createdDbPDF = await getPDFWithKey(4)

            const createdDbPDFKeys = Object.keys(createdDbPDF)

            createdDbPDFKeys.forEach((key) =>
            {
                const dbValue = createdDbPDF[key]
                const dbValueType = typeof(dbValue)

                const expectedValueType = expectedPDFKeyTypes[key]

                expect(dbValueType).toEqual(expectedValueType)
            })
        })

        /** 
         * Reusable function for all primitive type field updates in the pdf store that guarantees.
         * that each PDF record in the store gets their expected key and value updated.
         * 
         * Will update all PDFs in the store with the same key value
         * and asser that they have been correctly updated in the db.
         * 
         * params:
         * - updateFunction (callback function)
         * - field (string) - the pdf record’s field we want to update and expect to change
         * **/
        const updatePrimitiveTypeTest = async (updatePDFfunction, field) =>
        {
            const expectedPDFs = cloneDeep(dummyPDFs)

            let key = 1

            for (const pdf of expectedPDFs)
            {
                let randomUpdatedValue

                switch (expectedPDFKeyTypes[field])
                {
                    case 'string':
                        randomUpdatedValue = generateRandomString(10)
                        break
                    case 'number':
                        randomUpdatedValue = generateRandomInt(100)
                        break
                    case 'boolean':
                        randomUpdatedValue = generateRandomBoolean()
                        break
                    default:
                        console.log('default')
                        randomUpdatedValue = generateRandomInt(100)
                }

                pdf[field] = randomUpdatedValue

                await updatePDFfunction(key, randomUpdatedValue)

                key++
            }

            const dbPDFs = await getAllPDFs()

            expect(dbPDFs).toStrictEqual(expectedPDFs)
        }

        test.only("Updating name succesfully changes name value for each pdf record in pdf store.",
        async () =>
        {
            await updatePrimitiveTypeTest(updatePDFName, pdfUpdateKeys.name)
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

describe.skip('Production ClientDB Initialization Tests', () => {
    beforeEach(async () => {
        process.env.REACT_APP_ENVIRONMENT = 'PRODUCTION'
        await initDB()
    })

    test('Default User is initialized with default values', async () => {
        const user = await getUser(1)
        expect(user).toStrictEqual(defaultUser)
    })
    
    test("Default User's keys are the correct types", async () => {
        const user = await getUser(1)

        const userKeys = Object.keys(user)

        userKeys.forEach((key) => {
            expect(typeof(user[key])).toEqual(expectedUserKeyTypes[key])
        })
    })

    test("Production PDF Store starts with no records",
    async () =>
    {
        const pdfs = await getAllPDFs()

        expect(pdfs.length).toEqual(0)
    })
})