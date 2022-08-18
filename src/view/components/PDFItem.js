import { ItemBarTypes, ChangeTypes } from "./Utils";

export function ItemBar(props){
    let isPDF = props.type === ItemBarTypes.PDF
    let isBookmark = props.type === ItemBarTypes.Bookmark
    let isBookmarkEdit = props.type === ItemBarTypes.BookmarkEdit
    
    let rightSideText

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
    
    return (
        <div className={props.open ? "pdf-item-bar-open" : "pdf-item-bar"} onClick={handleSelect}>
            {props.name ? props.name : "Book"}
            <div className="pdf-item-bar-right">
                {rightSideText}
            </div>
        </div>
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
    return (
        <div className="bookmark-item">
            <PDFItemBar rightSideText={props.rightSideText}/>
            <Icon imgFilename="editing.png" height="20px" width="20px"/>
            <Icon imgFilename="trash.png" height="20px" width="20px"/>
        </div>
    )
}


function PDFItem(props) {
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
                return <BookmarkItem key={bookmark.id} id={bookmark.id} name={bookmark.name} rightSideText={bookmark.page}/>
            })}
            </>
            : null}
        </>
    )
}

export default PDFItem;