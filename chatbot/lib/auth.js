//This file handles connecting the users dev app to glimesh.tv
//It creates an express server so glimesh can redirect the user back to the bot. It is closed when the auth is completed.
const Datastore = require('nedb'); //Connects to the auth DB
var path = "./"; //Default path, most likely wrong. Call updatePath(path) to set to the right path.
var serverisOn = false; //tells us if the user started but didn't complete the auth. 
var client = "" //Client ID
var secret = "" //secret ID
var authDB; //Auth database containing all auth info 

var token = {access_token: "", refresh_token: "", code: "", scope: "", creation: "", expire: ""} //Can be used for auth purposes

/**
 * Starts an authentication server. Sends the user to Glimesh for authorization. After that we request an access token/refresh token.
 * @param {object} authScheme Object containing auth info
 * @param authScheme.clientID The users client ID
 */
function startAuthServer(authScheme) {
  const http = require('http'); // server modules
  const url = require('url'); // needed for parsing
  if (serverisOn == true) { // If the server is already running we just send them to glimesh again.
      console.log('server is already running, if this is a mistake restart glimboi'); // They have already opened the server. We log it and open it the wbesite again. 
      shell.openExternal(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`)
  } else { // This is their first time opening a server.
      console.log('Starting auth server');
      var server = http.createServer((req, res) => { // new server!
          res.setHeader('Content-Type', 'application/json');
          if (req.url.startsWith('/auth')) { // if they somehow get to this url...
              res.statusCode = 200;
              res.writeHead(301, { // We send them to glimesh
                  'Location': `https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`
              });
              res.end() // End of response
              return;
          } else if (req.url.startsWith('/success')) { // The user has authorized their app. It redirects them here.
              var queryObject = url.parse(req.url, true).query;
              console.log(queryObject.code) // the oauth code we submit for a token
              var code = queryObject.code // ^
              res.statusCode = 200 // 200 ok good amazing poggers
              res.end('Auth completed. Requesting the access token. You can close this and retrun to GlimBoi.') // We display this to the user.
              console.log("Auth complete! Code: " + code + ' Requesting token.');
              console.log(code, client, secret);
              //Requests a token with the code and other info. Written to the database after. The token variable houses it for this session
              var tokenURL = new URL("https://glimesh.tv/api/oauth/token");
              var params = {
                  grant_type: "authorization_code",
                  code: code,
                  redirect_uri: "http://localhost:3000/success",
                  client_id: client,
                  client_secret: secret
              }
              tokenURL.search = new URLSearchParams(params).toString(); // get the request for the token in the right format
              fetch(tokenURL, {
                      method: "POST"
                  })
                  .then((res) => { // ask for an access token
                      res.json().then((data) => { // parse and store the response
                          try {
                              console.log(data)
                              token.access_token = data.access_token;
                              token.refresh_token = data.refresh_token
                              token.scope = data.scope
                              token.creation = data.created_at
                              token.expire = data.expires_in
                              //Updates the DB with the info
                              authDB.update({}, {
                                  $set: {
                                      code: code,
                                      access_token: data.access_token,
                                      refresh_token: data.refresh_token,
                                      created_at: data.created_at,
                                      expire: data.expires_in
                                  }
                              }, {
                                  multi: true
                              }, function(err, numReplaced) {
                                  console.log("Got the tokens, ready to connect to glimesh");
                                  // Everything is ready, they can join chat!
                                  successMessage("Auth complete", "The bot is ready to join your chat. Customize it and head to the chat section!");
                                  // success message tells the user info
                                  server.close() // Closes the server
                              });
                          } catch (e) {
                              console.log(e) // in case of errors...
                          }
                      });
                  })
          }
      });

      const port = 3000; //it runs on port 3000. this must match the uri and match the dev app the user made
      server.listen(port, () => console.log(`Server running at http://localhost:${port}/`)), serverisOn = true, shell.openExternal(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`)
  }
}

/**
 * Stores authentication information. Starts an auth server when the information is found. The client/secret ID must be saved BEFORE this is called.
 */
function Auth() {
    var authscheme = readAuth().then(data => {
      client = data[0].clientID;
      secret = data[0].secret
      startAuthServer({clientID: data[0].clientID}) // Starts an auth server so the user can authorize their app.
    })
}

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
  authDB = new Datastore({ filename: `${path}/data/auth.db`, autoload: true });
}

/**
 * Updates auth variables with info for authentication
 * @param {string} id Client ID
 * @param {*} id2 Secret Key
 */
function recieveID(id, id2) {
  client = id;
  secret = id2
}

/**
 * @async
 * Reads the authentication database
 * @returns Returns auth info
 */
async function readAuth() {
   return new Promise(resolve => {
    authDB.find( {}, function (err, docs) {
      console.log(docs)
      resolve(docs)
    });
   })
}


/**
 * Refreshes the users access token. 
 * @param {string} refresh_token The users refresh token
 * @param {*} client_id Client ID
 * @param {*} client_secret Secret Key
 * @async
 */
async function refreshToken(refresh_token, client_id, client_secret) {
  return new Promise(resolve => {
  var url = new URL("https://glimesh.tv/api/oauth/token"); // Fetch wants a special url
  var params = {grant_type: "refresh_token", refresh_token: refresh_token, redirect_uri: "http://localhost:3000/success", client_id: client_id, client_secret: client_secret }
  url.search = new URLSearchParams(params).toString();
  fetch(url, {method: "POST"}) // asks glimesh to refresh our token
  .then((res) => {
    res.json().then((data) => {
      try {
        token.access_token = data.access_token;
        token.refresh_token = data.refresh_token
        token.scope = data.scope
        token.creation = data.created_at
        token.expire = data.expires_in
        //Updates the database with the info
        authDB.update({}, { $set: { access_token: data.access_token, refresh_token: data.refresh_token, created_at: data.created_at, expire: data.expires_in } }, { multi: true }, function (err, numReplaced) {
         console.log("Refreshed a token, ready to connect to chat!");
         resolve("SUCCESS")}) // Lets the orignal function know that everything worked
      } catch(e) {
        console.log(e);
        resolve(data) // returns the data
        errorMessage(e, "Refresh error")
      }
    });
  })
  })
  }

/**
 * Updates the client ID and secret ID
 * @param {string} client Client ID
 * @param {string} secret Secret Key
 * @async
 */
async function updateID(client, secret) {
 return new Promise(resolve => {
  authDB.update({}, { $set: { clientID: client, secret: secret } }, { multi: true }, function (err, numReplaced) {
    console.log("Updated the auth IDs.");
    resolve("UPDATEDID")
  });
 }) 
}

/**
 * Creates the document in auth.db . It will contain a client and secret ID.
 * @param {string} client Client ID
 * @param {string} secret Secret ID
 * @async
 */
async function createID(client, secret) {
  return new Promise(resolve => {
    authDB.insert({clientID: client, secret: secret}, function (err, numReplaced) {
      console.log("Created the auth IDs.");
      resolve("UPDATEDID")
    });
   }) 
}

/**
 * Returns the access token. Returns undefined if none is found
 * @async
 */
async function getToken() {
  return new Promise(resolve => {
    authDB.find( {}, function (err, docs) {
      console.log(docs)
      if (docs == undefined || docs.length == 0) {
        resolve(undefined)} else {
        resolve(docs[0].access_token)
        }
      })
  });
}

/**
 * Returns the client ID from the database. Returns undefined if none is found
 * @async
 */
async function getID() {
  return new Promise(resolve => {
    authDB.find( {}, function (err, docs) {
      console.log(docs);
      if (docs[0] == undefined) {resolve(null)} else {
      resolve(docs[0].clientID)
      }
    })
  })
}


module.exports = { Auth, createID ,getID, getToken ,readAuth, recieveID, refreshToken, startAuthServer, updateID ,updatePath}; //Send to the main file.
