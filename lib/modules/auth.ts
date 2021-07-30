//This file handles connecting the users dev app to glimesh.tv
let authPath = "./"; //Default path, most likely wrong. Call updatePath(path) to set to the right path.
let authDB:Nedb; //Auth database containing all auth info
let authToken:Auth = {access_token: "", scope: "", creation: ""}; //Can be used for auth purposes

/**
 * Requests an access token
 * @param {string} clientID The client ID of the user
 * @param {string} secretKey The secret key of the user
 * @param {boolean} isManual Is this manually triggered?
 */
async function requestToken(clientID: clientID, secretKey: secretKey, isManual: boolean): Promise<"ALLGOOD" | "NOTGOOD"> {
    return new Promise(async resolve => {
        let res = await fetch(`https://glimesh.tv/api/oauth/token?grant_type=client_credentials&client_id=${clientID}&client_secret=${secretKey}&scope=public chat`, { method: "POST" })
        let data = await res.json()
        try {
            authToken.access_token = data.access_token;
            authToken.creation = data.created_at;
            if (authToken.access_token == undefined) {
                errorMessage("Auth Error", "Please ensure the correct information is entered for authentication.");
                return;
            }
            //Updates the DB with the info
            authDB.update({}, { $set: { access_token: data.access_token, created_at: data.created_at } }, { multi: true }, function (err, numReplaced) {
                console.log("Access token recieved and added to the database. Ready to join chat!");
                updateStatus(2); // Everything is ready, they can join chat!
                isManual ? successMessage("Auth complete", "The bot is ready to join your chat. Customize it and head to the chat section!") : null;
                resolve("ALLGOOD");
            });
        } catch (e) {
            console.log(e); // in case of errors...
            errorMessage(e, "Auth Error");
            resolve("NOTGOOD");
        }
    });
}

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(updatedPath:string): void {
  	console.log("Path is " + updatedPath);
  	authPath = updatedPath;
      // @ts-ignore
  	authDB = new Datastore({ filename: `${authPath}/data/auth.db`, autoload: true });
}

/**
 * Reads the authentication database
 * @returns Returns auth info
 */
function readAuth(): Promise<Auth[]> {
   	return new Promise(resolve => {
    	authDB.find( {}, function (err: Error | null, docs:Auth[]) {
      		resolve(docs);
    	});
   	});
}


/**
 * Updates the client ID and secret ID
 * @param {string} client Client ID
 * @param {string} secret Secret Key
 */
function updateID(client:clientID, secret:secretKey): Promise<"UPDATEDID"> {
 	return new Promise(resolve => {
  		authDB.update({}, { $set: { clientID: client, secret: secret } }, { multi: true }, function (err, numReplaced) {
    		console.log("Updated the auth IDs.");
    		resolve("UPDATEDID");
  		});
 	});
}

/**
 * Creates the document in auth.db . It will contain a client and secret ID. Updates if data already exists (determined by previous query)
 * @param {string} client Client ID
 * @param {string} secret Secret ID
 */
function createID(client:clientID, secret:secretKey): Promise<"NOAUTH" | Auth > {
  	return new Promise(resolve => {
    	if (client == "" && secret !== "") {
      		authDB.update({}, {$set: {secret: secret}} , { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments: Auth) {
        		console.log("Updated the Secret.");
        		resolve(affectedDocuments);
        		return;
      		});
    	}
		else if (secret == "" && client !== "") {
        	authDB.update({}, {$set: {clientID: client}}, { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments: Auth) {
          		console.log("Updated the client ID");
          		resolve(affectedDocuments);
          		return;
        	});
      	} else if (client.length > 2 && secret.length > 2) {
        	authDB.update({}, {$set: {clientID: client, secret: secret}}, { upsert:true, returnUpdatedDocs: true},function (err, numReplaced, affectedDocuments: Auth) {
          		console.log("Updated the client ID");
          		resolve(affectedDocuments);
          		return;
        	});
      	} else if (client == "" && secret == ""){
        	console.log("No auth info recieved. No changes to auth.db");
        	resolve("NOAUTH");
        	return;
      	}
   	});
}

/**
 * Returns the access token. Returns undefined if none is found
 */
function getToken(): Promise<undefined | accessToken> {
  	return new Promise(resolve => {
    	authDB.find( {}, function (err: Error | null, docs:Auth[]) {
      		console.log(docs);
      		if (docs == undefined || docs.length == 0) {
        		resolve(undefined);
            } else {
        		resolve(docs[0].access_token);
        	}
      	});
  	});
}

/**
 * Returns the client ID from the database. Returns undefined if none is found
 */
function getID(): Promise<null | clientID> {
  	return new Promise(resolve => {
    	authDB.find( {}, function (err: Error | null, docs:Auth[]) {
      		if (docs[0] == undefined) {resolve(null);} else {
      			resolve(docs[0].clientID);
      		}
    	});
  	});
}

export  { createID, getID, getToken, readAuth, requestToken, updateID, updatePath}; //Send to the main file.
