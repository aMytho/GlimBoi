//This file handles connecting the users dev app to glimesh.tv
//It creates an express server so glimesh can redirect the user back to the bot. It is closed when the auth is completed.
const Datastore = require('nedb'); //Connects to the auth DB
var path = "./";
var serverisOn = false; // tells us if the user started but didn't complete the auth. 
var client = "" //Client ID
var secret = "" //secret ID
var authDB; //Auth database containing all auth info 

var token = {access_token: "", refresh_token: "", code: "", scope: "", creation: "", expire: ""} //Can be used for auth purposes

//Starts the server. Clients will be sent to glimesh to auth and then back to Glimboi.
function startAuthServer(authScheme) {
  const http = require('http'); // server modules
  const url = require('url'); // needed for parsing
  if (serverisOn == true) { // they may have had to go back to glimboi before auth completes.
      console.log('server is already running, if this is a mistake restart glimboi'); // They have already opened the server. We log it and open it the wbesite again. 
      shell.openExternal(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`)
  } else {
      console.log('Starting auth server');
      var server = http.createServer((req, res) => { // new server!
          res.setHeader('Content-Type', 'application/json');
          if (req.url.startsWith('/auth')) { // if they somehow get to this url...
              res.statusCode = 200;
              res.writeHead(301, { // send them to glimesh
                  'Location': `https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`
              });
              res.end()
              return;
          } else if (req.url.startsWith('/success')) { // they completed auth!
              var queryObject = url.parse(req.url, true).query;
              console.log(queryObject.code)
              var code = queryObject.code // the oauth code we submit for a token
              res.statusCode = 200
              res.end('Auth completed. Requesting the access token. You can close this and retrun to GlimBoi.')
              console.log("Auth complete! Code: " + code + ' Requesting token.');
              console.log(code, client, secret)
              //Requests a token with the code and other info. Written to the db after. The token var houses it for this session
              var tokenURL = new URL("https://glimesh.tv/api/oauth/token");
              var params = {
                  grant_type: "authorization_code",
                  code: code,
                  redirect_uri: "http://localhost:3000/success",
                  client_id: client,
                  client_secret: secret
              }
              tokenURL.search = new URLSearchParams(params).toString(); // get the request in the right format
              fetch(tokenURL, {
                      method: "POST"
                  })
                  .then((res) => { // ask for an access token
                      res.json().then((data) => { // store the response
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
                                  successMessage("Auth complete", "The bot is ready to join your chat. Customize it and head to the chat section!")
                                  server.close()
                              });
                          } catch (e) {
                              console.log(e)
                          }
                      });
                  })
          }
      });

      const port = 3000; //it runs on port 3000. this must match all the uri and match the dev app the user made
      server.listen(port, () => console.log(`Server running at http://localhost:${port}/`)), serverisOn = true, shell.openExternal(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20chat&redirect_uri=http://localhost:3000/success`)
  }
}

//Gets an access token for the user. This lets the Bot control the account so it can respond to commands and do all functions.
//It also lets the bot do API requests for any user.
function Auth() {
    var authscheme = readAuth().then(data => {
      client = data[0].clientID;
      secret = data[0].secret
      startAuthServer({clientID: data[0].clientID})
    })
}

//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
  authDB = new Datastore({ filename: `${path}/data/auth.db`, autoload: true });
}

//Updates the auth module with our IDs so we don't have to read the file again. 
function recieveID(id, id2) {
  client = id;
  secret = id2
}

//Reads the auth file 
async function readAuth() {
   return new Promise(resolve => {
    authDB.find( {}, function (err, docs) {
      console.log(docs)
      resolve(docs)
    });
   })
}


// We refresh the access token and get a new one. Refresh tokens last for a year. 
async function refreshToken(refresh_token, client_id, client_secret) {
  return new Promise(resolve => {
  var url = new URL("https://glimesh.tv/api/oauth/token");
  var params = {grant_type: "refresh_token", refresh_token: refresh_token, redirect_uri: "http://localhost:3000/success", client_id: client_id, client_secret: client_secret }
  url.search = new URLSearchParams(params).toString();
  fetch(url, {method: "POST"})
  .then((res) => {
    res.json().then((data) => {
      try {
        token.access_token = data.access_token;
        token.refresh_token = data.refresh_token
        token.scope = data.scope
        token.creation = data.created_at
        token.expire = data.expires_in
        //Updates the DB with the info
        authDB.update({}, { $set: { access_token: data.access_token, refresh_token: data.refresh_token, created_at: data.created_at, expire: data.expires_in } }, { multi: true }, function (err, numReplaced) {
         console.log("Refreshed a token, ready to connect to chat!");
         resolve("SUCCESS")})
      } catch(e) {
        console.log(e);
        resolve(data)
        errorMessage(e, "Refresh error")
      }
    });
  })

  })
  }

async function updateID(client, secret) {
 return new Promise(resolve => {
  authDB.update({}, { $set: { clientID: client, secret: secret } }, { multi: true }, function (err, numReplaced) {
    console.log("Updated the auth IDs.");
    resolve("UPDATEDID")
  });
 }) 
}

async function createID(client, secret) {
  return new Promise(resolve => {
    authDB.insert({clientID: client, secret: secret}, function (err, numReplaced) {
      console.log("Created the auth IDs.");
      resolve("UPDATEDID")
    });
   }) 
}

//Return the access token
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
