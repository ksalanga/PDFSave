import ListView from "./ListView";
import { ChangeTypes, ViewTypes } from "./Utils";
import { useState } from "react";
import EditView from "./EditView";

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
            },
            {
                id: 3,
                name: 'Bookmark 3',
                page: 3
            },
            {
                id: 4,
                name: 'Bookmark 4',
                page: 4
            },
            {
                id: 5,
                name: 'Bookmark 5',
                page: 5
            },
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

    const borderStyle = currentView === ViewTypes.List ? {"borderStyle": "solid"} : {}

    const handleEdit = (changeType, changeValues) => {
        let id = changeValues.id
        
        if (changeType === ChangeTypes.Update) {
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
        delete changeValues.id
        let keys = Object.keys(changeValues)
        
        // TODO(Kenny): create pdf in list if pdf is not null (Priority: High)
        // PDFView will not be responsible for creating pdf
        // The content scripts will be responsible for creating pdf
        if (changeType === ChangeTypes.Create && !Object.keys(changeValues).includes('bookmark')) {
            setListViewState({
                ...listViewState,
                items: [...listViewState.items, changeValues]
            })
        }

        // add a bookmark to the pdf with the given id
        if (changeType === ChangeTypes.Create
        && keys.includes('bookmark')) {
            setListViewState({
                ...listViewState,
                items: listViewState.items.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            bookmarks: [...item.bookmarks, changeValues.bookmark]
                        }
                    }
                    return item;
                })
            })
        }

        if (changeType === ChangeTypes.Update
        && !keys.includes('bookmark')) {
            setListViewState({
                ...listViewState,
                selection: {
                    ...listViewState.selection,
                    id: id
                }
            })

            setCurrentView(ViewTypes.Edit)
        }

        // update bookmark in list if pdf is not null
        if (changeType === ChangeTypes.Update
        && keys.includes('bookmark')) {
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

        const isEmpty = keys.length === 0 && changeValues.constructor === Object

        // delete pdf from list if pdf is not null
        if (changeType === ChangeTypes.Delete && isEmpty) {
            setListViewState({
                selection: {
                    open: false,
                    id: null
                },
                items: listViewState.items.filter(pdf => pdf.id !== id)
            })
        }

        // delete bookmark from pdf if pdf is not null
        if (changeType === ChangeTypes.Delete && !isEmpty) {
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

    const duplicatePDFExists = (name) => {
        // finds a pdf with the same name but different id
        return listViewState.items.find(pdf => pdf.name.toLowerCase().trim() === name.toLowerCase().trim() && pdf.id !== listViewState.selection.id)
    }

    return (
        <div className="pdf-view" style={borderStyle}>
            <>
            {
                currentView === ViewTypes.List 
                &&
                <ListView list={listViewState.items}
                selection={listViewState.selection.id}
                open={listViewState.selection.open}
                onSelect={handleSelect}
                onPDFChange={handlePDFChange}
                />
            }
            {
                currentView === ViewTypes.Edit
                &&
                <EditView 
                    pdf={listViewState.items.find(pdf => pdf.id === listViewState.selection.id)}
                    onEdit={handleEdit}
                    duplicatePDFExists={duplicatePDFExists}
                />
            }
            </>
        </div>
    )
}

export default PDFView;