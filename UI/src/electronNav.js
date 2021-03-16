//handles sending users to different to parts of the app
var {
  	shell, ipcRenderer
} = require("electron");
var Datastore = require('nedb')
var appData = ipcRenderer.sendSync("appDataRequest", null) //Ask main process for app data

var globalChatMessages = [];

function changeNavHighlight(highlight) { //Removes the old and highlights the new
  	try {document.getElementsByClassName("active")[0].classList.remove("active")} catch(e) {}
  	document.getElementById(highlight).classList.add("active");
}

window.onload = function() {
  	document.getElementById("close").addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseClose");
  	});

  	document.getElementById("maximize").addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseMaximize");
  	});

  	document.getElementById("minimize").addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseMinimize");
  	});

  	document.getElementById("refresh").addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseRefresh");
  	});

  	// Get all the navigation links to an array
	const naviLinks = Array.from(document.getElementsByClassName("nav-link"));
	const contentEl = document.getElementsByClassName("pane")[0]

	naviLinks.forEach((linkEl) => {
    	// Listen click event for the navigation link
    	linkEl.addEventListener("click", e => {
        	// Prevent default behavior for the click-event
        	e.preventDefault();
        	// Get the path to page content file
        	const href = linkEl.getAttribute("href");
        	var id = linkEl.id
        	if (href) {
            	// Use node.js fs-module to read the file
            	fs.readFile(`${appData[0]}/${href}`, (err, data) => {
                	if (err) {
                    	throw err;
                	}
                	// show the selected page
                	contentEl.innerHTML = "";
                	contentEl.insertAdjacentHTML("beforeend", data);
                	changeNavHighlight(id) //Changes the highlight
                	if (linkEl.id == "CommandLink") {loadCommandTable()} //Builds the data table
                	if (linkEl.id == "GlimBoiHeader") {getBasicData(); rememberID();} //Builds the homepage charts and check for auth ino for the buttons
                	if (linkEl.id == "EventsLink") {loadEvents()}
                	if (linkEl.id == "UsersLink") {loadUsers()}
                	if (linkEl.id == "PointsLink") {getPoints()}
                	if (linkEl.id == "SettingsLink") {showSettings()}
                	if (linkEl.id == "ChatLink") {loadChatWindow();} //Builds the data table
                  if (linkEl.id == "RanksLink") {rankPrep()}
                	// Make sure tooltips are triggered so they work
                	$('[data-toggle=tooltip]').tooltip();
            	})
        	}
    	})
	})
}

/**
 * On Enter functions
 */
$(document).on('keypress','input, textarea', function (event) {
    var key = event.keyCode || event.which;

    if (key != 13 || event.shiftKey === true) {
        return;
    }

    var id = $(this).attr('id');

    if (id === 'commandEditInput') $('#editCommandButtonFinish').click()
    if (id === 'commandRemoveInput') $('#removeCommandButtonFinish').click()
    if (id === 'messageArea') $('#sendMessage').click()
    if (id === 'quoteRemoveSearch') $('#userRemoveQuoteSearch').click()
    if (id === 'userAddInput') $('#addUserFinish').click()
    if (id === 'userEditSearch') $('#userEditSearchButton').click()
    if (id === 'userQuoteInputQ') $('#addQuoteFinish').click()
    if (id === 'userQuoteInputU') $('#addQuoteFinish').click()
    if (id === 'userQuoteSearch') $('#userRemoveQuoteSearch').click()
    if (id === 'userremoveInput') $('#removeUserFinish').click()
    if (id === 'whichUser') $(this).closest('.modal-content').find('#targetActionButton').click();
    if (id === 'newChatName') $('#triggerNewChatAdd').click()

    event.preventDefault();
});

$('[data-toggle=tooltip]').tooltip();

//Opens a link in the users default browser.
function loadLink(link) {
  	shell.openExternal("https://" + link)
}


// Shows an error message to the user in the form of a modal.
function errorMessage(errorType, errorMessage) {
  	document.getElementById("errorMessageText").innerHTML = errorType;
  	document.getElementById("errorMessageSolution").innerHTML = errorMessage;
  	$('#modalError').modal("show")
}


// Shows a success message to the user in the form of a modal.
function successMessage(messageType, message) {
  	document.getElementById("successMessageText").innerHTML = messageType;
  	document.getElementById("successMessageSolution").innerHTML = message;
  	$('#modalSuccess').modal("show");
}