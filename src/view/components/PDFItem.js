export function PDFItemBar(props){

    const handleSelect = () => {
        if (props.onSelect) {
            props.onSelect(props.id, !props.open);
        }
    }
    
    let rightSideText

    if (props.rightSideText) {
        rightSideText = props.rightSideText
    } else {
        rightSideText = 
        <img 
            src={`/images/${props.open ? "up" : "down"}-arrow.png`} 
            height="24px" width="24px" 
            alt={`${props.open ? "up" : "down"}-arrow`} 
        />
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
                <PDFItemBar open={props.open}/>
                <Icon imgFilename="book.png"/>
                <Icon imgFilename="editing.png" height="20px" width="20px"/>
                <Icon imgFilename="trash.png" height="20px" width="20px"/>
            </div>
            {props.open ? 
            <>
                <BookmarkItem rightSideText="p. 121231212312312123123123"/>
            </>
            : null}
        </>
    )
}

export default PDFItem;