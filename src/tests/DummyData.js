import uniqid from 'uniqid'

var id = uniqid()

export const dummyUser = 
{
    name: 'CoolPerson',
    phone_number: '+12345678912',
    email: 'email@email.com'
}

export var dummyPDF =  
{
    name: `pdf${id}`,
    file_path: `/pdf/pdf${id}.pdf`,
    current_page: 0,
    length: 100,
    last_week_latest_page: 0,
    current_week_latest_page: 0,
    bookmarks: [
        {
            id: '1',
            name: 'Bookmark 1',
            page: 1
        },
    ],
    auto_save_on: true,
    progress_notification_on: false,
}

// TODO (Kenny): Delete dummy PDF array later
export var dummyPDFs = [
    {
        name: 'PDF 1',
        file_path: '/pdf/pdf1.pdf',
        current_page: 24,
        length: 50,
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