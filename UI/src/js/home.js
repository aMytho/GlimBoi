//Handles the charts for the homepage and the auth.
const AuthHandle = require(appData[0] + "/chatbot/lib/auth.js");
AuthHandle.updatePath(appData[1]);

function rememberID(firstRun) { // checks if an id has been entered for auth
  	AuthHandle.readAuth().then(data => {
    	//Checks if any data is there, this is checking if a file even exists.
    	if (data.length == 0) {
      		console.log("The auth file does not yet exist.")
      		//Now we set the buttons/ inputs on the home page to be empty.
      		document.getElementById("clientID").removeAttribute("disabled");
      		document.getElementById("secretID").removeAttribute("disabled");
      		document.getElementById("saveAuth").setAttribute("onclick", "saveAuth()")
      		document.getElementById("saveAuth").innerHTML = "Save";
      		return;
    	}
    	//First we check if the client ID and secret exist. If they do we continue, else we ask for the IDs.
    	if (data[0].clientID.length < 2 || data[0].secret.length < 2) {
      		console.log("The client ID or secret do not yet exist in proper form. Please save them to the auth file!");
      		//Now we set the buttons/ inputs on the home page to be empty.
      		document.getElementById("clientID").removeAttribute("disabled");
      		document.getElementById("secretID").removeAttribute("disabled");
      		document.getElementById("saveAuth").setAttribute("onclick", "saveAuth()")
      		document.getElementById("saveAuth").innerHTML = "Save";
    	} else {
      		//Now we can safely assume that they have the client ID and secret saved. We reflect this on the buttons.
      		document.getElementById("clientID").setAttribute("disabled", "");
      		document.getElementById("secretID").setAttribute("disabled", "");
      		document.getElementById("clientID").setAttribute("placeholder", "ID Saved!")
      		document.getElementById("secretID").setAttribute("placeholder", "ID Saved!")
      		document.getElementById("saveAuth").setAttribute("onclick", "editAuth()")
      		document.getElementById("saveAuth").innerHTML = "Edit Auth";
            document.getElementById("joinChannelBOT").removeAttribute("disabled");
      		if (firstRun) {
                updateStatus(1); // sets to  request a token status message
        		if (isDev == false) { //They have entered auth info, request a token
          			console.log("Getting the first token for this session");
          			AuthHandle.requestToken(data[0].clientID, data[0].secret, false)
        		} else { errorMessage("Possbile Error", "You have already been authenticated. If you belive this to be false you can restart GlimBoi.") }
      		}
    	}
  	})
}


function saveAuth() { //sets the state to saved
  	document.getElementById("clientID").setAttribute("disabled", "");
  	document.getElementById("secretID").setAttribute("disabled", "");
  	document.getElementById("saveAuth").setAttribute("onclick", "editAuth()")
  	document.getElementById("saveAuth").innerHTML = "Edit Auth";
  	AuthHandle.createID(document.getElementById("clientID").value, document.getElementById("secretID").value).then(data => {
        document.getElementById("joinChannelBOT").removeAttribute("disabled");
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
  	console.log(document.getElementById("clientID").value, document.getElementById("secretID").value)
  	// We set the value to "ID SAVED" because we don't want the ID showing, streamers would probably show it accidentally.
  	document.getElementById("clientID").value = "ID Saved";
  	document.getElementById("secretID").value = "ID Saved";
}

function editAuth() { //Sets the state to editable
  	document.getElementById("clientID").removeAttribute("disabled");
  	document.getElementById("secretID").removeAttribute("disabled");
  	document.getElementById("saveAuth").setAttribute("onclick", "saveAuth()")
  	document.getElementById("saveAuth").innerHTML = "Save";
  	document.getElementById("clientID").value = "";
  	document.getElementById("secretID").value = "";
  	document.getElementById("clientID").setAttribute("placeholder", "Enter Client ID")
  	document.getElementById("secretID").setAttribute("placeholder", "Enter Secret ID")
}


function syncQuotes(user, quote, action) {
  	// removes it from the list as well as the user quote list.
  	try {
    	if (action == "remove") {
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

function syncUsers(data, action) {
  	try {
    	if (action == "add") {
      		addUserTable(data);
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

function updateStatus(stage) {
  	if (stage == 1) {
    	document.getElementById("authStatus").innerHTML = ` <span style="color: rgb(149, 101, 22);"> Auth Saved. Authorize when ready!</span> `;
    	document.getElementById("authStatus").className = "fas fa-user-lock"
  	} else if (stage == 2) {
    	document.getElementById("authStatus").innerHTML = ` <span style="color: rgb(17, 92, 33);"> GlimBoi is ready to join the chat!</span> `;
    	document.getElementById("authStatus").className = "fas fa-user";
    	document.getElementById("authStatus").style.color = "#115c21"
  	}
}

/**
* Checks for updates on launch. Also sets dev state to true/false. Shows restart button if update is ready.
*/
function checkForUpdate() {
  	console.log('checkForUpdates');
  	const version = document.getElementById('version');
  	ipcRenderer.send('app_version');
  	ipcRenderer.on('app_version', (event, arg) => {
    	console.log("Recieved app_version with : " + arg.version)
    	console.log("Removing all listeners for app_version.")
    	version.innerText = 'Version ' + arg.version;
    	if (arg.isDev == true) {
      		isDev = true;
      		console.log("Glimboi is in dev mode. We will not request the token.")
    	} else {
      		console.log("GlimBoi is in production mode. We will request an access token. ")
    	}
    	ipcRenderer.removeAllListeners('app_version');
  	});

  	const notification = document.getElementById('notification');
  	const message = document.getElementById('message');
  	const restartButton = document.getElementById('restart-button');

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
