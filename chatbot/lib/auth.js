//This file handles connecting the users dev app to glimesh.tv
let path = "./"; //Default path, most likely wrong. Call updatePath(path) to set to the right path.
let client = "" //Client ID
let secret = "" //secret ID
let authDB; //Auth database containing all auth info
let token = {access_token: "", scope: "", creation: ""} //Can be used for auth purposes

/**
 * Requests an access token
 * @param {string} clientID The client ID of the user
 * @param {string} secretKey The secret key of the user
 * @param {boolean} firstTime Is this manually triggered?
 */
function requestToken(clientID, secretKey, firstTime) {
    fetch(`https://glimesh.tv/api/oauth/token?grant_type=client_credentials&client_id=${clientID}&client_secret=${secretKey}&scope=public chat`, { method: "POST" })
        .then((res) => {
            res.json().then((data) => { // parse and store the response
                try {
                    console.log(data)
                    token.access_token = data.access_token;
                    token.creation = data.created_at;
                    if (token.access_token == undefined) {
                        errorMessage("Auth Error", "Please ensure the correct information is entered for authentication.");
                        return
                    }
                    //Updates the DB with the info
                    authDB.update({}, { $set: { access_token: data.access_token, created_at: data.created_at } }, { multi: true }, function (err, numReplaced) {
                        console.log("Access token recieved and added to the database. Ready to join chat!");
                        updateStatus(2); // Everything is ready, they can join chat!
                        firstTime ? successMessage("Auth complete", "The bot is ready to join your chat. Customize it and head to the chat section!") : null
                    });
                } catch (e) {
                    console.log(e); // in case of errors...
                    errorMessage(e, "Auth Error")
                }
            });
        })
}

/**
 * Stores authentication information.The client/secret ID must be saved BEFORE this is called.
 */
function Auth() {
    readAuth().then(data => {
      	client = data[0].clientID;
      	secret = data[0].secret
      	startAuthServer(client, secret) // Starts an auth server so the user can authorize their app.
    })
}

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
  	console.log("Path is " + GUI);
  	path = GUI;
  	authDB = new Datastore({ filename: `${path}/data/auth.db`, autoload: true });
}

/**
 * Updates auth variables with info for authentication
 * @param {string} id Client ID
 * @param {string} id2 Secret Key
 */
function recieveID(id, id2) {
  	client = id;
  	secret = id2
}

/**
 * Reads the authentication database
 * @returns Returns auth info
 */
function readAuth() {
   	return new Promise(resolve => {
    	authDB.find( {}, function (err, docs) {
      		console.log(docs)
      		resolve(docs)
    	});
   	})
}


/**
 * Updates the client ID and secret ID
 * @param {string} client Client ID
 * @param {string} secret Secret Key
 */
function updateID(client, secret) {
 	return new Promise(resolve => {
  		authDB.update({}, { $set: { clientID: client, secret: secret } }, { multi: true }, function (err, numReplaced) {
    		console.log("Updated the auth IDs.");
    		resolve("UPDATEDID")
  		});
 	})
}

/**
 * Creates the document in auth.db . It will contain a client and secret ID. Updates if data already exists (determined by previous query)
 * @param {string} client Client ID
 * @param {string} secret Secret ID
 */
function createID(client, secret) {
  	console.log(client,secret)
  	return new Promise(resolve => {
    	if (client == "" && secret !== "") {
      		authDB.update({}, {$set: {secret: secret}} , { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments) {
        		console.log("Updated the Secret.");
        		resolve(affectedDocuments)
        		return
      		});
    	}
		else if (secret == "" && client !== "") {
        	authDB.update({}, {$set: {clientID: client}}, { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments) {
          		console.log("Updated the client ID");
          		resolve(affectedDocuments)
          		return
        	});
      	} else if (client.length > 2 && secret.length > 2) {
        	authDB.update({}, {$set: {clientID: client, secret: secret}}, { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments) {
          		console.log("Updated the client ID");
          		resolve(affectedDocuments)
          		return
        	});
      	} else if (client == "" && secret == ""){
        	console.log("No auth info recieved. No changes to auth.db")
        	resolve("NOAUTH");
        	return
      	}
   	})
}

/**
 * Returns the access token. Returns undefined if none is found
 */
function getToken() {
  	return new Promise(resolve => {
    	authDB.find( {}, function (err, docs) {
      		console.log(docs)
      		if (docs == undefined || docs.length == 0) {
        		resolve(undefined)
            } else {
        		resolve(docs[0].access_token)
        	}
      	})
  	});
}

/**
 * Returns the client ID from the database. Returns undefined if none is found
 */
function getID() {
  	return new Promise(resolve => {
    	authDB.find( {}, function (err, docs) {
      		console.log(docs);
      		if (docs[0] == undefined) {resolve(null)} else {
      			resolve(docs[0].clientID)
      		}
    	})
  	})
}

module.exports = { Auth, createID ,getID, getToken ,readAuth, recieveID, requestToken, updateID ,updatePath}; //Send to the main file.
