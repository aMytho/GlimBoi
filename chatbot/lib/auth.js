//This file handles connecting the users dev app to glimesh.tv
//It creates an express server so glimesh can redirect the user back to the bot. It is closed when the auth is completed.
var fs = require("fs")
const open = require('open'); //Opens the users default browser. hopefully...
var request = require("request")
//express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Datastore = require('nedb'); //Connects to the auth DB

var path = "./";
var serverisOn = false; // tells us if the user started but didn't complete the auth. 
var client = "" //Client ID
var secret = "" //secret ID
var authDB; //Auth database containing all auth info 

var token = {access_token: "", refresh_token: "", code: "", scope: "", creation: "", expire: ""}

function startAuthServer(authScheme) {
  if (serverisOn == true) {console.log('server is already running, if this is a mistake restart glimboi');
      open(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20email%20chat%20streamkey&redirect_uri=http://localhost:3000/success`)
} else {
    console.log('starting auth server')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/auth', (req, res) => {
  // The optional first parameter to `res.redirect()` is a numeric
  // HTTP status.
  res.redirect(301, `https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20email%20chat%20streamkey&redirect_uri=http://localhost:3000/success`);
});

//The user completed the auth
app.get('/success', (req, res) => {
  let code = req.query.code; //We use this to request a token
  console.log("Auth complete! Code: " + code + ' Requesting token. Causing error to close the server');
  res.send('<p>Auth complete! You can close this now. </p>'); //tells the users we completed auth. We still need to request a token though
  var options = {
    method: 'POST',
    body: "",
    url: "https://glimesh.tv/api/oauth/token?grant_type=authorization_code&code=" + code + "&redirect_uri=http://localhost:3000/success&client_id=" + client + "&client_secret=" + secret
};
//Requests a token with the code and other info. Written to the db after. The token var houses it for this session  
request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) { //If all is as it should be
        console.log(body); //The unfiltered response
        var data = JSON.parse(body);
        console.log(data)
       //Sets the token info to match the var. We use the var to authenicate.
       token.access_token = data.access_token;
       token.refresh_token = data.refresh_token
       token.scope = data.scope
       token.creation = data.created_at
       token.expire = data.expires_in
       //Updates the DB with the info
       authDB.update({}, { $set: { code: code, access_token: data.access_token, refresh_token: data.refresh_token, created_at: data.created_at, expire: data.expires_in } }, { multi: true }, function (err, numReplaced) {
        console.log("Got the tokens, ready to connect to glimesh")
      });
     //Kills the server with an error.
       app.listen(port, () => console.log('Closing auth server on port ' + port))
    } else {
        console.log(error) //log any errors
        console.log(response.statusCode)
        console.log(body)
    }
});
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port), serverisOn = true, open(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20email%20chat%20streamkey&redirect_uri=http://localhost:3000/success`))
  }
}

//Gets an access token for the user. This lets the Bot control the account so it can respond to commands and do all functions.
//It also lets the bot to API requests for any user.
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

//makes an auth file with content so it actually saves, still blank though
async function makeAuth() {
  return new Promise(resolve => {
    authDB.insert({clientID: "", secret: "", code: "", access_token: "", refresh_token: "", created_at: "", expire: ""}, function (err, newDocs) {
      console.log(newDocs)
      resolve("finished!")
    });
  })
  
}

// We refresh the access token and get a new one. Refresh tokens last for a year. 
async function refreshToken(access_token, refresh_token, client_id, client_secret, code) {
  return new Promise(resolve => {
    var options = {
      method: 'POST',
      body: "",
      url: "https://glimesh.tv/api/oauth/token?grant_type=refresh_token&refresh_token=" + refresh_token + "&redirect_uri=http://localhost:3000/success&client_id=" + client_id + "&client_secret=" + client_secret + "&code=" + code
  };
  //Refreshes the token
  request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) { //If all is as it should be
          var data = JSON.parse(body);
          console.log(data)
         //Sets the token info to match the var. We use the var to authenicate.
         token.access_token = data.access_token;
         token.refresh_token = data.refresh_token
         token.scope = data.scope
         token.creation = data.created_at
         token.expire = data.expires_in
         //Updates the DB with the info
         authDB.update({}, { $set: { code: code, access_token: data.access_token, refresh_token: data.refresh_token, created_at: data.created_at, expire: data.expires_in } }, { multi: true }, function (err, numReplaced) {
          console.log("Refreshed a token, ready to connect to chat!")
          resolve("SUCCESS")}) 
        } else {
          console.log(body);
          console.log(error)
          resolve(error)
        }
      
  })

  })
  }

async function updateID(client, secret) {
  authDB.update({}, { $set: { clientID: client, secret: secret } }, { multi: true }, function (err, numReplaced) {
    console.log("Updated the auth IDs.");
  });
}

function getTokens() {
  return token;
}



module.exports = { Auth, makeAuth ,readAuth, recieveID, refreshToken, startAuthServer, updateID ,updatePath}; //Send to the main file.
