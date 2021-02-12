//This file handles connecting the bot to a chat.
const WebSocket = require("ws"); // websocket library
var connection; // the websocket connection
var chatID = "" // the channel ID

var logging = true; // Should we log chat messages to a text file?

var heartbeat, stats; //heartbeat and stats intervals

var recentUserMessages = 0; //a count of user messages to compare against repeatable bot messages
var botName; //The username of the bot in normal caps
var repeatCommand; // A timer that sends a repeatable message to chat on a set interval
var repeatSpamProtection = 15, repeatDelay = 600000 // The users repeat settings. Default is at least 5 messages between repeats, attempt every 5 min

var currentUsers = [] // Array of current users. 
var checkForUsers;

/**
 * Tries to join a glimesh chat. Returns an error if the attempt failed.
 * @param {string} access_token Access token used for authentication
 * @param {number} channelID The channel ID for the channel we are joining
 */
function join(access_token, channelID) {
   try {connectToGlimesh(access_token, channelID)} catch(e) {
      console.log("we caught the error, poggers");
      errorMessage(e, "Chat Error")
   }
}

/**
 * Connects to a Glimesh chat.
 * @param {string} access_token Access token used for authentication
 * @param {number} channelID The channel ID for the channel we are joining
 */
function connectToGlimesh(access_token, channelID) {
    const url = `wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=${access_token}` // The websocket URL
    connection = new WebSocket(url); // Connection is now an offical connection!
    chatID = channelID // The channel ID is now an accessible variable for this module

    connection.on("open", function open() { // When the connection opens...
      console.log("Connected to the Glimesh API");
      connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
      connection.send(`["1","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { user { username avatarUrl } message } }","variables":{} }]`); //Requests a specific channel. I can do multiple at the same time but idk about doing that...
      if (logging == true) { // if the user wants us to log messages to a file...
          setTimeout(() => { // wait a few seconds and show a dialogue box. Asks for the location to lo messages.
              ipcRenderer.send("startLogging", ""); // Tells the main process to start logging messages.
              ipcRenderer.once("startedLogging", (event, args) => {
                  console.log("Started to log chat messages.");
                  successMessage("Logging has begun.", "All messages will be saved.");
              });
              ipcRenderer.once("noLogSelected", (event, args) => {
                  errorMessage("Logging Error", "No file was selected. Messages will not be saved.")
              });
              ipcRenderer.once("endedLog", (event, args) => {
                  console.log("Logging has ended."), successMessage("Logging has ended", "Finished.")
              })
          }, 3000);
      }
      heartbeat = setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
          connection.send('[null,"6","phoenix","heartbeat",{}]');
      }, 30000);
      //every 5 minutes get the current view count
      stats = setInterval(() => { 
          ApiHandle.getStats().then(data => {
              console.log(data);
              if (data == null) { // They are not live or the channel doesn't exist.
                  console.log("Something is wrong with the channel/follow count API request from function getStats()")
              } else { // Sets the info from the request next to the icons on the chat page.
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
      }, 900000);
      // Gets the name of the bot. Used to determine who is speaking (cooldown stuff)
      ApiHandle.getBotAccount().then(data => {
          try {
              console.log(`GlimBoi is acting as ${data} and the status is ${data.status}`)
              if (data == null) {
                  console.log("Error getting bot username.");
                  botName = "GlimBoi"
              } else if (data.status !== undefined) {
                  console.log("Auth error");
                  botName = "GlimBoi"
              } else {
                  botname = data
              }
          } catch (e) {
              console.log(e)
          }
      })
      //Sends a random repeatable message to chat based on the user setting.
      repeatCommand = setInterval(() => {
        if (recentUserMessages < repeatSpamProtection) {
          console.log("There is not enough non bot messages to send a repeat message. Waitng till next time.");
        } else {
          CommandHandle.randomRepeatCommand() // Gets a repeatable command
        }
      }, repeatDelay);
      // Checks for new users
      checkForUsers = setInterval(() => {
        console.log("Searching for new users and applying points to them.");
        var currentUsersFiltered = [...new Set(currentUsers)];
        currentUsers = [];
        console.log(currentUsersFiltered);
        if (currentUsersFiltered.length == 0) {
          console.log("No users in chat. No points will be sent out.")
        } else {
          currentUsersFiltered.forEach(function(value, index) {
            currentUsersFiltered[index] = {userName: value.toLowerCase()}
          })
          console.log(currentUsersFiltered)
        UserHandle.earnPointsWT(currentUsersFiltered);
        }
      }, 900000);
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
                  currentUsers.push(chatMessage[4].result.data.chatMessage.user.username.toLowerCase()) // adds to the user array
                    if (chatMessage[4].result.data.chatMessage.message.startsWith("!")) { //If it is a command of some sort...
                      console.log("Searching for command");
                      var message = chatMessage[4].result.data.chatMessage.message.split(" ")
                      switch (message[0]) {
                        case "!commands": // Returns a list of all commands
                          commandList();
                          break;
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
                              case undefined: // Returns a random quote
                                randomQuoteChat() 
                                break;
                              case "add":
                              case "new": // adds a new quote
                                addQuoteChat(chatMessage[4].result.data.chatMessage, message[2])
                              break;
                              case "remove": // removes a quote
                              case "delete": // removes a quote
                              case "del": // removes a quote
                                delQuoteChat(message[2], message[3]);
                                break;
                              default:
                                break;
                            }
                          break;
                          case "!points":
                            switch (message[1]) {
                              case "" :
                              case " ":
                              case null:
                              case undefined: 
                                UserHandle.findByUserName(chatMessage[4].result.data.chatMessage.user.username.toLowerCase()).then(data => {
                                  if (data == "ADDUSER") {filterMessage("That user does not exist in the database yet. Type !user new " + chatMessage[4].result.data.chatMessage.user.username.toLowerCase(), "Glimboi")} else {
                                    filterMessage(chatMessage[4].result.data.chatMessage.user.username.toLowerCase() + " has " + data[0].points + " " + settings.Points.name, "Glimboi")
                                  }
                                })
                                break;                            
                              default:
                                break;
                            }
                            break;
                          case "!test":
                          glimboiMessage("Test complete. If you have a command called test this replaced it.");
                          break;
                          case "!user":
                            switch (message[1]) {
                              case "new":
                              case "add": // adds a user
                                addUserChat(message[2])
                              break;
                              case "remove":
                              case "del":
                              case "delete": // removes a user
                                delUserChat(message[2])
                              break;
                              default:
                                break;
                            }
                          break;
                        default: //its not a glimboi command, may be a stream command. We need to check and send the output to chat.
                        CommandHandle.checkCommand(chatMessage[4].result.data.chatMessage)
                          break;
                      }
                    }
                    try { // We try to log the message to the chat box (glimboi) and may log to a file
                      logMessage(chatMessage[4].result.data.chatMessage.user.username, chatMessage[4].result.data.chatMessage.message, chatMessage[4].result.data.chatMessage.user.avatarUrl )
                    }
                    catch(e3) {
                      console.log(e3)
                    }
                    // Add a user message counter if it isn't the bot
                    if (chatMessage[4].result.data.chatMessage.user.username !== botname) {recentUserMessages++}
                }
              } catch (e2) {
                console.log(e2);
                disconnectError()
              }
            }
          } catch (e1) {
            console.log(e1);
          }
      })

      connection.onclose = function (event) { //The connection closed, if error the error will be triggered too
        try { // in rare cases the polling and hearrtbeat never start, this prevents a crash from stopping something that doesn't exist
        clearInterval(heartbeat) // stops the hearbteat
        clearInterval(stats) // stops the polling
        clearInterval(repeatCommand)
        clearInterval(checkForUsers)
        } catch(e) {console.log(e)}
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

/**
 * Disconnects from Glimesh chat.
 */
function disconnect() {
  try {
  connection.close(1001, "So long and thanks for all the fish.") // closes the websocket
  successMessage("Chat has been successfully disconnected!", "You can close this now.");
  if (logging == true) {
  setTimeout(() => {
    ipcRenderer.send("logEnd") // ends the logging
  }, 3000);
}
  } catch(e) {
    errorMessage(e, "Error disconnecting from the chat")
  }
}

/**
 * Disconnecting because of an error.
 */
function disconnectError() {
  try {
  connection.close(1001, "So long and thanks for all the fish.")
  errorMessage("Chat has been disconnected due to an error.", "Press shift+ctrl+i and navigate to the console for more info. Rejoin when ready.");
  if (logging == true) {
  setTimeout(() => {
    ipcRenderer.send("logEnd")
  }, 3000);
}
  } catch(e) {
    errorMessage(e, "Error disconnecting from the chat")
  }
}

/**
 * Filters a message to prepare it for sending. If it cannot be sent we send a message to chat notifying the stream.
 * @param {string} message The chat message to be sent to chat
 * @param {string} source Where the emssage is coming from. Either user or glimboi
 */
function filterMessage(message, source) {
  if (source == "user") {
    if (message.length > 255) {
      sendMessage("The command/message was too long to send.");
    } else {
      message = message.replace(/[\t\r\n""]+/g, "");
      sendMessage(message);
    }
  } else {
    if (message.length > 255) {
      glimboiMessage("The command/message was too long to send.");
    } else {
      message = message.replace(/[\t\r\n""]+/g, "");
      glimboiMessage(message);
    }
  }
}


/**
 * Sends a message to chat. This function is called when a user presses send.
 * @param {string} data A message to be sent to chat
 */
function sendMessage(data) {
  var msgArray = ["6","7","__absinthe__:control","doc"]; // array of data to send to glimesh
  // adds the message to it.
  msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\""+chatID+"\",message:{message:\""+data+"\"}) {message }}","variables":{}});
  var test = JSON.stringify(msgArray); // make it sendable (json)
  try {
  console.log(test)
  connection.send(test) // sends it to chat!
  } catch(e) {
    errorMessage("Auth Error", "The bot must be authenticated for this feature to work. You must be in a chat to send a message.")
  }
}

/**
 * Sends a message to chat as the bot. This is not from a user pressing send. 
 * @param {string} data The message to be sent to chat
 */
function glimboiMessage(data) {
  var msgArray = ["6","7","__absinthe__:control","doc"];
  msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\"" + chatID +"\", message:{message:\""+data+"\"}) {message }}","variables":{}});
  var test = JSON.stringify(msgArray);
  console.log(test)
  connection.send(test)
}

/**
 * Test function. Requests a ws subscription to a chatroom. Most likely broken by now :)
 */
function test() {
  var test = JSON.stringify(["1","1","__absinthe__:control","doc",{"query": "subscription{ chatMessage { user { username avatar } message } }"}])
  connection.send(test);
  console.log(test)
}


/**
 * 
 * @param {string} user The user who said the message
 * @param {string} message The message
 * @param {string} avatar The avatar URL
 */
function logMessage(user, message, avatar) {
  // We prepend this on the list of chat messages.
  $("#chatList").prepend(`
    <li class="left clearfix admin_chat">
                     <div class="chat-body1 clearfix testing">
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
  ipcRenderer.send("logMessage", {message: message, user: user}) // tell the main process to log this to a file.
  }
}

/**
 * Adds a user from Glimesh chat.
 * @param {string} user The user who will be added
 */
function addUserChat(user) {
  UserHandle.addUser(user, false).then(data => {
    if (data == "USEREXISTS") {
      glimboiMessage("That user is already added to GlimBoi.")
    } else if (data == "INVALIDUSER") {
      glimboiMessage("That user does not exist on Glimesh.")
    } else {
      glimboiMessage("User addded to GlimBoi!")
    }
  })
}

/**
 * Removes a user from chat
 * @param {string} user User to be removed
 */
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

/**
 * Sets message logging on or off
 * @param {boolean} enabled is logging enabled?
 */
function loggingEnabled(enabled) {
  console.log("Logging is set to " + enabled)
  if (enabled == true) {
    logging = true
  } else {
    logging = false
  }
}

/**
 * Sets the settings for repeat commands
 * @param {object} settings Settings object
 * @param settings.Commands.repeatDelay //Delay between repeatable messages
 * @param settings.Commands.repeatSpamProtection Amount of non bot messages that must be present before a repeatable message is sent.
 */
function repeatSettings(settings) {
  console.log(settings.Commands.repeatDelay)
  switch (settings.Commands.repeatDelay) { // seconds to ms converter
    case 5:
      repeatDelay = 300000
      break;
      case 10:
        repeatDelay = 600000
      break;
      case 15:
      repeatDelay = 900000
      break;
      case 20:
        repeatDelay = 1200000
      break;
      case 25:
        repeatDelay = 1500000 
      break;
      case 30:
        repeatDelay = 1800000
      break;
      case 35:
        repeatDelay = 2100000 
      break;
      case 40:
        repeatDelay = 2400000
      break;
      case 45:
        repeatDelay = 2400000 
      break;
      case 50:
        repeatDelay = 3000000
      break;
      case 55:
        repeatDelay = 3300000 
      break;
      case 60:
        repeatDelay = 3600000
      break;
  
    default:repeatDelay = 600000
      break;
  }
  switch (settings.Commands.repeatSpamProtection) { // sets the spam protection limit
    case 5:
      repeatSpamProtection = 5
      break;
      case 15:
      repeatSpamProtection = 15
      break;
      case 30:
      repeatSpamProtection = 30
      break;
      case 60:
      repeatSpamProtection = 60
      break;
  
    default:repeatSpamProtection = 15
      break;
  }
}

/**
 * Returns a random quote and sends it to chat.
 */
function randomQuoteChat() {
  QuoteHandle.randomQuote().then(data => {
    if (data == null) {
      glimboiMessage(`No quotes exist.`)
    } else {
    filterMessage(`@${data.user} - ${data.data}`, "glimboi")
    }
  })
}

/**
 * Adds a quote from chat.
 * @param {object} data Message and other data
 * @param {string} user Who said the quote
 */
function addQuoteChat(data, user) {
  console.log(user, data.message);
  console.log(data.message.substring(10))
  var trimMessage = 10 + user.length + 2
  QuoteHandle.addquote(user.toLowerCase(), data.message.substring(trimMessage)).then(data => {
    if (data == "QUOTEFINISHED") {
      glimboiMessage(`Quote added.`)
    } else {
      glimboiMessage(`That user does not exist.`)
    }
  })
}

/**
 * Removes a quote by username and ID. The paramaters are converted just to be safe.
 * @param {String} user The user who said the quote
 * @param {Number} id The ID of the quote.
 */
function delQuoteChat(user, id) {
  console.log(user, id);
  console.log(typeof id)
  console.log(id)
  if (user == "" || user == " " || id == "" || id == " " || user == undefined || id == undefined) {
    glimboiMessage("A user and an ID must be included. ex. !quote del mytho 2")
  } else {
  UserHandle.removeQuoteByID(Number(id), user.toLowerCase()).then(data => {
    if (data == "NOQUOTEFOUND") {
      glimboiMessage("No quote was found with that ID.")
    } else {
      glimboiMessage("Quote removed.")
    }
  })
}
}

/**
 * Resets the user message counter. This helps with repeat spam protection
 */
function resetUserMessageCounter() {
  recentUserMessages = 0
}

/**
 * Returns a list of all commands to chat.
 */
function commandList() {
  var cmdList = []
  CommandHandle.getAll().then(data => {
    for (let index = 0; index < data.length; index++) {
      cmdList.push(data[index].commandName)
    }
    var cmdmsg = cmdList.toString()
    filterMessage(cmdmsg);
  })
}

module.exports = { connectToGlimesh, disconnect, filterMessage, glimboiMessage, join, loggingEnabled, logMessage, repeatSettings, resetUserMessageCounter, sendMessage, test}