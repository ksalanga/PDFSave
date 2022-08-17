import ListView from "./ListView";

// TODO(Kenny): work on PDFView State Management (Priority: High)
function PDFView() {

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