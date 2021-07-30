//Handles the charts for the homepage and the auth.
AuthHandle.updatePath(appData[1]);
console.log(appData[0]);

function rememberID(firstRun: boolean) { // checks if an id has been entered for auth
    AuthHandle.readAuth().then(data => {
        //Checks if any data is there, this is checking if a file even exists.
        let clientIdElement = document.getElementById("clientID")!;
        let secretIdElement = document.getElementById("secretID")!;
        let saveIdElement = document.getElementById("saveAuth")!;
        if (data.length == 0) {
            console.log("The auth file does not yet exist.");
            //Now we set the buttons/ inputs on the home page to be empty.
            clientIdElement.removeAttribute("disabled");
            secretIdElement.removeAttribute("disabled");
            saveIdElement.setAttribute("onclick", "saveAuth()")
            saveIdElement.innerHTML = "Save";
            return;
        }
    	//First we check if the client ID and secret exist. If they do we continue, else we ask for the IDs.
    	if (data[0].clientID!.length < 2 || data[0].secret!.length < 2) {
      		console.log("The client ID or secret do not yet exist in proper form. Please save them to the auth file!");
      		//Now we set the buttons/ inputs on the home page to be empty.
      		clientIdElement.removeAttribute("disabled");
      		secretIdElement.removeAttribute("disabled");
      		saveIdElement.setAttribute("onclick", "saveAuth()")
      		saveIdElement.innerHTML = "Save";
    	} else {
      		//Now we can safely assume that they have the client ID and secret saved. We reflect this on the buttons.
      		clientIdElement.setAttribute("disabled", "");
      		secretIdElement.setAttribute("disabled", "");
      		clientIdElement.setAttribute("placeholder", "ID Saved!")
      		secretIdElement.setAttribute("placeholder", "ID Saved!")
      		saveIdElement.setAttribute("onclick", "editAuth()")
      		saveIdElement.innerHTML = "Edit Auth";
            document.getElementById("joinChannelBOT")!.removeAttribute("disabled");
      		if (firstRun) {
                updateStatus(1); // sets to  request a token status message
        		if (isDev == false) { //They have entered auth info, request a token
          			console.log("Getting the first token for this session");
          			AuthHandle.requestToken(data[0].clientID!, data[0].secret!, false)
        		} else { errorMessage("Possbile Error", "You have already been authenticated. If you belive this to be false you can restart GlimBoi.") }
      		}
    	}
  	})
}


function saveAuth() { //sets the state to saved
    let clientIdElement = document.getElementById("clientID")! as HTMLInputElement;
    let secretIdElement = document.getElementById("secretID")! as HTMLInputElement;
    let saveIdElement = document.getElementById("saveAuth")!;
  	clientIdElement.setAttribute("disabled", "");
  	secretIdElement.setAttribute("disabled", "");
  	saveIdElement.setAttribute("onclick", "editAuth()")
  	saveIdElement.innerHTML = "Edit Auth";
  	AuthHandle.createID(clientIdElement.value, secretIdElement.value).then(data => {
        document.getElementById("joinChannelBOT")!.removeAttribute("disabled");
    	if (data == "NOAUTH") { // no changes
      		errorMessage("No Changes", "No changes were made to the auth file. The client ID and secret ID will not be updated.")
      		// Both IDs updated
    	} else if (data.clientID !== undefined && data.clientID.length > 2 && data.secret !== undefined && data.secret.length > 2) {
      		successMessage("Auth Updated", "The client ID and secret ID have been updated. To complete the authentication process select request token on the homepage.");
      		ApiHandle.updateID();
      		updateStatus(1);
      		// The client ID was updated but the secret was not.
    	} else if (data.clientID !== undefined && data.clientID.length > 2 && (data.secret == "" || data.secret == undefined)) {
      		successMessage("Auth Updated", "The client ID has been updated. If the secret ID has already been saved you can request a token. Otherwise you need to enter the secret ID.");
      		ApiHandle.updateID();
      		// The secret was updated but the client Id was not
    	} else if (data.secret !== undefined && data.secret.length > 2 && (data.clientID == "" || data.clientID == undefined)) {
      		successMessage("Auth Updated", "The secret ID has been updated. If the client ID has already been saved you can request a token. Otherwise you need to enter the client ID.");
    	}
  	});
  	console.log(clientIdElement.value, secretIdElement.value)
  	// We set the value to "ID SAVED" because we don't want the ID showing, streamers would probably show it accidentally.
  	clientIdElement.value = "ID Saved";
  	secretIdElement.value = "ID Saved";
}

function editAuth() { //Sets the state to editable
    let clientIdElement = document.getElementById("clientID")! as HTMLInputElement;
    let secretIdElement = document.getElementById("secretID")! as HTMLInputElement;
    let saveIdElement = document.getElementById("saveAuth")!;
  	clientIdElement.removeAttribute("disabled");
  	secretIdElement.removeAttribute("disabled");
  	saveIdElement.setAttribute("onclick", "saveAuth()")
  	saveIdElement.innerHTML = "Save";
  	clientIdElement.value = "";
  	secretIdElement.value = "";
  	clientIdElement.setAttribute("placeholder", "Enter Client ID")
  	secretIdElement.setAttribute("placeholder", "Enter Secret ID")
}


function syncQuotes(user:UserType | userName, quote, action) {
  	// removes it from the list as well as the user quote list.
  	try {
    	if (action == "remove" && typeof user !== "string") {
      		makeList(user);
    	} else if (action == "add") {
      		console.log(user);
      		let filteredData = userTable
      		.rows()
      		.indexes()
      		.filter(function (value, index) {
        		if (userTable.row(value).data().userName == user) {
          			makeList(userTable.row(value).data());
          			return;
        		}
      		});
    	}
  	} catch (e) {
    	console.log(e);
  	}
}

function syncUsers(data:userName | UserType, action: "add" | string) {
  	try {
    	if (action == "add") {
      		addUserTable(data as UserType);
    	} else {
      		console.log("The user " + data + " will now be deleted from the table.");
      		let filteredData = userTable
      		.rows()
      		.indexes()
      		.filter(function (value, index) {
        		return userTable.row(value).data().userName == data;
      		});
      		userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
    	}
  	} catch (e) {
    	console.log(e)
  	}
}
// @ts-ignore
function updateStatus(stage:authStatusNumber) {
    let authStatusElement = document.getElementById("authStatus")!;
  	if (stage == 1) {
    	authStatusElement.innerHTML = ` <span style="color: rgb(149, 101, 22);"> Auth Saved. Request a Token!</span> `;
    	authStatusElement.className = "fas fa-user-lock"
  	} else if (stage == 2) {
    	authStatusElement.innerHTML = ` <span style="color: rgb(17, 92, 33);"> GlimBoi is ready to join the chat!</span> `;
    	authStatusElement.className = "fas fa-user";
    	authStatusElement.style.color = "#115c21"
  	}
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
