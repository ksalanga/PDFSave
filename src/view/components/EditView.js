import { ChangeTypes } from "../utils/Types";
import { useState } from "react";

function EditView(props) {
    const id = props.pdf.id;
    const name = props.pdf.name
    const file = props.pdf.file
    const progressNotification = props.pdf.progressNotification
    const autoSavePage = props.pdf.autoSavePage

    const [editName, setName] = useState(name)
    const [editProgressNotification, setProgressNotification] = useState(progressNotification)
    const [editAutoSavePage, setAutoSavePage] = useState(autoSavePage)

    const confirmEdit = () => {
        if (editName === "" || props.duplicatePDFExists(editName)) {
            cancelEdit()
            return
        }

        props.onEdit(ChangeTypes.Update, {id: id, file: file, name: editName, progressNotification: editProgressNotification, autoSavePage: editAutoSavePage})
    }

    const cancelEdit = () => {
        props.onEdit(ChangeTypes.Cancel, {})
    }

    return (
        <div className="edit-view">
            <div className="edit-view-header">
                <h2>Edit {props.pdf.name}</h2>
                <h4>PDF URL: <em>{file}</em></h4>
            </div>
            <div className="edit-view-body">
                <form>
                    <div className="edit-view-input-container">
                        <input type="text" value={editName} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="edit-view-input-container">
                        <input type="checkbox" checked={editAutoSavePage} onChange={(e) => setAutoSavePage(e.target.checked)} />
                        <label>Auto Open PDF To Saved Page</label>
                    </div>
                    
                    <div className="edit-view-input-container">
                        <input type="checkbox" checked={editProgressNotification} onChange={(e) => setProgressNotification(e.target.checked)} />
                        <label>Progress Notification</label>
                    </div>


                    <br></br>
                    <button onClick={confirmEdit}>confirm</button>
                    <button onClick={cancelEdit}>back</button>
            </form>
            </div>
        </div>
    )
}

export default EditView;