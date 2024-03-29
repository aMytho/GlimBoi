//Handles the charts for the homepage and the auth.
let hasAuthorized = false;
// Show the last modal :(
let theFinalModal: Modal;
// dah du dah dah, .....

// start the app authentication process
async function startAuthProcess() {
    unlockBot();
    console.log(JSON.stringify(isDev));
    if (isDev) {
        console.log("Glimboi is in dev mode. No auth needed.");
        return
    }
    console.log("Glimboi is in production mode.");
    let refreshToken = await AuthHandle.getRefreshToken();
    if (refreshToken) {
        hasAuthorized = true;
        console.log("Refresh token found. Attempting to authenticate...");
        let newToken = await AuthHandle.requestToken();
        if (newToken) {
            console.log("Authentication successful.");
        } else {
            console.log("Authentication failed. Refresh did not succeed");
        }
    } else {
        successMessage("Welcome!", "Please authorize the bot before doing anything. The account that authorizes the bot will be what your bot name is.");
    }
}

/**
 * Shows the bot stats on the home page
 */
async function loadBotStats() {
    let [userCount, quoteCount, commandCount, pointCount] = await Promise.all([
        UserHandle.countUsers(), QuoteHandle.countQuotes(),
        CommandHandle.countCommands(), UserHandle.getAllPoints()
    ]);

    document.getElementById("userCount")!.innerHTML = userCount.toString();
    document.getElementById("quoteCount")!.innerHTML = quoteCount.toString();
    document.getElementById("commandCount")!.innerHTML = commandCount.toString();
    document.getElementById("pointCount")!.innerHTML = pointCount.toString();

    theFinalModal = new Modal(document.getElementById("theFinalModal"), {});
    if (!CacheStore.get("theEnd", false)) {
        theFinalModal.show();
    }
}

function acceptTheEnd() {
    // Prevent the end message from showing.
    CacheStore.set("theEnd", true);
    theFinalModal.hide();

    // Restart the bot incase of the modal glitch
    ipcRenderer.send("window", "refresh");
}

function denyTheEnd() {
    // Remove modal, but don't update the setting
    theFinalModal.hide();
    showToast("If you have a popup bug, press CTRL+R to reload the bot. Sorry about that!");
}

/**
* Checks for updates on launch. Also sets dev state to true/false. Shows restart button if update is ready.
*/
function checkForUpdate() {
  	console.log('Checking for updates...');
  	const version = document.getElementById('version')!;
  	ipcRenderer.send('app_version');
  	ipcRenderer.on('app_version', (event, arg) => {
    	console.log("Received app_version with : " + arg.version)
    	version.innerText = 'Version ' + arg.version;
    	ipcRenderer.removeAllListeners('app_version');
  	});

  	const notification = document.getElementById('notification')!;
  	const message = document.getElementById('message')!;
  	const restartButton = document.getElementById('restart-button')!;

  	ipcRenderer.on('update_available', () => {
    	ipcRenderer.removeAllListeners('update_available');
    	console.log("Update Available")
    	message.innerText = 'A new update is available. Downloading now...';
    	notification.classList.remove('hidden');
  	});

  	ipcRenderer.on('update_downloaded', () => {
    	console.log("Update Downloaded")
    	ipcRenderer.removeAllListeners('update_downloaded');
    	message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    	restartButton.classList.remove('hidden');
    	notification.classList.remove('hidden');
    	function closeNotification() {
      		notification.classList.add('hidden');
    	}
  	});
}

function restartApp() {
  	console.log("trying to restart the app for the update")
  	ipcRenderer.send('restart_app');
}

function unlockRequestToken() {
    if (hasAuthorized) {
        try {
            document.getElementById("joinChannelBOT").attributes.removeNamedItem("disabled");
        } catch(e) {}
    }
}