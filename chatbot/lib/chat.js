//This file handles connecting the bot to a chat.
//this module cannot run on its own, it needs the ws modules from main.js or glimboi.js
const WebSocket = require("ws");
var path = "./"

function updatePath(gui) {
    path = gui;
}

function join() {
   try {
   var auth = JSON.parse(fs.readFileSync(path + '/data/auth.JSON', {encoding: "utf-8"}));
   console.log(auth);
   if (auth.token == "") {
       AuthHandle.Auth()
   } else {
   connectToGlimesh(auth)
   }
   } catch(e) {
    console.log("The authfile does not exist or is not valid. Creating the file/ authing user");

   }
}

function connectToGlimesh(auth) {
    const url = "wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=" + auth.token;
    var connection = new WebSocket(url);

    connection.on("open", function open() {
        connection.send('["6","6","__absinthe__:control","phx_join",{}]');
        connection.send(
          `["6","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: 6) { user { username avatar } message } }","variables":{} }]`
        );
      
        setInterval(() => {
          connection.send('[null,"6","phoenix","heartbeat",{}]'); //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
        }, 30000);
      });

      connection.onclose = function (event) {
        if (event.wasClean) {
          console.log(
            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log("[close] Connection died");
        }
      };
      
      connection.onerror = function (error) {
        console.log(`[error] ${error.message}`);
        console.log("Probably an auth issue. Please reauthenicate");
      };
    
}

function sendMessage(user, data) {

}

function disconnect() {
    
}

function highlightMessage() {

}

function archiveMessage(message) {

}


module.exports = {join, connectToGlimesh, sendMessage, updatePath}