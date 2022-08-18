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
    Edit: 'editing.png',
    Delete: 'trash.png',
    Confirm: 'confirm.png',
    Cancel: 'cancel.png'
}

// ChangeValues for onPDFChange(changeType, changeValues) function in PDFView:
// {
//     id: id,
//     name: String
//     bookmark: {
//         id: number
//         name: String
//         page: number
//     }
//     progressNotification: boolean
//     autoSavePage: boolean
// }
    