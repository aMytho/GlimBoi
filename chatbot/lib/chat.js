//This file handles connecting the bot to a chat.
const WebSocket = require("ws");
var connection;
var chatID = ""
var logging = true;


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
    chatID = channelID

    connection.on("open", function open() {
      console.log("Connected to the Glimesh API");
      connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
      connection.send(`["1","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { user { username avatarUrl } message } }","variables":{} }]`); //Requests a specific channel. I can do multiple at the same time but idk about doing that...
      if (logging == true) {
          setTimeout(() => {
              ipcRenderer.send("startLogging", ""); // Tells the main process to start logging messages.
              ipcRenderer.once("startedLogging", (event, args) => {
                  console.log("Started to log chat messages.");
                  successMessage("Logging has begun.", "All messages will be saved.")
              });
              ipcRenderer.once("noLogSelected", (event, args) => {
                  errorMessage("Logging Error", "No file was selected. Messages will not be saved.")
              });
              ipcRenderer.once("endedLog", (event, args) => {
                  console.log("Logging has ended."), successMessage("Logging has ended", "Finished.")
              })
          }, 3000);
      }
      setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
          connection.send('[null,"6","phoenix","heartbeat",{}]');
      }, 30000);
      setInterval(() => { //every 5 minutes get the current view count
          ApiHandle.getStats().then(data => {
              console.log(data);
              if (data == null) {
                  console.log("Something is wrong with the channel or follow count thingy from function geetStats()")
              } else {
                  if (data.channel.stream.countViewers !== undefined && data.channel.stream.countViewers !== null) {
                      document.getElementById("fasUsers").innerHTML = `<span><i class="fas fa-users"></i></span> ${data.channel.stream.countViewers}`
                  }
                  if (data.followers.length !== undefined && data.followers.length !== null) {
                      document.getElementById("fasHeart").innerHTML = `<span><i class="fas fa-heart"></i></span> ${data.followers.length}`
                  }
                  if (data.channel.stream.newSubscribers !== undefined && data.channel.stream.newSubscribers !== null) {
                      document.getElementById("fasStar").innerHTML = `<span><i class="fas fa-star"></i></span> ${data.channel.stream.newSubscribers}`
                  }
              }
          })
      }, 180000);
  });
      connection.on("message", function(data) { //We recieve a message from glimesh chat! (includes heartbeats and other info)
          try {
            //First check for heartbeat message.
            var chatMessage = JSON.parse(data);
            if (chatMessage[4].status !== undefined) {
              console.log("Status: " + chatMessage[4].status);
            } else {
              //Its probably a chat message
              try {
                console.log(chatMessage)
                if (chatMessage[4].result.data !== undefined) {
                  console.log(chatMessage[4].result.data.chatMessage.user.username +": " + chatMessage[4].result.data.chatMessage.message);
                    if (chatMessage[4].result.data.chatMessage.message.startsWith("!")) { //If it is a command of some sort...
                      console.log("Searching for command");
                      var message = chatMessage[4].result.data.chatMessage.message.split(" ")
                      switch (message[0]) {
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
                          case "!quote":
                            switch (message[1]) {
                              case "" :
                              case " ":
                              case null:
                              case undefined:
                                randomQuoteChat()
                                break;
                              case "add":
                              case "new":
                                addQuoteChat(chatMessage[4].result.data.chatMessage, message[2])
                              break;
                              case "remove":
                                delUserChat(message[2])
                              break;
                              case "del":
                                delUserChat(message[2])
                              break;
                              case "delete":
                                delUserChat(message[2])
                              break;

                              default:
                                break;
                            }
                          break;
                          case "!test":
                          glimboiMessage("Test complete. If you have a command called test this replaced it.")
                          break;
                          case "!user":
                            switch (message[1]) {
                              case "new":
                              case "add":
                                addUserChat(message[2])
                              break;
                              case "remove":
                              case "del":
                              case "delete":
                                delUserChat(message[2])
                              break;
                              default:
                                break;
                            }
                          break;
                        default: //its not a glimboi command, may be a stream command. We need to check and do the output.
                        CommandHandle.checkCommand(chatMessage[4].result.data.chatMessage)
                          break;
                      }
                    }                    
                    try {logMessage(chatMessage[4].result.data.chatMessage.user.username, chatMessage[4].result.data.chatMessage.message, chatMessage[4].result.data.chatMessage.user.avatarUrl )}
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
  msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\"" + chatID +"\" , message: {message: \"" + data +" \"}) {message }}","variables":{}});
  var test = JSON.stringify(msgArray);
  console.log(test)
  connection.send(test)
}


function disconnect() {
  try {
  connection.close(1001, "So long and thanks for all the fish.")
  successMessage("Chat has been successfully disconnected!", "You can close this now.");
  if (logging == true) {
  setTimeout(() => {
    ipcRenderer.send("logEnd")
  }, 3000);
}
  } catch(e) {
    errorMessage(e, "Error disconnecting from the chat")
  }
}

//Sends a system message to chat. This is not a normal messgage such as a command response
function glimboiMessage(data) {
  var msgArray = ["6","7","__absinthe__:control","doc"];
  msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\"" + chatID +"\", message: {message: \"" + data +" \"}) {message }}","variables":{}});
  var test = JSON.stringify(msgArray);
  console.log(test)
  connection.send(test)
}


function test() {
  var test = JSON.stringify(["1","1","__absinthe__:control","doc",{"query": "subscription{ chatMessage { user { username avatar } message } }"}])
  connection.send(test);
  console.log(test)
}

function logMessage(user, message, avatar) {
  $("#chatList").prepend(`
    <li class="left clearfix admin_chat">
                     <div class="chat-body1 clearfix">
                        <span class="chat-img1 pull-left">
                           <img src="${avatar}" alt="User Avatar" class="img-circle">
                        </span>
                        <p><span id="chatUser">${user}: </span> ${message}</p>
                        <!--<div class="whiteText pull-left">09:40PM</div> -->
                        </div>
                  </li>
                  `
  );
  if (logging == true) {
  ipcRenderer.send("logMessage", {message: message, user: user})
  }
}

function addUserChat(user) {
  UserHandle.addUser(user).then(data => {
    if (data == "USEREXISTS") {
      glimboiMessage("That user is already added to GlimBoi.")
    } else if (data == "INVALIDUSER") {
      glimboiMessage("That user does not exist on Glimesh.")
    } else {
      glimboiMessage("User addded to GlimBoi!")
    }
  })
}

function delUserChat(user) {
  var exists = UserHandle.findByUserName(user);
  exists.then(data => {
    if (data == "ADDUSER") {
      glimboiMessage("No user was found with that name in GlimBoi.")
    } else {
      UserHandle.removeUser(user).then(deletedUser => { //removes the user from the db. Shows us afterwords
        removeUserFromTable(deletedUser);
        glimboiMessage("User removed!")
      })
    }
  })
}

function loggingEnabled(enabled) {
  if (enabled == true) {
    logging = true
  } else {
    logging = false
  }
}

function randomQuoteChat() {
  QuoteHandle.randomQuote().then(data => {
    glimboiMessage(`@${data.user} - ${data.data}`)
  })
}

function addQuoteChat(data, user) {
  console.log(user, data.message);
  console.log(data.message.substring(10))
  var trimMessage = 10 + user.length + 2
  QuoteHandle.addquote(user, data.message.substring(trimMessage))
}

module.exports = { connectToGlimesh, disconnect, glimboiMessage, join, loggingEnabled, logMessage, sendMessage, test}