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


            const name = generateRandomString(7)
            const filePath = generateRandomString(10)
            const length = generateRandomInt(50)
        const user = await getUser(1)
        expect(user).toStrictEqual(dummyUser)
    })
})