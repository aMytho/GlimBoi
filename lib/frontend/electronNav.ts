//handles sending users to different to parts of the app
// @ts-ignore
const {shell, ipcRenderer} = require("electron"); // @ts-ignore
let appData = ipcRenderer.sendSync("appDataRequest", null) //Ask main process for app data
const Datastore = require("nedb")
const AuthHandle:AuthHandle = require(appData[0] + "/modules/auth.js");
const UserHandle:UserHandle = require(appData[0] + "/modules/users.js");
const QuoteHandle:QuoteHandle = require(appData[0] + "/modules/quotes.js");
const RankHandle:RankHandle = require(appData[0] + "/modules/users/userRank.js");
const CommandHandle:CommandHandle = require(appData[0] + "/modules/commands.js");
const OBSHandle:OBSHandle = require(appData[0] + "/modules/OBS.js");
const ChatHandle:ChatHandle = require(appData[0] + "/modules/chat.js");
const ChatChannels:ChatChannels = require(appData[0] + "/modules/chat/chatChannels.js");
const ModHandle:ModHandle = require(appData[0] + "/modules/modPanel.js");
const EventHandle:EventHandle = require(appData[0] + "/modules/events.js");
const ApiHandle:ApiHandle = require(appData[0] + "/modules/API.js"); // @ts-ignore
const fs = require("fs");
// @ts-ignore
const DumbCacheStore = require(appData[0] + "/modules/cache.js");
const LogHandle:LogHandle = require(appData[0] + "/modules/log.js")
const mm = require("music-metadata")
let currentPage:pageState = "home"

var globalChatMessages = [];

function changeNavHighlight(highlight:string) { //Removes the old and highlights the new
  	try {document.getElementsByClassName("active")[0].classList.remove("active")} catch(e) {}
  	document.getElementById(highlight)!.classList.add("active");
}

window.onload = function() {
  	document.getElementById("close")!.addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseClose");
  	});

  	document.getElementById("maximize")!.addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseMaximize");
  	});

  	document.getElementById("minimize")!.addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("pleaseMinimize");
  	});

  	document.getElementById("refresh")!.addEventListener("click", function(e) { //Closes the App.
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
        	let id = linkEl.id
        	if (href) {
            	// @ts-ignore Use node.js fs-module to read the file
            	fs.readFile(`${appData[0]}/${href}`, (err:string, data) => {
                	if (err) {
                    	throw err;
                	}
                	// show the selected page
                	contentEl.innerHTML = "";
                    // @ts-ignore
                	contentEl.insertAdjacentHTML("beforeend", data);
                	changeNavHighlight(id) //Changes the highlight
                	if (linkEl.id == "CommandLink") {globalThis.loadCommandTable(); currentPage = "commands"} //Builds the data table
                	if (linkEl.id == "GlimBoiHeader") {globalThis.getBasicData(); rememberID(false); currentPage = "home"} //Builds the homepage charts and check for auth ino for the buttons
                	if (linkEl.id == "EventsLink") {globalThis.loadEvents(); currentPage = "events"}
                	if (linkEl.id == "UsersLink") {globalThis.loadUsers(); currentPage = "users"}
                	if (linkEl.id == "PointsLink") {globalThis.getPoints(); currentPage = "points"}
                	if (linkEl.id == "SettingsLink") {globalThis.showSettings(); currentPage = "settings"}
                    if (linkEl.id == "OBSLink") {globalThis.loadOBSData(); currentPage = "media"}
                	if (linkEl.id == "ChatLink") {globalThis.loadChatWindow(); currentPage = "chat"} //Builds the data table
                    if (linkEl.id == "RanksLink") {globalThis.rankPrep(); currentPage = "ranks"}
                    if (linkEl.id == "MusicLink") {globalThis.loadMusicProgram(); currentPage = "music"}
                    if (linkEl.id == "ModPanelLink") {globalThis.loadModPanel(); currentPage = "mod"}
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
    let key = event.keyCode || event.which;

    if (key != 13 || event.shiftKey === true) {
        return;
    }

    let id = $(this).attr('id');

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
    if (id === 'rankAddInput') $('#addingRankButton').click()
    if (id === 'rankRemoveInput') $('#rankRemoveButton').click()
    if (id === 'mediaEditInput') $('#mediaEditButton').click()
    if (id === 'mediaRemoveInput') $('#mediaRemoveButton').click()

    event.preventDefault();
});

$('[data-toggle=tooltip]').tooltip();

//Opens a link in the users default browser.
function loadLink(link:string) {
  	shell.openExternal("https://" + link)
}


// Shows an error message to the user in the form of a modal.
// @ts-ignore
function errorMessage(errorType:string, errorMessage:string) {
  	document.getElementById("errorMessageText")!.innerHTML = errorType;
  	document.getElementById("errorMessageSolution")!.innerHTML = errorMessage;
  	$('#modalError').modal("show")
}


// Shows a success message to the user in the form of a modal.
// @ts-ignore
function successMessage(messageType:string, message:string) {
  	document.getElementById("successMessageText")!.innerHTML = messageType;
  	document.getElementById("successMessageSolution")!.innerHTML = message;
  	$('#modalSuccess').modal("show");
}