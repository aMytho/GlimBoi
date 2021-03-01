var ChatHandle = require(appData[0] + "/chatbot/lib/chat.js"); // Chat Module
var ModHandle = require(appData[0] + "/chatbot/lib/moderator.js"); // handles moderator actions
var isDev = false; // We assume they are on a production release.

var contextItem;

/**
 * Open a modal to allow the user to type which chat they will join.
 */
function joinChat() {
  var chatToJoin = document.getElementById("whichChannel").value
  AuthHandle.getToken().then(data => {
    if (data == undefined || data.length == 0 ) {
      errorMessage("The auth process is not yet complete. Please complete it before trying to join a chat.", "Go to the home page of Glimboi and auth again.")
    } else {
      ApiHandle.updatePath(data); //Sends the API module our access token.
      ApiHandle.getChannelID(chatToJoin).then(response => {
        if (response == null) {
          errorMessage(response, "Please make sure that the channel exists. Check your spelling.")
        } else if (response.status == "AUTHNEEDED") {
          errorMessage(response.data, "You need to authenticate again.")
        }
         else {
          //We have the ID, time to join the channel. At this point we assume the auth info is correct and we can finally get to their channel.
          console.log("Connected to chat!");
          ChatHandle.join(data, response); // Joins the channel
          successMessage("Chat connected!", "Please disconnect when you are finished. Happy Streaming!")
        }
      })
    }
  })
}

/**
 * Sends a message to chat as the bot. This is user input.
 * Resets when sent.
 */
function sendMessage() {
  ChatHandle.filterMessage(document.getElementById("messageArea").value, "user");
  document.getElementById("messageArea").value = "" // resets the message box
}


/**
 * Checks for updates on launch. Also sets dev state to true/false. Shows restart button if update is ready. 
 */
function checkForUpdate() {
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
}})
  // test functions
  ipcRenderer.on("aaaaaaaaaaaaa", () => {
  console.log("it happened")
})
  ipcRenderer.on("test", data => {
    console.log(data)
  })
}

function restartApp() {
  console.log("trying to restart the app for the update")
  ipcRenderer.send('restart_app');
}

function testingStuff(e) {
  contextItem = $(e.target).attr('name')
  console.log(contextItem)
  var top = e.pageY - 110;
  var left = e.pageX + 10;
  $("#context-menu").css({
    display: "block",
    top: top,
    left: left
  }).addClass("show");
  document.body.addEventListener("click", function() {$("#context-menu").removeClass("show").hide()},{once:true})
}

function contextMenu(action) {
  if (action == "ADDUSER") {
    UserHandle.addUser(contextItem.toLowerCase(), false).then(data => {

    })
  } else if (action == "ADDQUOTE") {

  } else {
    
  }
}

/**
 * Edits the action modal to show the correct info. 
 * @param {string} action The type of moderator action
 */
function actionBuilder(action) {
  console.log(action)
  document.getElementById("actionType").innerText = action
  switch (action) {
    case "Short Timeout":
      document.getElementById("targetActionButton").onclick = function() {
        ModHandle.timeoutByUsername("short", document.getElementById('whichUser').value, "GUI")
      }
      break;
    case "Long Timeout":
      document.getElementById("targetActionButton").onclick = function() {
        ModHandle.timeoutByUsername("long", document.getElementById('whichUser').value, "GUI")
      }
      break;
    case "Ban":
      document.getElementById("targetActionButton").onclick = function() {
        ModHandle.banByUsername(document.getElementById('whichUser').value, "GUI")
      }
      break;
    case "UnBan":
      document.getElementById("targetActionButton").onclick = function() {
        ModHandle.unBanByUsername(document.getElementById('whichUser').value, "GUI")
      }
      break;
  
    default:
      break;
  }
}