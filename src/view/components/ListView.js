import PDFItem from "./PDFItem";

function ListView() {
    return (
        <div className="list-view">
        {/* Returns multiple pdf item components */}
            <PDFItem open={true}/>
        </div>
    )
}

export default ListView;