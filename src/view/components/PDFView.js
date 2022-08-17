import ListView from "./ListView";
import { ChangeTypes, ViewTypes } from "./Utils";
import { useState } from "react";

// TODO (Kenny): Delete dummy PDF array later
var dummyPDFs = [
    {
        id: 1,
        name: 'PDF 1',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: 2,
                name: 'Bookmark 2',
                page: 2
            }
        ],
        progressNotification: false,
        autoSavePage: true
    },
    {
        id: 2,
        name: 'PDF 2',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
            {
                id: 2,
                name: 'Bookmark 2',
                page: 2
            }
        ],
        progressNotification: false,
        autoSavePage: true
    },
    {
        id: 3,
        name: 'PDF 3',
        bookmarks: [
            {
                id: 1,
                name: 'Bookmark 1',
                page: 1
            },
        ],
        progressNotification: false,
        autoSavePage: true
    }
]

// TODO(Kenny): work on PDFView State Management (Priority: High)
// TODO(Kenny): work onMount and onUnmount for PDFView component (Priority: High)
function PDFView() {
    const [currentView, setCurrentView] = useState(ViewTypes.List)
    const [listViewState, setListViewState] = useState({
        selection: {
            open: false,
            id: null
        },
        items: dummyPDFs
    })

    const handleEditChange = (pdf) => {
        // TODO edit pdf in list if pdf is not null
        setCurrentView(ViewTypes.List)
    }

    const handleSelect = (id, open) => {
        // If a PDF has been opened in our listview state, pass down the only opened PDF item to the ListView items key.

        setListViewState({
            ...listViewState,
            selection: {
                open: open,
                id: id
            },
        })
    }

    // Refer to src\view\components\Views.js for changeValues object structure.
    return (
        <div className="pdf-view">
            <ListView />
        </div>
    )
}

export default PDFView;