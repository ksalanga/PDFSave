function PDFItem(props) {
    return (
        <div className="pdf-item">
            <div className="pdf-item-bar">
                Book
                <div className="pdf-item-bar-right">
                    V
                </div>
            </div>
            <img src="/images/book.png" height={"30px"} width={"30px"}></img>
            <img src="/images/editing.png" height={"24px"} width={"25px"}></img>
            <img src="/images/trash.png" height={"24px"} width={"25px"}></img>
        </div>
    )
}

export default PDFItem;