//Handles the charts for the homepage and the auth.
var refreshed = false;
var AuthHandle = require(appData[0] + "/chatbot/lib/auth.js");
AuthHandle.updatePath(appData[1]);

function rememberID(firstRun) { // checks if an id has been entered for auth
  var auth = AuthHandle.readAuth();
  auth.then(data => {
    //Checks if any data is there, this is seeing if a file even exists.
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
      updateStatus(1);
      if (firstRun) {
      if (data[0].access_token.length > 5 && refreshed == false && isDev == false) { // They have a token as well as the other info, we need to refresh it.
        console.log("They alread have an access token, we will begin refreshing it.");
        document.getElementById("joinChannelBOT").removeAttribute("disabled");
        AuthHandle.refreshToken(data[0].refresh_token, data[0].clientID, data[0].secret).then(refresh => {
          if (refresh == "SUCCESS") {
            refreshed = true;
            document.getElementById("authButton").innerHTML = "Auth has beeen refreshed. ";
            successMessage(refresh, "Auth has been refreshed. Ready to join chat.")
          } else {
            errorMessage(refresh, "Refreshing has failed. Please reauthenicate with Glimesh.");
          }
        })
      } else { errorMessage("Possbile Error", "You have already been authenticated. If you belive this to be false you can restart GlimBoi.") }
    }
      // If the above sstatement is true the below statement will run as well. Not efficient, need to fix.
      if (data[0].access_token.length > 5) {
        document.getElementById("joinChannelBOT").removeAttribute("disabled");
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
    if (data == "NOAUTH") { // no changes
      errorMessage("No Changes", "No changes were made to the auth file. The client ID and secret ID will not be updated.")
      // Both IDs updated
    } else if (data.clientID !== undefined && data.clientID.length > 2 && data.secret !== undefined && data.secret.length > 2) {
      successMessage("Auth Updated", "The client ID and secret ID have been updated. To complete the authentication process select authorize on the homepage.");
      ApiHandle.updateID();
      updateStatus(1);
      // The client ID was updated but the secret was not.
    } else if (data.clientID !== undefined && data.clientID.length > 2 && (data.secret == "" || data.secret == undefined)) {
      successMessage("Auth Updated", "The client ID has been updated. If the secret ID has already been saved you can authorize the bot. Otherwise you need to enter the secret ID.");
      ApiHandle.updateID();
      // The secret was updated but the client Id was not
    } else if (data.secret !== undefined && data.secret.length > 2 && (data.clientID == "" || data.clientID == undefined)) {
      successMessage("Auth Updated", "The secret ID has been updated. If the client ID has already been saved you can authorize the bot. Otherwise you need to enter the client ID.");
    }
  }
  );
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


// The below functions sync database functions with the UI. Some of these achanges are also sent to chat. 
function syncQuotes(user, quote, action) {
  // removes it from the list as well as the user quote list.
  try {
    if (action == "remove") {
      for (let i = 0; i < arrayofUsers.length; i++) {
        if (arrayofUsers[i][0] == user) {
          arrayofUsers[i][6] = quote;
          makeList(user);
          break;
        }
      }
    } else if (action == "add") {
      for (let i = 0; i < arrayofUsers.length; i++) {
        if (arrayofUsers[i][0] == user) {
          arrayofUsers[i][6].push(quote);
          console.log(user);
          var filteredData = userTable
            .rows()
            .indexes()
            .filter(function (value, index) {
              if (userTable.row(value).data()[0] == user) {
                makeList(userTable.row(value).data());
                return;
              }
            });
          break;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function syncUsers(data, action) {
  try {
    if (action == "add") {
      var arrayUser = [
        data.userName,
        data.points,
        data.watchTime,
        data.team,
        data.role,
        data.picture,
        data.quotes,
      ];
      arrayofUsers.push(arrayUser); //^
      addUserTable(data);
    } else {
      for (let i = 0; i < arrayofUsers.length; i++) {
        if (arrayofUsers[i][0] == data) {
          console.log("The user " + data + " will now be deleted");
          arrayofUsers.splice(i, 1); //Removes it from the array.
          var filteredData = userTable
            .rows()
            .indexes()
            .filter(function (value, index) {
              return userTable.row(value).data()[0] == data;
            });
          userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
        }
      }
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