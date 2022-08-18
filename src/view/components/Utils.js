export const ViewTypes = {
    List: 'list',
    Edit: 'edit'
}

export const ChangeTypes = {
    Create: 'create',
    Update: 'update',
    Delete: 'delete'
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
    