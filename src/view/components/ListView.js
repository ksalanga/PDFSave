import PDFItem from "./PDFItem";

function ListView() {
    return (
        <div className="list-view">
        {/* Returns multiple pdf item components */}
            <PDFItem />
            <PDFItem />
            <PDFItem />
            <PDFItem />
        </div>
    )
}

export default ListView;