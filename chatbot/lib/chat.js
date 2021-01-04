//This file handles connecting the bot to a chat.
const WebSocket = require("ws");
var connection;
var path = "./"

function updatePath(gui) {
    path = gui;
}

//Tries to join a channel, if it disconnects any error will be shown. 
function join(access_token, channelID) {
   try {connectToGlimesh(access_token, channelID)} catch(e) {
      console.log("we caught the error, poggers");
      errorMessage(e, "Chat Error")
   }
}

function connectToGlimesh(access_token, channelID) {
    const url = `wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=${access_token}`
    connection = new WebSocket(url);

    connection.on("open", function open() {
      console.log("Connected to the Glimesh API");
        connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
        connection.send(
          `["1","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { user { username avatar } message } }","variables":{} }]`
        ); //Requests a specific channel. I can do multiple at the same time but idk about doing that...
      
        setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
          connection.send('[null,"6","phoenix","heartbeat",{}]'); 
        }, 30000);
      });
      connection.on("message", function(data) { //We recieve a message from glimesh chat! (includes heartbeats and other info)
          // A normal chat message looks like this: (with non redacted data)
          // [null,null,"__absinthe__:doc:-REDACTED:REDACTED","subscription:data",{"result":{"data":{"chatMessage":{"message":"a","user":{"avatar":"/uploads/avatars/Mytho.png?v=63762672056","username":"Mytho"}}}},"subscriptionId":"__absinthe__:doc:-REDACTED:REDACTED"}]
          //var test = [null,null,"__absinthe__:doc:-576460752302176350:33B2AA3BF7B8F0E158810EF0E0166F5E05840BE57444C92365C921943942A47D","subscription:data",{"result":{"data":{"chatMessage":{"message":"a","user":{"avatar":"/uploads/avatars/Mytho.png?v=63762672056","username":"Mytho"}}}},"subscriptionId":"__absinthe__:doc:-576460752302176350:33B2AA3BF7B8F0E158810EF0E0166F5E05840BE57444C92365C921943942A47D"}];
          console.log(data)
          try {
            //First check for heartbeat message.
            var heartbeat = JSON.parse(data);
            if (heartbeat[4].status !== undefined) {
              console.log("Status: " + heartbeat[4].status);
            } else {
              //Its probably a chat message
              try {
                var chatMessage = JSON.parse(data);
                console.log(chatMessage)
                if (chatMessage[4].result.data !== undefined) {
                  console.log(
                    chatMessage[4].result.data.chatMessage.user.username +
                    ": " +
                    chatMessage[4].result.data.chatMessage.message
                  );
                    
                    if (chatMessage[4].result.data.chatMessage.message.startsWith("!")) { //If it is a command of some sort...
                      console.log("its a command, scanning and will run if found. ")
                      switch (chatMessage[4].result.data.chatMessage.message) {
                        case "!command add":

                          break;
                          case "!command new":
                          
                          break;
                          case "!command remove":
                          
                          break;
                          case "!command del":
                          
                          break;
                          case "!command edit":
                          
                          break;
                          case "!quote add":
                          QuoteHandle.addquote("mytho", "needs some sleep")
                          break;
                          case "!quote new":
                          QuoteHandle.addquote("mytho", "needs some sleep")
                          break;
                          case "!quote remove":
                          
                          break;
                          case "!quote del":
                          que
                          break;
                          case "!test":
                           // connection.send('["null","6","__absinthe__:control","doc",{"query":"mutation {createChatMessage(channelId:6, message: {message: \"Hello world!\"}) {message}}","variables":null}]')
                            connection.send(JSON.stringify(["6","7","__absinthe__:control","doc",{"query":"mutation {createChatMessage(channelId:6, message: {message: \"test complete!\"}) {message }}","variables":{}}]))
                       //   QuoteHandle.
                          break;
                          case "!user new":
                          
                          break;
                          case "!user add":
                          
                          break;
                          case "!user remove":
                          
                          break;
                          case "!user del":
                          
                          break;
                          case "!user data":
                          
                          break;
                          case "!user set":
                            break;
                          
                         
                      
                        default:
                          break;
                      }
                    }                    
                    try {logMessage(chatMessage[4].result.data.chatMessage.user.username, chatMessage[4].result.data.chatMessage.message, chatMessage[4].result.data.chatMessage.user.avatar )}
                    catch(e3) {
                      console.log(e3)
                    }
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
          errorMessage([event.code, event.reason], "Chat Error")
        }
      };
      
      connection.onerror = function (error) { // oh noes, an error!
        console.log(`[error] ${error.message}`);
        console.log("Probably an auth issue. Please reauthenicate");
        throw "error, it crashed. p l e a s e f i x n o w"
      };
}

function sendMessage(data) {
  var msgArray = ["6","7","__absinthe__:control","doc"];
  msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:6, message: {message: \"" + data +" \"}) {message }}","variables":{}});
  var test = JSON.stringify(msgArray);
  console.log(test)
  connection.send(test)
}


function disconnect() {
  try {
  connection.close(1001, "So long and thanks for all the fish.")
  successMessage("Chat has been successfully disconnected!", "You can close this now.")
  } catch(e) {
    errorMessage(e, "Error disconnecting from the chat")
  }
}

function highlightMessage() {

}

function archiveMessage(message) {

}

function logMessage(user, message, avatar) {

  $("#chatList").prepend(`
    <li class="left clearfix admin_chat">
                     <div class="chat-body1 clearfix">
                        <span class="chat-img1 pull-left">
                           <img src="https://glimesh.tv${avatar}" alt="User Avatar" class="img-circle">
                        </span>
                        <p><span id="chatUser">${user}: </span> ${message}</p>
                        <!--<div class="whiteText pull-left">09:40PM</div> -->
                        </div>
                  </li>
                  `
  )
}


module.exports = { connectToGlimesh, disconnect, join, logMessage, sendMessage, updatePath}