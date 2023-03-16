import uniqid from 'uniqid'
import { add as addPDF } from '../model/PDFs'

var id = uniqid()

export const dummyUser =
{
    name: 'CoolPerson',
    phone_number: '+12345678912',
    email: 'email@email.com',
    progress_notification_on: true
}

export var dummyPDF =
{
    name: `pdf${id}`,
    file_path: `/pdf/pdf${id}.pdf`,
    current_page: 0,
    length: 300,
    last_week_latest_page: 0,
    current_week_latest_page: 0,
    bookmarks: [
        {
            id: '1',
            name: 'Bookmark 1',
            page: 1
        },
    ],
    auto_open_on: true,
    progress_notification_on: false,
}

// TODO (Kenny): Delete dummy PDF array later
export var dummyPDFs = [
    {
        name: 'PDF 1',
        file_path: '/pdf/pdf1.pdf',
        current_page: 24,
        length: 300,
        last_week_latest_page: 0,
        current_week_latest_page: 10,
        bookmarks: [
            {
                id: '1',
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: '2',
                name: 'Bookmark 2',
                page: 2
            },
            {
                id: '3',
                name: 'Bookmark 3',
                page: 3
            },
            {
                id: '4',
                name: 'Bookmark 4',
                page: 4
            },
            {
                id: '5',
                name: 'Bookmark 5',
                page: 5
            },
        ],
        auto_save_on: true,
        progress_notification_on: false
    },
    {
        name: 'PDF 2',
        file_path: '/pdf/pdf2.pdf',
        current_page: 37,
        length: 700,
        last_week_latest_page: 0,
        current_week_latest_page: 0,
        bookmarks: [
            {
                id: '1',
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: '2',
                name: 'Bookmark 2',
                page: 2
            }
        ],
        auto_save_on: true,
        progress_notification_on: false
    },
    {
        name: 'PDF 3',
        file_path: '/pdf/pdf3.pdf',
        current_page: 400,
        length: 1000,
        last_week_latest_page: 120,
        current_week_latest_page: 300,
        bookmarks: [
            {
                id: '1',
                name: 'Bookmark 1',
                page: 1
            }
        ],
        auto_save_on: true,
        progress_notification_on: true
    }
]

export const initializeDummyDbPDFs = async () => {
    const dummyDbPDFs = [
        {
            name: 'Discrete Structures',
            file: 'file:///C:/Users/Kenneth/Desktop/Books/Discrete%20Structures%20I%20Textbook.pdf',
            length: 200,
        },
        {
            name: 'Elementary Linear Algebra',
            file: "file:///C:/Users/Kenneth/Desktop/Books/Elementary%20Linear%20Algebra%20(2nd%20Edition)%20by%20Lawrence%20E.%20Spence,%20Arnold%20J.%20Insel,%20Stephen%20H.%20Friedberg%20(z-lib.org).pdf",
            length: 300,
        },
        {
            name: 'Paper 09',
            file: "https://ceur-ws.org/Vol-838/paper_09.pdf",
            length: 400,
        },
        {
            name: 'Code Complete',
            file: "file:///C:/Users/Kenneth/Desktop/Books/Code%20Complete%20-%20A%20Practical%20Handbook%20of%20Software%20Construction%20(Steve%20McConnell)%20(z-lib.org).pdf",
            length: 500,
        },
        {
            name: 'Node.JS Development',
            file: "file:///C:/Users/Kenneth/Desktop/Books/Node.js%20Web%20Development%20Server-side%20web%20development%20made%20easy%20with%20Node%2014%20using%20practical%20examples%20by%20David%20Herron%20(z-lib.org).pdf",
            length: 500,
        },
    ]

    for (const dummyPDF of dummyDbPDFs) {
        await addPDF(dummyPDF.name, dummyPDF.file, dummyPDF.length)
    }
}
