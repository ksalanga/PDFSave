// Content Script that will try to load popups in the PDF Viewer.

// Popup:
$("body").prepend(
    '<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true"> \
    <div class="modal-dialog modal-dialog-centered" role="document"> \
    <div class="modal-content"> \
    <div class="modal-header"> \
        <h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5> \
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"> \
        <span aria-hidden="true">&times;</span> \
        </button> \
    </div> \
    <div class="modal-body"> \
        ... \
    </div> \
    <div class="modal-footer"> \
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> \
        <button type="button" class="btn btn-primary">Save changes</button> \
    </div> \
    </div> \
    </div>'
)

$(document).ready(function(){
    $("#exampleModalCenter").modal('show');
});

// Listen to chrome messages
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
// {
//     if (request.message === "save-at-page-popup")
//     {
//         // If DOM has the popup element
//             // sendResponse: message: popup exists
        
//         // Else
//             // TODO: Inject popup with CSS into DOM
//             var popUpDiv = 
//             '<div align="center"> \
//                 <br><br><br><br> \
//                 <a href="#loginScreen" class="button">Click here to Log In</a> \
//             </div> \
//             <div id="loginScreen"> \
//                 <a href="#" class="cancel">×</a> \
//             </div> \
//             <div id="cover" ></div>'

//         sendResponse({message: "popup added"})
//     }

//     return true
// })