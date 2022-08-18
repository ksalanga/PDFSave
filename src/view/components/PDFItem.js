import { ItemBarTypes, ChangeTypes } from "./Utils";
import { useState } from "react";

export function ItemBar(props){
    let isPDF = props.type === ItemBarTypes.PDF
    let isBookmark = props.type === ItemBarTypes.Bookmark
    let isBookmarkEdit = props.type === ItemBarTypes.BookmarkEdit
    
    let handleSelect

    if (isPDF){
        handleSelect = () => {
            if (props.onSelect) {
                props.onSelect(props.id, !props.open);
            }
        }
    }

    let leftElement = props.name ? props.name : "Book"
    let rightElement


    if (isPDF) {
        rightElement = 
        <img
            src={`/images/${props.open ? "up" : "down"}-arrow.png`} 
            height="24px" width="24px"
            alt={`${props.open ? "up" : "down"}-arrow`} 
        />
    }

    if (isBookmark) {
        rightElement = "p. " + props.page
    }
    
    if (isBookmarkEdit) {
        leftElement = <input type="text" defaultValue={props.name} onChange={props.onNameChange}></input>
        rightElement = <input type="number" defaultValue={props.page} onChange={props.onPageChange} style={{"width": "40px"}}/>

        return (
            <form>
                <div className="item-bar-closed">
                    {leftElement}
                    <div className="item-bar-right">
                    p.
                        {rightElement}
                    </div>
                </div>
            </form>
        )
    }

    let cursor = isPDF ? {"cursor": "pointer"} : {}

    return (
        <div className={props.open ? "item-bar-open" : "item-bar-closed"} onClick={handleSelect} style={cursor}>
            {leftElement}
            <div className="item-bar-right">
                {rightElement}
            </div>
        </div>
    )
}

export function Icon(props) {
    return (
        <div>
            <img 
                src={`/images/${props.imgFilename}`}
                height={props.height ? props.height : "24px"}
                width={props.width ? props.width : "24px"}
            />
        </div>
    )
}

export function BookmarkItem(props) {
    const [editName, setEditName] = useState(props.name)
    const [editPage, setEditPage] = useState(props.page)
    const [editing, setEditing] = useState(false)

    const handleNameChange = (e) => {
        setEditName(e.target.value)
    }

    const handlePageChange = (e) => {
        setEditPage(e.target.value)
    }

    const handleEdit = () => {
        setEditing((prev) => !prev)
    }

    const updateBookmark = () => {
        if (editName === "" 
        || editPage === ""
        || editPage < 1
        || props.duplicateBookmarkExists(editName, editPage)) {
            handleEdit()
            return
        }

        props.onBookmarkChange(ChangeTypes.Update, {bookmark: {id: props.id, name: editName, page: editPage}})
        handleEdit()
    }

    return (
        <>
            {
                !editing &&
                <div className="bookmark-item">
                    <ItemBar type={ItemBarTypes.Bookmark} name={props.name} page={props.page}/>
                    <Icon imgFilename="book.png"/>
                    <Icon imgFilename="editing.png" height="20px" width="20px" onClick={handleEdit}/>
                    <Icon imgFilename="trash.png" height="20px" width="20px"/>
                </div>
            }
            {
                editing &&
                <div className="bookmark-item">
                    <ItemBar 
                        type={ItemBarTypes.BookmarkEdit}
                        name={props.name}
                        page={props.page}
                        onNameChange={handleNameChange}
                        onPageChange={handlePageChange}
                    />
                    <Icon imgFilename="confirm.png" onClick={updateBookmark}/>
                    <Icon imgFilename="cancel.png" height="20px" width="20px" onClick={handleEdit}/>
                </div>
            }
        </>
        
    )
}


function PDFItem(props) {

    const duplicateBookmarkExists = (name, page) => {
        // check for duplicate bookmark name and page
        for (let i = 0; i < props.bookmarks.length; i++) {
            if (props.bookmarks[i].name === name && props.bookmarks[i].page === page) {
                return true
            }
        }
    }

    const onBookmarkChange = (changeType, changeValues) => {
        changeValues = {...changeValues, id: props.id}
        props.onPDFChange(changeType, changeValues)
    }

    return (
        <>
            <div className="pdf-item">
                <PDFItemBar id={props.id} name={props.name} open={props.open} onSelect={props.onSelect}/>
                {!props.open && <Icon imgFilename="book.png"/>}
                <Icon imgFilename="editing.png" height="20px" width="20px"/>
                <Icon imgFilename="trash.png" height="20px" width="20px"/>
            </div>

            {props.open ? 
            <>
            {/* map bookmarks */}
            {props.bookmarks.map(bookmark => {
                return <BookmarkItem 
                    key={bookmark.id}
                    id={bookmark.id}
                    name={bookmark.name}
                    page={bookmark.page}
                    duplicateBookmarkExists={duplicateBookmarkExists}
                    onBookmarkChange={onBookmarkChange}
                />
            })}
            </>
            : null}
        </>
    )
}

export default PDFItem;