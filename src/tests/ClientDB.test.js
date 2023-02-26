import 'dotenv/config.js';
import "fake-indexeddb/auto";
import { dummyPDFs, dummyUser } from "./DummyData";
import { initDB } from "../model/DB";
import {
    defaultUser,
    get as getUser,
    update as updateUser,
    expectedUserKeyTypes
} from "../model/Users";
import {
    add as addPDF,
    expectedPDFKeyTypes,
    getAll as getAllPDFs,
    pdfUpdateKeysENUM,
    getUsingPrimaryKey as getPDFUsingPrimaryKey,
    updateName as updatePDFName,
    updateCurrentPage as updatePDFCurrentPage,
    updateLastWeekLatestPage as updatePDFLastWeekLatestPage,
    updateCurrentWeekLatestPage as updatePDFCurrentWeekLatestPage,
    updateAutoOpenOn as updatePDFAutoOpenOn,
    updateProgressNotificationOn as updatePDFProgressNotificationOn,
    update as updatePDF,
    remove as removePDF,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getAllWithProgressNotificationOn as getAllPDFsWithProgressNotificationOn
} from "../model/PDFs";
import { generateRandomString, generateRandomInt, generateRandomBoolean, generateRandomIntFromInterval } from './utils/Random';
import { jest } from '@jest/globals';
import { indexedDB } from "fake-indexeddb";
import cloneDeep from 'lodash.clonedeep';
import {
    getAll as getAllDeletedFilePaths,
    remove as removeDeletedFilePath
} from '../model/DeletedFiles';

// BEFORE RUNNING DEVELOPMENT TESTS: Make sure to include a .env with REACT_APP_ENVIRONMENT = DEVELOPMENT for the indexedDB to generate random values
// run new jest test: yarn run test
// (or npm run test)
// run (OLD) test: npx jest --detectOpenHandles --watch --verbose false

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

    describe('User Store tests',
        () => {
            test('Dummy User is initialized with correct values in DB',
                async () => {
                    const dummyDBuser = await getUser('CoolPerson')
                    expect(dummyDBuser).toStrictEqual(dummyUser)
                })

            test('Dummy User\'s keys are the correct types',
                async () => {
                    const dummyDBuser = await getUser('CoolPerson')
                    const userKeys = Object.keys(dummyDBuser)

                    userKeys.forEach((key) => {
                        expect(typeof (dummyDBuser[key])).toEqual(expectedUserKeyTypes[key])
                    })
                })

            test(`Updating some of a user's keys:
        (phone_numer, email, and progress notifications on)
        via batch updating correctly updates the user store in the ClientDB`,
                async () => {

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

                    await updateUser('CoolPerson', someUpdateValues)

                    const updatedDBUser = await getUser('CoolPerson')

                    expect(updatedDBUser).toStrictEqual(dummyUpdateUser)
                })

            test(`Batch updating all of a user's keys gives us the correct types
        for each corresponding value`,
                async () => {
                    const allUpdateValues =
                    {
                        name: 'updatedName',
                        phone_number: '202-555-0177',
                        email: 'updatedemail@email.com',
                        progress_notification_on: true
                    }

                    await updateUser('CoolPerson', allUpdateValues)

                    const updatedDBUser = await getUser('CoolPerson')

                    const updatedDBUserKeys = Object.keys(updatedDBUser)

                    updatedDBUserKeys.forEach((key) => {
                        const updatedValue = updatedDBUser[key]
                        const updatedValueType = typeof (updatedValue)

                        const expectedValueType = expectedUserKeyTypes[key]

                        expect(updatedValueType).toEqual(expectedValueType)
                    })
                })
        })

    describe('PDF Store tests',
        () => {
            const initialValues =
            {
                current_page: 0,
                last_week_latest_page: 0,
                current_week_latest_page: 0,
                bookmarks: [],
                auto_open_on: true,
                progress_notification_on: false,
            }

            describe('Adding a PDF record',
                () => {
                    test("Adding a PDF results in correct initial values",
                        async () => {
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

                            const pdfKey = await addPDF(name, filePath, length)
                            const createdDBPDF = await getPDFUsingPrimaryKey(filePath)
                            const pdfs = await getAllPDFs()

                            expect(createdDBPDF).toStrictEqual(dummyCreatePDF)
                            expect(pdfs.length).toEqual(4)
                            expect(pdfKey).toEqual(filePath)
                        })

                    test("Adding a PDF has correct types for each value",
                        async () => {
                            const name = generateRandomString(7)
                            const filePath = generateRandomString(10)
                            const length = generateRandomInt(50)

                            await addPDF(name, filePath, length)
                            const createdDbPDF = await getPDFUsingPrimaryKey(filePath)

                            const createdDbPDFKeys = Object.keys(createdDbPDF)

                            createdDbPDFKeys.forEach((key) => {
                                const dbValue = createdDbPDF[key]
                                const dbValueType = typeof (dbValue)

                                const expectedValueType = expectedPDFKeyTypes[key]

                                expect(dbValueType).toEqual(expectedValueType)
                            })
                        })
                })

            describe('Updating PDF record primitive fields',
                () => {
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
                    const updatePrimitiveTypeTest = async (updatePDFfunction, field) => {
                        const expectedPDFs = cloneDeep(dummyPDFs)

                        for (const pdf of expectedPDFs) {
                            let randomUpdatedValue

                            switch (expectedPDFKeyTypes[field]) {
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

                            await updatePDFfunction(pdf['file_path'], randomUpdatedValue)

                            // key++
                        }

                        const dbPDFs = await getAllPDFs()

                        expect(dbPDFs).toStrictEqual(expectedPDFs)
                    }

                    test('Updating name succesfully changes name value for each pdf record in pdf store.',
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFName, pdfUpdateKeysENUM.name)
                        })

                    test(`Updating current Page (int) in PDF store`,
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFCurrentPage, pdfUpdateKeysENUM.currentPage)
                        })

                    test(`Updating last week latest Page (int) in PDF store`,
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFLastWeekLatestPage, pdfUpdateKeysENUM.lastWeekLatestPage)
                        })

                    test(`Updating current week latest Page (int) in PDF store`,
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFCurrentWeekLatestPage, pdfUpdateKeysENUM.currentWeekLatestPage)
                        })

                    test(`Updating autoOpenOn (boolean) in PDF store`,
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFAutoOpenOn, pdfUpdateKeysENUM.autoOpenOn)
                        })

                    test(`Updating progressNotificationOn (boolean) in PDF store`,
                        async () => {
                            await updatePrimitiveTypeTest(updatePDFProgressNotificationOn, pdfUpdateKeysENUM.progressNotificationOn)
                        })
                })

            describe('Getting PDF record(s)',
                () => {
                    test('Getting all initial PDFs in DB are the dummyPDFs',
                        async () => {
                            const pdfs = await getAllPDFs()
                            expect(pdfs).toStrictEqual(dummyPDFs)
                        })

                    test('Getting all initial PDFs in DB has 3 items',
                        async () => {
                            const pdfs = await getAllPDFs()
                            expect(pdfs).toHaveLength(3)
                        })

                    test('Getting all deleted PDFs returns a list of 0 items',
                        async () => {

                            for (const pdf of dummyPDFs) {
                                await removePDF(pdf.file_path)
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toHaveLength(0)
                        })

                    test(`Getting a PDF using its primary key gets us that exact PDF object`,
                        async () => {
                            const primaryKey = '/pdf/pdf2.pdf'
                            const pdf = await getPDFUsingPrimaryKey(primaryKey)

                            // since the index starts at 0, but the auto incremented primaryKeys start at 1,
                            // getting any PDF with key in the list we must use key - 1
                            const expectedPDF = dummyPDFs[1]

                            expect(pdf).toStrictEqual(expectedPDF)
                        })

                    test(`Getting a PDF using a wrong primary key returns undefined`,
                        async () => {
                            const pdf = await getPDFUsingPrimaryKey(60)

                            expect(pdf).toBeUndefined()
                        })

                    test('Getting all PDFs with progress notification on',
                        async () => {
                            const expectedPDFs = cloneDeep(dummyPDFs)

                            const expectedPDFsWithProgressNotificationsOn =
                                expectedPDFs.filter(pdf => pdf.progress_notification_on)

                            const dbPDFsWithProgressNotificationOn = await getAllPDFsWithProgressNotificationOn()

                            expect(dbPDFsWithProgressNotificationOn).toStrictEqual(expectedPDFsWithProgressNotificationsOn)
                        })

                    test('Getting no PDFs with progress notification on gives an empty list',
                        async () => {
                            await removePDF('/pdf/pdf3.pdf')

                            const dbPDFsWithProgressNotificationOn = await getAllPDFsWithProgressNotificationOn()
                            expect(dbPDFsWithProgressNotificationOn).toStrictEqual([])
                        })
                })

            test('Batch update PDF record keys',
                async () => {
                    const expectedPDFs = cloneDeep(dummyPDFs)
                    const expectedPDF = expectedPDFs[0]

                    const expectedPDFUpdateKeys = Object.values(pdfUpdateKeysENUM)

                    const updateValues = {}

                    for (const key of expectedPDFUpdateKeys) {
                        let randomUpdatedValue
                        switch (expectedPDFKeyTypes[key]) {
                            case 'string':
                                randomUpdatedValue = generateRandomString(10)
                                break
                            case 'number':
                                randomUpdatedValue = generateRandomInt(100)
                                break
                            case 'boolean':
                                randomUpdatedValue = generateRandomBoolean()
                                break
                            case 'object':
                                randomUpdatedValue = []
                                break
                            default:
                                randomUpdatedValue = 0
                        }

                        updateValues[key] = randomUpdatedValue
                    }

                    const expectedUpdatedPDF =
                    {
                        ...expectedPDF,
                        ...updateValues
                    }

                    await updatePDF('/pdf/pdf1.pdf', updateValues)

                    const dbPDF = await getPDFUsingPrimaryKey(expectedUpdatedPDF.file_path)

                    expect(dbPDF).toStrictEqual(expectedUpdatedPDF)
                })

            describe('Removing PDF record(s)',
                () => {
                    test('Removing one',
                        async () => {
                            const primaryKey = '/pdf/pdf2.pdf'

                            const expectedPDFs = cloneDeep(dummyPDFs)

                            expectedPDFs.splice(1, 1)

                            await removePDF(primaryKey)

                            const deletedDbPDF = await getPDFUsingPrimaryKey(primaryKey)

                            const pdfs = await getAllPDFs()

                            expect(deletedDbPDF).toBeUndefined()
                            expect(pdfs).toStrictEqual(expectedPDFs)
                        })

                    test('Removing all',
                        async () => {
                            for (const pdf of dummyPDFs) {
                                await removePDF(pdf.file_path)
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toHaveLength(0)
                            expect(pdfs).toStrictEqual([])
                        })
                })

            describe('Bookmarks',
                () => {
                    test('Creating one',
                        async () => {
                            const expectedPDFs = cloneDeep(dummyPDFs)

                            for (const pdf of expectedPDFs) {
                                let id = generateRandomString(20)
                                let name = generateRandomString(30)
                                let page = generateRandomInt(50)

                                const newBookmark =
                                {
                                    id: id,
                                    name: name,
                                    page: page
                                }

                                pdf.bookmarks.push(newBookmark)

                                await createBookmark(pdf['file_path'], id, name, page)
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toStrictEqual(expectedPDFs)
                        })

                    test('Updating one',
                        async () => {
                            const expectedPDFs = cloneDeep(dummyPDFs)

                            for (const pdf of expectedPDFs) {
                                const bookmarks = pdf.bookmarks
                                let randomBookmarkIndex = generateRandomIntFromInterval(0, bookmarks.length - 1)

                                const randomBookmark = bookmarks[randomBookmarkIndex]

                                let id = randomBookmark.id
                                let name = generateRandomString(30)
                                let page = generateRandomInt(50)

                                // update expected PDF bookmark
                                randomBookmark.name = name
                                randomBookmark.page = page

                                await updateBookmark(pdf.file_path, id, name, page)
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toStrictEqual(expectedPDFs)
                        })

                    test('Delete One',
                        async () => {
                            const expectedPDFs = cloneDeep(dummyPDFs)

                            for (const pdf of expectedPDFs) {
                                const bookmarks = pdf.bookmarks
                                let randomBookmarkIndex = generateRandomIntFromInterval(0, bookmarks.length - 1)

                                const randomBookmark = bookmarks[randomBookmarkIndex]

                                let id = randomBookmark.id

                                // delete expected PDF bookmark
                                pdf.bookmarks = bookmarks.filter(bookmark => bookmark.id !== id)

                                await deleteBookmark(pdf.file_path, id)
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toStrictEqual(expectedPDFs)
                        })

                    test('Delete All',
                        async () => {
                            const expectedPDFs = cloneDeep(dummyPDFs)

                            for (const pdf of expectedPDFs) {
                                const bookmarks = pdf.bookmarks

                                for (var bookmark; bookmark = bookmarks.shift();) {
                                    await deleteBookmark(pdf.file_path, bookmark.id)
                                }
                            }

                            const pdfs = await getAllPDFs()

                            expect(pdfs).toStrictEqual(expectedPDFs)
                        })
                })
        })

    describe('PDF Deleted Files Store tests',
        () => {
            test('Removing One PDF ends up in the delete store',
                async () => {
                    const primaryKey = '/pdf/pdf2.pdf'

                    const expectedPDFs = cloneDeep(dummyPDFs)

                    const expectedDeletedPDF = expectedPDFs.splice(1, 1)[0]

                    await removePDF(primaryKey)

                    const deletedFiles = await getAllDeletedFilePaths()
                    const deletedFile = deletedFiles[0]

                    expect(deletedFiles).toHaveLength(1)
                    expect(deletedFile.file_path).toEqual(expectedDeletedPDF.file_path)
                })

            test('Removing All PDFs ends up in the delete store',
                async () => {
                    for (const pdf of dummyPDFs) {
                        await removePDF(pdf.file_path)
                    }

                    const deletedFiles = await getAllDeletedFilePaths()

                    for (let i = 0; i < 3; i++) {
                        expect(deletedFiles[i]).toHaveProperty('file_path', dummyPDFs[i].file_path)
                    }

                    expect(deletedFiles).toHaveLength(3)
                })

            test('Remove a file in deleted File Store',
                async () => {
                    const primaryKey = '/pdf/pdf2.pdf'

                    const expectedPDFs = cloneDeep(dummyPDFs)

                    const expectedDeletedPDF = expectedPDFs.splice(1, 1)[0]

                    await removePDF(primaryKey)

                    await removeDeletedFilePath(expectedDeletedPDF.file_path)

                    const deletedFiles = await getAllDeletedFilePaths()

                    const deletedPDF = await getPDFUsingPrimaryKey(expectedDeletedPDF.file_path)

                    expect(deletedFiles).toHaveLength(0)
                    expect(deletedPDF).toBeUndefined()
                })

            test('Remove all files in deleted File Store',
                async () => {
                    for (const pdf of dummyPDFs) {
                        await removePDF(pdf.file_path)
                    }

                    const deletedFiles = await getAllDeletedFilePaths()

                    for (var deletedFile of deletedFiles) {
                        await removeDeletedFilePath(deletedFile.file_path)
                    }

                    const newDeletedFiles = await getAllDeletedFilePaths()

                    expect(newDeletedFiles).toHaveLength(0)
                })
        })

    describe('User interactivity',
        () => {
            test(`Simulate medium speed scrolling that constantly updates PDF record's current page every second`,
                async () => {
                    /**
                     * Updating the page every millisecond and succesfully updates the currentPage value. 
                     * This is pretty fast and is sufficient for your average user of the app.
                     * This test synchronously waits for the page to update the DB before continuing, but our application will update it asynchronously.
                     * 
                     * This makes the current page less accurate but makes the application experience smoother for the user.
                     * And it's only less accurate in the worst case.
                     * For example: 
                     *      if some user goes haywire and constantly tries to update the current page they're reading
                     *      by scrolling really fast or using some scrolling script
                     *      and then proceeds to randomly close the page that they're reading,
                     *      leaving the DB to not succesfully update the last page or last few pages.
                     * 
                     * But even in this worst case scenario, the fact that an update page operation can succesfully update in a millisecond
                     * (Probably even faster, we just capped the update at a millisecond)
                     * means that by the time they closed, their saved page in the DB is probably a few pages behind from what the application actually sees.
                     *      - For one:
                     *          - this scenario is bad faith as heck and isn't even how you use this application.
                     *      - and two:
                     *          - the average user is probably not gonna be doing that.
                     *      - and three:
                     *          - the update operation speed is quick enough that
                     *          - the closed DB pages will be pretty damn close from the actual view before we closed so it's only a minor inconvenience but still good.
                     *          - they can still just scroll a bit to where they needed to be.
                     * 
                     * So we'll take the decrease in accuracy for the smoother application experience with the async calls.
                     */

                    const pdf = await getPDFUsingPrimaryKey('/pdf/pdf1.pdf')

                    let newPage

                    var timeleft = 1000;

                    var wait = (ms) => {
                        const start = Date.now();
                        let now = start;
                        while (now - start < ms) {
                            now = Date.now();
                        }
                    }

                    while (timeleft > 0) {
                        newPage = generateRandomIntFromInterval(0, pdf.length)
                        await updatePDFCurrentPage('/pdf/pdf1.pdf', newPage)
                        timeleft--

                        wait(1)
                    }

                    const newPDF = await getPDFUsingPrimaryKey('/pdf/pdf1.pdf')
                    const currentPage = newPDF[pdfUpdateKeysENUM.currentPage]

                    expect(currentPage).toEqual(newPage)
                },
                20000)
        })
})

describe('Production ClientDB Initialization Tests', () => {
    beforeEach(async () => {
        process.env.REACT_APP_ENVIRONMENT = 'PRODUCTION'
        await initDB()
    })

    test('Default User is initialized with default values', async () => {
        const user = await getUser('user')
        expect(user).toStrictEqual(defaultUser)
    })

    test("Default User's keys are the correct types", async () => {
        const user = await getUser('user')

        const userKeys = Object.keys(user)

        userKeys.forEach((key) => {
            expect(typeof (user[key])).toEqual(expectedUserKeyTypes[key])
        })
    })

    test("Production PDF Store starts with no records",
        async () => {
            const pdfs = await getAllPDFs()

            expect(pdfs.length).toEqual(0)
        })
})