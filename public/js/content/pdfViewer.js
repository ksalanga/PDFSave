// Content Script that will try to load popups in the PDF Viewer.

// Popup:
$("body").prepend(
    '<div class="modal" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" style="font-family: Inter, sans-serif"> \
        <div class="modal-dialog modal-dialog-centered" role="document"> \
            <div class="modal-content"> \
                <div class="modal-header"> \
                    <h5 class="modal-title" id="exampleModalLongTitle"><b>Save at page</b></h5> \
                </div> \
                <div class="modal-body d-flex justify-content-center"> \
                    <form class="form-inline"> \
                        <div class="form-group"> \
                            <label for="recipient-name" class="col-form-label" style="padding-right: 1px">Page Number:</label> \
                            <div class="col-sm-4"> \
                                <input type="text" class="form-control " id="recipient-name" placeholder="input current or any page #"> \
                            </div> \
                        </div> \
                    </form> \
                </div> \
                <div class="modal-footer"> \
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"> \
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" /> \
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" /> \
                    </svg> \
                    <div> \
                        <small><i>Saving will reopen the pdf at the input page number</i></small> \
                    </div> \
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> \
                    <button type="button" class="btn btn-primary" style="background-color: #4D9217; border-color: #4D9217">Save</button> \
                </div> \
            </div> \
        </div> \
    </div>'
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
{
    if (request.message === "save-at-page-popup")
    {
        // If DOM has the popup element
            // sendResponse: message: popup exists
        
        // Else
            // TODO: Inject popup with CSS into DOM
            $("#exampleModalCenter").modal('show');

        sendResponse({message: "popup added"})
    }

    return true
})