import ListView from "./ListView";
import { ChangeTypes, ViewTypes } from "../utils/Types";
import { useEffect, useState } from "react";
import EditView from "./EditView";
import uniqid from "uniqid";
import { getAll as getAllPDFs} from "../../model/PDFs";

// TODO(Kenny): work onMount and onUnmount for PDFView component (Priority: High)
function PDFView() {
    const [currentView, setCurrentView] = useState(ViewTypes.List)
    const [listViewState, setListViewState] = useState({
        selection: {
            open: false,
            id: null
        },
        items: []
    })

    // Load PDFs in DB
    useEffect(() => {
        (async () => {
            var pdfs = await getAllPDFs();

            // For all PDFS:
            // translate PDF Database Object To Application PDF (snake case => camelCase)
            // PDF DB Object => PDF App Object:
            // - auto_open_on => autoSavePage
            // - bookmarks
            // - current_page => currentPage
            // - current_week_latest_page => currentWeekLatestPage
            // - file_path => file
            // - last_week_latest_page => lastWeekLatestPage
            // - length
            // - name
            // - progress_notification_on => progressNotification
            
            for (const [index, pdf] of pdfs.entries()) {
                renameKeys(pdf)
                pdf['id'] = index
            }

            setListViewState({...listViewState, items: pdfs});
        })();

        return () => {
            // this now gets called when the component unmounts
        };
    }, []);

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
        // TODO: on deselect, try to go back to the position of the selected PDF id in the listview
        
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
        
        if (changeType === ChangeTypes.Create
        && !keys.includes('bookmark')
        && keys.includes('name')
        && keys.includes('file')) {
            changeValues.id = uniqid()
            changeValues.bookmarks = []
            changeValues.progressNotification = false
            changeValues.autoSavePage = true

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

function renameKeys(dbPdfObj) {
    const keyMap = {
        'auto_open_on': 'autoSavePage',
        'file_path': 'file',
        'progress_notification_on': 'progressNotification',
        'current_page': 'currentPage',
        'current_week_latest_page': 'currentWeekLatestPage',
        'last_week_latest_page': 'lastWeekLatestPage'
    };

    Object.keys(dbPdfObj).forEach(key => {
        if (keyMap[key]) {
        dbPdfObj[keyMap[key]] = dbPdfObj[key];
        delete dbPdfObj[key];
        }
    });

    return dbPdfObj;
}

export default PDFView;