//Handles the charts for the homepage and the auth.
let hasAuthorized = false;
console.log(appData[0]);

// start the app authentication process
async function startAuthProcess() {
    unlockBot();
    console.log(JSON.stringify(isDev));
    if (isDev) {
        return
    }
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

async function loadBotStats() {
    let userCount = await UserHandle.countUsers();
    let quoteCount = await QuoteHandle.countQuotes();
    let commandCount = await CommandHandle.countCommands();
    let pointCount = await UserHandle.getAllPoints();
    document.getElementById("userCount")!.innerHTML = userCount.toString();
    document.getElementById("quoteCount")!.innerHTML = quoteCount.toString();
    document.getElementById("commandCount")!.innerHTML = commandCount.toString();
    document.getElementById("pointCount")!.innerHTML = pointCount.toString();
}

/**
* Checks for updates on launch. Also sets dev state to true/false. Shows restart button if update is ready.
*/
function checkForUpdate() {
  	console.log('checkForUpdates');
  	const version = document.getElementById('version')!;
  	ipcRenderer.send('app_version');
  	ipcRenderer.on('app_version', (event, arg) => {
    	console.log("Recieved app_version with : " + arg.version)
    	version.innerText = 'Version ' + arg.version;
    	if (arg.isDev == true) {
      		isDev = true;
      		console.log("Glimboi is in dev mode. We will not request the token.")
    	} else {
      		console.log("GlimBoi is in production mode. We will request an access token. ")
    	}
    	ipcRenderer.removeAllListeners('app_version');
  	});

  	const notification = document.getElementById('notification')!;
  	const message = document.getElementById('message')!;
  	const restartButton = document.getElementById('restart-button')!;

  	ipcRenderer.on('update_available', () => {
    	ipcRenderer.removeAllListeners('update_available');
    	console.log("Update Avaible")
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