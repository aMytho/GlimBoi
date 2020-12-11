//This file handles connecting the users dev app to glimesh.tv
//It creates an express server so glimesh can redirect the user back to the bot. It is closed when the auth is completed.
var fs = require("fs")
const open = require('open'); //Opens the browser.
//express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var path = "./";
var serverisOn = false;
var tempID = ""

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

app.get('/success', (req, res) => {
  let code = req.query.code;
  console.log("Auth complete! Code: " + code + 'Causing error to close the server');
  res.send('<p>Auth complete! You can close this now. </p>');
  code = JSON.stringify({token: code, clientID: tempID})
  fs.writeFileSync(`${path}/data/auth.JSON`, code)
  //Need to send an auth screen and wait a few seconds before xlosing.
  app.listen(port, () => console.log('Closing auth server on port ' + port))
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port), serverisOn = true, open(`https://glimesh.tv/oauth/authorize?response_type=code&state=&client_id=${authScheme.clientID}&scope=public%20email%20chat%20streamkey&redirect_uri=http://localhost:3000/success`))
  }
}

//Gets an access token for the user. This lets the Bot control the account so it can respond to commands and do all functions.
//It also lets the bot to API requests for any user.
function Auth(authScheme) {
    if (authScheme) {} else {
      var authScheme = JSON.parse(fs.readFileSync(path + "/data/auth.JSON"));
    }
    startAuthServer(authScheme)
}

//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
}

function recieveID(id) {
  tempID = id;
}

function checkForAuthFile() {
  try {
   var auth = JSON.parse(fs.readFileSync(path + "/data/auth.JSON"));
   console.log(auth.clientID, auth.token);
   console.log("File exists ^^")
  } catch(e) {
    console.log(e)
    console.log("File does not exist ^^");
  }
}

function checkForAuthWeb() {

}

module.exports = { Auth, checkForAuthFile, recieveID, startAuthServer, updatePath }; //Send to the main file.
