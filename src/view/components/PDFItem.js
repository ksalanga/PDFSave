export function PDFItemBar(props){
    return (
        <div className="pdf-item-bar">
            {props.text ? props.text : "Book"}
            <div className="pdf-item-bar-right">
                <img src="/images/down-arrow.png" height="24px" width="24px" alt="down-arrow" />
            </div>
        </div>
    )
}


export function Icon(props) {
    return (
        <div>
            <img src={`/images/${props.imgFilename}`} height={props.height ? props.height : "24px"} width={props.width ? props.width : "24px"}></img>
        </div>
    )
}


function PDFItem(props) {
    return (
        <div className="pdf-item">
            <PDFItemBar />
            <Icon imgFilename="book.png"/>
            <Icon imgFilename="editing.png" height="20px" width="20px"/>
            <Icon imgFilename="trash.png" height="20px" width="20px"/>
        </div>
    )
}

export default PDFItem;