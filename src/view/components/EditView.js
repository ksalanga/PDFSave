import { ChangeTypes } from "./Utils";
import { useState } from "react";

function EditView(props) {
    const id = props.pdf.id;
    const name = props.pdf.name
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

        props.onEdit(ChangeTypes.Update, {id: id, name: editName, progressNotification: editProgressNotification, autoSavePage: editAutoSavePage})
    }

    const cancelEdit = () => {
        props.onEdit(ChangeTypes.Cancel, {})
    }

    return (
        <div className="edit-view">
        
            <h1>Edit {props.pdf.name}</h1>
            <div className="edit-view-input-container">
                <input type="text" value={editName} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="edit-view-input-container">
                <input type="checkbox" checked={editProgressNotification} onChange={(e) => setProgressNotification(e.target.checked)} />
                <label>Progress Notification</label>
            </div>

            <div className="edit-view-input-container">
                <input type="checkbox" checked={editAutoSavePage} onChange={(e) => setAutoSavePage(e.target.checked)} />
                <label>Auto Save Page</label>
            </div>

            <br></br>
            <button onClick={confirmEdit}>confirm</button>
            <button onClick={cancelEdit}>back</button>
        </div>
    )
}

export default EditView;