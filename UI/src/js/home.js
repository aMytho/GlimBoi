//Handles the charts for the homepage and the auth.
var {
    BrowserView, BrowserWindow, app
  } = require("electron").remote
var fs = require('fs');

var serverisOn = false;
var authSaved = false;
var refreshed = false;
var AuthHandle = require(app.getAppPath() + "/chatbot/lib/auth.js");
AuthHandle.updatePath(app.getPath("userData"));


function rememberID() { // checks if an id has been entered for auth
    console.log("Getting thier stored auth information.");
       var auth = AuthHandle.readAuth();
       auth.then( data => {
           //Checks if any data is there, this is seeing if a file even exists.
           if (data.length == 0) {
               console.log("The auth file does not yet exist, creating it.")
               AuthHandle.makeAuth() //Create the file with blank data. 
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
              if (data[0].access_token.length > 5 && refreshed == false) { // They have a token as well as the other info, we need to refresh it.
                    console.log("They alread have an access token, we will begin refreshing it.")
                    AuthHandle.refreshToken(data[0].access_token, data[0].refresh_token, data[0].clientID, data[0].secret, data[0].code).then(refresh => {
                        if (refresh == "SUCCESS") {
                                refreshed = true;
                                document.getElementById("authButton").innerHTML = "Auth has beeen refreshed. ";
                        }
                    })
              }

             if (data[0].access_token.length > 5 && refreshed == true) {
                document.getElementById("authButton").innerHTML = "Auth has beeen refreshed. Ready to join chat.";
             }
           }
       })
    
}


function saveAuth() { //sets the state to saved
    var replacement = JSON.stringify({token: "", clientID: document.getElementById("clientID").value, refresh: null})
 //   fs.writeFileSync(`${app.getPath("userData")}/data/auth.JSON`, replacement);
    document.getElementById("clientID").setAttribute("disabled", "");
    document.getElementById("secretID").setAttribute("disabled", "");
    document.getElementById("saveAuth").setAttribute("onclick", "editAuth()")
    document.getElementById("saveAuth").innerHTML = "Edit Auth";
    AuthHandle.updateID(document.getElementById("clientID").value, document.getElementById("secretID").value)
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

function auth() {
    AuthHandle.Auth() //runs the webserver so we can get the token needed to connect to chat. It will refresh if a token is avaible. 

}




// Charts
function loadCharts() {
    getBasicData()
}