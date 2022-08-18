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
    const handlePDFChange = (changeType, changeValues) => {
        let id = changeValues.id

        // TODO(Kenny): create pdf in list if pdf is not null 
        //              note: we might have to contact the database to create the pdf.
        if (changeType === ChangeTypes.Create && !Object.keys(changeValues).includes('bookmark')) {
            setListViewState({
                ...listViewState,
                items: [...listViewState.items, changeValues]
            })
        }

        // TODO(Kenny): create bookmark in list if pdf is not null
        //              note: we might have to contact the database to create the bookmark.
        if (changeType === ChangeTypes.Create && Object.keys(changeValues).includes('bookmark')) {

            setListViewState({
                ...listViewState,
                items: [...listViewState.items, changeValues]
            })
        }

        // update pdf in list if pdf is not null
        if (changeType === ChangeTypes.Update && !Object.keys(changeValues).includes('bookmark')) {
            setListViewState({
                ...listViewState,
                items: listViewState.items.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            ...changeValues
                        }
                    }
                    return item;
                })
            })  
        }

        // update bookmark in list if pdf is not null
        if (changeType === ChangeTypes.Update && Object.keys(changeValues).includes('bookmark')) {
            setListViewState({
                ...listViewState,
                items: listViewState.items.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            bookmarks: item.bookmarks.map(bookmark => {
                                if (bookmark.id === changeValues.bookmark.id) {
                                    return {
                                        ...bookmark,
                                        ...changeValues.bookmark
                                    }
                                }
                                return bookmark;
                            })
                        }
                    }
                    return item;
                })
            })
        }


        // delete pdf from list if pdf is not null
        if (changeType === ChangeTypes.Delete && changeValues === {}) {
            setListViewState({
                ...listViewState,
                items: listViewState.items.filter(pdf => pdf.id !== id)
            })
        }

        // delete bookmark from pdf if pdf is not null
        if (changeType === ChangeTypes.Delete && changeValues !== {}) {
            setListViewState({
                ...listViewState,
                items: listViewState.items.map(pdf => {
                    if (pdf.id === id) {
                        pdf.bookmarks = pdf.bookmarks.filter(bookmark => bookmark.id !== changeValues.bookmark.id)
                    }
                    return pdf
                })
            })
        }


    }


    return (
        <div className="pdf-view">
            <ListView list={listViewState.items} selection={listViewState.selection.id} open={listViewState.selection.open} onSelect={handleSelect} onPDFChange={handlePDFChange}/>
        </div>
    )
}

export default PDFView;