//handles sending users to different to parts of the app
const {clipboard, ipcRenderer} = require("electron"); // @ts-ignore
let appData:appDataType = ipcRenderer.sendSync("appDataRequest", null); //Ask main process for app data
let isDev = appData[2];
console.log(appData);
const Datastore = require("@seald-io/nedb");
const AuthHandle:AuthHandle = require(appData[0] + "/modules/auth.js");
const UserHandle:UserHandle = require(appData[0] + "/modules/users.js");
const QuoteHandle:QuoteHandle = require(appData[0] + "/modules/quotes.js");
const RankHandle:RankHandle = require(appData[0] + "/modules/users/userRank.js");
const CommandHandle:CommandHandle = require(appData[0] + "/modules/commands.js");
const MediaHandle:MediaHandle = require(appData[0] + "/modules/media.js");
const ChatHandle:ChatHandle = require(appData[0] + "/modules/chat.js");
const ChatChannels:ChatChannels = require(appData[0] + "/modules/chat/chatChannels.js");
const ModHandle:ModHandle = require(appData[0] + "/modules/modPanel.js");
const EventHandle:EventHandle = require(appData[0] + "/modules/events.js");
const ApiHandle:ApiHandle = require(appData[0] + "/modules/API.js");
const fs:typeof import("fs").promises = require("fs").promises;
const DumbCacheStore:CacheStore = require(appData[0] + "/modules/cache.js");
const LogHandle:LogHandle = require(appData[0] + "/modules/log.js");
const Server:Server = require(appData[0] + "/modules/server.js");
let Companion: Companion = require(appData[0] + "/modules/companion/companion.js");
// Load companion DB
Companion.updatePath(appData[1]);
const Util:Util = require(appData[0] + "/modules/util/util.js");
const mm = require("music-metadata");
let currentPage:pageState = "home";
console.log("Greetings Inquirer! Sadly, Glimesh has come to an end. Feel free to have a look around.");

var globalChatMessages:storedChatMessage[] = [];

let SuccessModal:Modal, ErrorModal:Modal;

function changeNavHighlight(highlight:string) { //Removes the old and highlights the new
  	document.getElementsByClassName("active")[0].classList.remove("active");
  	document.getElementById(highlight)!.classList.add("active");
}

window.onload = function() {
  	document.getElementById("close")!.addEventListener("click", function(e) { //Closes the App.
    	ipcRenderer.send("window", "close");
  	});

  	document.getElementById("maximize")!.addEventListener("click", function(e) { //Maximizes the App.
    	ipcRenderer.send("window", "maximize");
  	});

  	document.getElementById("minimize")!.addEventListener("click", function(e) { //Minimizes the App.
    	ipcRenderer.send("window", "minimize");
  	});

  	document.getElementById("refresh")!.addEventListener("click", function(e) { //Refreshes the App.
    	ipcRenderer.send("window", "refresh");
  	});

  	// Get all the navigation links to an array
	const naviLinks = Array.from(document.getElementsByClassName("nav-link"));
	const contentEl = document.getElementsByClassName("pane")[0]

	naviLinks.forEach((linkEl) => {
    	// Listen click event for the navigation link
    	linkEl.addEventListener("click", async  e => {
        	// Prevent default behavior for the click-event
        	e.preventDefault();
        	// Get the path to page content file
        	const href = linkEl.getAttribute("href");
        	let id = linkEl.id
        	if (href && href !== "#") {
            	let data = await fs.readFile(`${appData[0]}/${href}`);
                	// show the selected page
                	contentEl.innerHTML = "";
                    // @ts-ignore
                	contentEl.insertAdjacentHTML("beforeend", data);
                	changeNavHighlight(id); //Changes the highlight
                    switch (id) {
                        case "CommandLink": loadCommandTable(); currentPage = "commands"; break;
                        case "PointsLink": getPoints(); currentPage = "points"; break;
                        case "EventsLink": loadEvents(); currentPage = "events"; break;
                        case "UsersLink": loadUsers(); currentPage = "users"; break;
                        case "RanksLink": rankPrep(); currentPage = "ranks"; break;
                        case "OBSLink": loadMediaTable(); currentPage = "media"; break;
                        case "MusicLink": loadMusicProgram(); currentPage = "music"; break;
                        case "ModPanelLink": loadModPanel(); currentPage = "mod"; break;
                        case "SettingsLink": showIntegrations(); currentPage = "settings"; break;
                        case "ChatLink": loadChatWindow(); currentPage = "chat"; break;
                        case "GlimBoiHeader": loadBotStats(); unlockRequestToken(); currentPage = "home"; break;
                    }
                    loadFlowbite();
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

    switch(id) {
        case 'commandEditInput':
            $('#editCommandButtonFinish').click()
            break;
        case 'commandRemoveInput':
            $('#removeCommandButtonFinish').click()
            break;
        case 'messageArea':
            $('#sendMessage').click()
            break;
        case 'quoteRemoveSearch':
            $('#userRemoveQuoteSearch').click()
            break;
        case 'userAddInput':
            $('#addUserFinish').click()
            break;
        case 'userEditSearch':
            $('#userEditSearchButton').click()
            break;
        case 'userQuoteInputQ':
            $('#addQuoteFinish').click()
            break;
        case 'userQuoteInputU':
            $('#addQuoteFinish').click()
            break;
        case 'userQuoteSearch':
            $('#userRemoveQuoteSearch').click()
            break;
        case 'userremoveInput':
            $('#removeUserFinish').click()
            break;
        case 'whichUser':
            $(this).closest('.modal-content').find('#targetActionButton').click();
            break;
        case 'newChatName':
            $('#triggerNewChatAdd').click()
            break;
        case 'rankAddInput':
            $('#addingRankButton').click()
            break;
        case 'rankRemoveInput':
            $('#rankRemoveButton').click()
            break;
        case 'mediaEditInput':
            $('#mediaEditButton').click()
            break;
        case 'mediaRemoveInput':
            $('#mediaRemoveButton').click()
            break;
    }

    event.preventDefault();
});

/**
 * Opens a link in the users default browser
 */
function loadLink(link: string, customProtocol: boolean = false) {
    if (customProtocol) {
        ipcRenderer.invoke("openPath", `${link}`, "external");
    } else {
        ipcRenderer.invoke("openPath", `https://${link}`, "external");
    }
}

// Shows an error message to the user in the form of a modal.
function errorMessage(errorType: string, errorMessage: string) {
    document.getElementById("errorMessageText")!.innerHTML = errorType;
    document.getElementById("errorMessageSolution")!.innerHTML = errorMessage;
    ErrorModal = new Modal(document.getElementById("modalError"), {});
    ErrorModal.show();

    document.getElementById("closeErrorModal").addEventListener("click", () => {
        ErrorModal.hide();
        document.getElementById("closeErrorModal")!.removeEventListener("click", () => {});
    });
}


// Shows a success message to the user in the form of a modal.
function successMessage(messageType: string, message: string) {
    document.getElementById("successMessageText")!.innerHTML = messageType;
    document.getElementById("successMessageSolution")!.innerHTML = message;
    SuccessModal = new Modal(document.getElementById("modalSuccess"), {});
    SuccessModal.show();

    document.getElementById("closeSuccessModal").addEventListener("click", () => {
        SuccessModal.hide();
        document.getElementById("closeSuccessModal")!.removeEventListener("click", () => {});
    });

}

async function getDataDirectory() {
    try { // Check if the file exists.
        await fs.readdir(appData[1] + '/data/');
        console.log("Data directory found!");
    } catch (e) { // if not create the directory
        console.log("No data directory exists, creating it");
        try {
            await fs.mkdir(appData[1] + '/data/');
        } catch (e) {
            errorMessage("Error creating/reading data directory. You can try reloading.",  "If the issue persists contact us on twitter or discord.")
        }
    }
}
getDataDirectory();

/**
 * Shows a message to the user in a small notification box.
 * @param message The message to send to the chat
 */
async function showToast(message: string) {
    let div = document.createElement("div");
    let toast = await fs.readFile(`${dirName}/html/common/toast.html`);
    div.innerHTML += toast.toString();
    div.className = "toast relative w-full max-w-xs rounded-lg shadow bottom-20 right-3"
    document.getElementById("toastContainer")!.appendChild(div);
    let Toast = new Dismiss(div, {
        triggerEl: div.getElementsByClassName("toast-close")[0] as HTMLElement,
    })
    // Set the message
    div.getElementsByClassName("toast-body")[0].innerHTML = `\n       ${message} \n`;

    // Every 8 seconds decrease the counter by 1 until its 0
    let counter = 7;
    let interval = setInterval(() => {
        if (counter == 0) {
            clearInterval(interval);
            Toast.hide();
            setTimeout(() => {
                div.remove();
            }, 1000);
        } else {
            div.getElementsByClassName("text-muted")[0].innerHTML = `${counter}`;
            counter--;
        }
    }, 1000);
}

function loadFlowbite() {
    let ev = document.createEvent("Event");
    ev.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(ev);
}