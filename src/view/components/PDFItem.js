import { ItemBarTypes, ChangeTypes, IconTypes } from "./Utils";
import { useState } from "react";
import uniqid from 'uniqid';

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
                <div className="item-bar-closed" style={props.style}>
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
                style={{"cursor": "pointer"}}
                onClick={props.onClick}
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

    const deleteBookmark = () => {
        props.onBookmarkChange(ChangeTypes.Delete, {bookmark: {id: props.id}})
    }

    return (
        <>
            {
                !editing &&
                <div className="bookmark-item">
                    <ItemBar type={ItemBarTypes.Bookmark} name={props.name} page={props.page}/>
                    <Icon imgFilename={IconTypes.Read}/>
                    <Icon imgFilename={IconTypes.Edit} height="20px" width="20px" onClick={handleEdit}/>
                    <Icon imgFilename={IconTypes.Delete} height="20px" width="20px" onClick={deleteBookmark}/>
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
                    <Icon imgFilename={IconTypes.Confirm} onClick={updateBookmark}/>
                    <Icon imgFilename={IconTypes.Cancel} height="20px" width="20px" onClick={handleEdit}/>
                </div>
            }
        </>
        
    )
}

export function AddBookmarkItem(props) {
    const [name, setName] = useState("")
    const [page, setPage] = useState("")

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handlePageChange = (e) => {
        setPage(e.target.value)
    }

    const addBookmark = () => {
        if (name === "" 
        || page === "" 
        || page < 1 
        || props.duplicateBookmarkExists(name, page)) {
            return
        }

        props.onBookmarkChange(ChangeTypes.Create, {bookmark: {id: uniqid(), name: name, page: page}})
    }

    return (
        <div className="bookmark-item">
            <ItemBar
                type={ItemBarTypes.BookmarkEdit}
                onNameChange={handleNameChange}
                onPageChange={handlePageChange}
                style={{"backgroundColor": "#4D9217", "borderColor": "#4D9217"}}
            />
            <Icon imgFilename={IconTypes.Add} onClick={addBookmark} height="20px" width="20px"/>
        </div>
    )
}

function PDFItem(props) {
    const handleEdit = () => {
        props.onPDFChange(ChangeTypes.Update, {id: props.id, name: props.name})
    }

    const handleDelete = () => {
        props.onPDFChange(ChangeTypes.Delete, {id: props.id})
    }

    const duplicateBookmarkExists = (name, page) => {
        // check for duplicate bookmark name and page
        for (let i = 0; i < props.bookmarks.length; i++) {
            if (props.bookmarks[i].name.toLowerCase().trim() === name.toLowerCase().trim()
            && props.bookmarks[i].page === page) {
                return true
            }
        }
    }

    const handleBookmarkChange = (changeType, changeValues) => {
        changeValues = {...changeValues, id: props.id}
        props.onPDFChange(changeType, changeValues)
    }

    return (
        <>
            <div className="pdf-item">
                <ItemBar type={ItemBarTypes.PDF} id={props.id} name={props.name} open={props.open} onSelect={props.onSelect}/>
                <Icon imgFilename={IconTypes.Read}/>
                <Icon imgFilename={IconTypes.Edit} height="20px" width="20px" onClick={handleEdit}/>
                <Icon imgFilename={IconTypes.Delete} height="20px" width="20px" onClick={handleDelete}/>
            </div>

            {props.open ? 
            <>
            {/* map bookmarks */}
            {/* TODO: add create bookmark itembar */}
            <AddBookmarkItem 
                duplicateBookmarkExists={duplicateBookmarkExists}
                onBookmarkChange={handleBookmarkChange}
            />

            {/* TODO (Kenny): when Bookmarks exceed element size, add scrollbar ONLY to the list of bookmark elements; not the PDFItem or the AddBookmarkItem
            will have to create a separate div for this with the overflow hidden stuff */}
            {props.bookmarks.map(bookmark => {
                return <BookmarkItem 
                    key={bookmark.id}
                    id={bookmark.id}
                    name={bookmark.name}
                    page={bookmark.page}
                    duplicateBookmarkExists={duplicateBookmarkExists}
                    onBookmarkChange={handleBookmarkChange}
                />
            })}
            </>
            : null}
        </>
    )
}

export default PDFItem;