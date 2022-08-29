import PDFItem from "./PDFItem";

function ListView(props) {

    return (
        <div className="list-view">
            {
                props.open &&
                props.list.filter(item => item.id === props.selection).map(item => {
                    return <PDFItem key={item.id} open={props.open} onSelect={props.onSelect} onPDFChange={props.onPDFChange} {...item} />
                })
            }
            {
                !props.open &&
                props.list.map(item => {
                    return <PDFItem key={item.id} open={props.open} onSelect={props.onSelect} onPDFChange={props.onPDFChange} {...item} />
                })
            }
        </div>
    )
}

export default ListView;