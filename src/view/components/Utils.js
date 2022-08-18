export const ViewTypes = {
    List: 'list',
    Edit: 'edit'
}

export const ChangeTypes = {
    Create: 'create',
    Update: 'update',
    Delete: 'delete',
    Cancel: 'cancel'
}

export const ItemBarTypes = {
    Bookmark: 'bookmark',
    BookmarkEdit: 'bookmark-edit',
    PDF: 'pdf'
}

export const IconTypes = {
    Read: 'book.png',
    Add: 'add.png',
    Edit: 'editing.png',
    Delete: 'trash.png',
    Confirm: 'confirm.png',
    Cancel: 'cancel.png'
}

// ChangeValues for onPDFChange(changeType, changeValues) function in PDFView:
// {
//     id: id,
//     name: String
// }  // bookmark key means that the change is a SINGULAR bookmark Create, Update, Delete change
//     bookmark: {
//         id: number
//         name: String
//         page: number
//     }
// }   // whereas bookmarks key means that the change is a bookmarks LIST change.
//     // bookmarks will only be used when creating a new PDF
// }   bookmarks: []
//     progressNotification: boolean
//     autoSavePage: boolean
// }
    