//This file handles connecting the bot to a chat.
//this module cannot run on its own, it needs the ws modules from main.js or glimboi.js
const WebSocket = require("ws");
var path = "./"

function updatePath(gui) {
    path = gui;
}

function join(access_token, refresh_token) {
   console.log(access_token, refresh_token);
   try {connectToGlimesh({token: access_token})} catch(e) {
      console.log("we caught the error, poggers")
   }
}

function connectToGlimesh(auth) {
    const url = "wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&client_id=3c29ea03b4e30d9935b23bf5611c74296c5535d7519f18008963ad6371497df2"
  //  console.log(auth.token)
    
    var connection = new WebSocket(url);

    connection.on("open", function open() {
      console.log("Connected to the Glimesh API");
        connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
        connection.send(
          '["6","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: 6) { user { username avatar } message } }","variables":{} }]'
        ); //Requests a specific channel. I can do multiple at the same time but idk...
      
        setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
          connection.send('[null,"6","phoenix","heartbeat",{}]'); 
        }, 30000);
      });

      connection.on("message", function(data) { //We recieve a message from glimesh chat! (includes heartbeats and other info)
          console.log(data);
          // A normal chat message looks like this: (with non redacted data)
          // [null,null,"__absinthe__:doc:-REDACTED:REDACTED","subscription:data",{"result":{"data":{"chatMessage":{"message":"a","user":{"avatar":"/uploads/avatars/Mytho.png?v=63762672056","username":"Mytho"}}}},"subscriptionId":"__absinthe__:doc:-REDACTED:REDACTED"}]
          //var test = [null,null,"__absinthe__:doc:-576460752302176350:33B2AA3BF7B8F0E158810EF0E0166F5E05840BE57444C92365C921943942A47D","subscription:data",{"result":{"data":{"chatMessage":{"message":"a","user":{"avatar":"/uploads/avatars/Mytho.png?v=63762672056","username":"Mytho"}}}},"subscriptionId":"__absinthe__:doc:-576460752302176350:33B2AA3BF7B8F0E158810EF0E0166F5E05840BE57444C92365C921943942A47D"}];
          try {
            //First check for heartbeat message.
            var heartbeat = JSON.parse(data);
            if (heartbeat[4].status !== undefined) {
              console.log("Status: " + heartbeat[4].status);
            } else {
              //Its probably a chat message
              try {
                var chatMessage = JSON.parse(data);
                if (chatMessage[4].result.data !== undefined) {
                  console.log(
                    chatMessage[4].result.data.chatMessage.user.username +
                    ": " +
                    chatMessage[4].result.data.chatMessage.message
                  );
                }
              } catch (e2) {
                console.log(e2);
              }
            }
          } catch (e1) {
            console.log(e1);
          }
      })

      connection.onclose = function (event) { //The connection closed, if error the error will be triggered too
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
      
      connection.onerror = function (error) { // oh noes, an error!
        console.log(`[error] ${error.message}`);
        console.log("Probably an auth issue. Please reauthenicate");
        throw "error, it crashed. p l e a s e f i x n o w"
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