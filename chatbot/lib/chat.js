//This file handles connecting the bot to a chat.
const WebSocket = require("ws"); // websocket library
var connection; // the websocket connection
var heartbeat; //heartbeat
var botName = "GlimBoi"; //The username of the bot in normal caps
var messageHistoryCount = 20;
var path = "./";

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
  console.log("User path is " + GUI);
  path = GUI;
}

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
 * Returns the connection for other modules
 *
 * @returns {WebSocket} WebSocket Connection
 */
function getConnection() {
  return connection;
}

/**
 * Determines if the websocket is connected or connecting
 *
 * @return {bool}
 */
function isConnected() {
  if (connection === undefined) {return false};
  return connection.readyState !== WebSocket.CLOSED && connection.readyState !== WebSocket.CLOSING;
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
    connection.send(`["1","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { id,user { username avatarUrl id } message } }","variables":{} }]`); //Requests a specific channel. I can do multiple at the same time but idk about doing that...

    // Load requirements for working chat
    ChatSettings = require(appData[0] + "/chatbot/lib/chat/chatSettings.js");
    ChatSettings.loadChatSettings(settings);
    ChatActions  = require(appData[0] + "/chatbot/lib/chat/chatActions.js");
    ChatStats    = require(appData[0] + "/chatbot/lib/chat/chatStats.js");
    ChatStats.loadChatStats();
    ChatMessages = require(appData[0] + "/chatbot/lib/chat/chatMessages.js");

    heartbeat = setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
      connection.send('[null,"6","phoenix","heartbeat",{}]');
    }, 30000);
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
          botName = data
        }
      } catch (e) {
        console.log(e)
      }
    })
  });

  connection.on("message", function (data) { //We recieve a message from glimesh chat! (includes heartbeats and other info)
    try {
      //First check for heartbeat message.
      var chatMessage = JSON.parse(data);
      if (chatMessage[4].status !== undefined) {
        console.log("Status: " + chatMessage[4].status);
      } else {
        //Its probably a chat message
        try {
          if (chatMessage[4].result.data !== undefined) {
            var userChat = chatMessage[4].result.data.chatMessage.user.username;
            var messageChat = chatMessage[4].result.data.chatMessage.message;
            var userID = Number(chatMessage[4].result.data.chatMessage.user.id)
            console.log(userChat + ": " + messageChat);
            arrayOfEvents.forEach(element => {
              console.log(arrayOfEvents)
              EventHandle.handleEvent(element, userChat, messageChat)
            });
            ChatStats.addCurrentUser(userChat)
            if (messageChat.startsWith("!")) { //If it is a command of some sort...
              console.log("Searching for command");
              var message = messageChat.split(" ")
              switch (message[0]) {
                case "!commands": // Returns a list of all commands
                ChatActions.commandList();
                  break;
                case "!command":
                case "!cmd":
                  switch (message[1]) {
                    case "add":
                    case "new":
                    CommandHandle.addCommandFilter(message[2], null, messageChat, message[0])
                      break;
                    case "help":
                    case "info":
                      CommandHandle.info()
                    default:
                      break;
                  }
                  break;
                case "!quote":
                  switch (message[1]) {
                    case "":
                    case " ":
                    case null:
                    case undefined: // Returns a random quote
                    ChatActions.randomQuoteChat()
                      break;
                    case "add":
                    case "new": // adds a new quote
                    ChatActions.addQuoteChat(chatMessage[4].result.data.chatMessage, message[2])
                      break;
                    case "remove": // removes a quote
                    case "delete": // removes a quote
                    case "del": // removes a quote
                    ChatActions.delQuoteChat(message[2], message[3]);
                      break;
                    default:
                      break;
                  }
                  break;
                case "!points":
                  switch (message[1]) {
                    case "":
                    case " ":
                    case null:
                    case undefined:
                      UserHandle.findByUserName(userChat.toLowerCase()).then(data => {
                        if (data == "ADDUSER") { ChatMessages.filterMessage("That user does not exist in the database yet. Type !user new " + userChat.toLowerCase(), "Glimboi") } else {
                          ChatMessages.filterMessage(userChat.toLowerCase() + " has " + data.points + " " + settings.Points.name, "Glimboi")
                        }
                      })
                      break;
                    case "top":
                      UserHandle.getTopPoints(userChat.toLowerCase()).then(data => {
                        console.log(data)
                        if (data.length > 0) {
                          ChatMessages.filterMessage("The top user is " + data[0].userName, "glimboi")
                        } else {
                          ChatMessages.filterMessage("There are not enough users to use the leaderboad function.", "glimboi")
                        }
                      })
                      break;
                    default:
                      if (!isNaN(message[1])) {
                        UserHandle.getTopPoints(userChat.toLowerCase()).then(data => {
                          if (data.length > 0) {
                            var pointsPosition = Number(message[1])
                            console.log(pointsPosition)
                            if (pointsPosition <= 0) {
                              ChatMessages.filterMessage("That number is not valid.")
                            } else if (data[pointsPosition-1] !== undefined) {
                              pointsPosition = pointsPosition - 1
                              ChatMessages.filterMessage("Number " + (pointsPosition + 1) + " is " + data[pointsPosition].userName + " with " + data[pointsPosition].points)
                            } else {
                              ChatMessages.filterMessage("There is not a user with that position.")
                            }
                          } else {
                            ChatMessages.filterMessage("There are not enough users to use the leaderboad function.", "glimboi")
                          }
                        })
                      }
                      break;
                  }
                  break;
                case "!test":
                  ChatMessages.glimboiMessage("Test complete. If you have a command called test this replaced it.");
                  break;
                case "!raffle":
                  startRaffle()
                  break;
                case "!poll":
                  startPoll(userChat, null, null, messageChat);
                  break;
                case "!glimrealm":
                  openGlimRealm(userChat.toLowerCase())
                  break;
                case "!user":
                  switch (message[1]) {
                    case "new":
                    case "add": // adds a user
                    ChatActions.addUserChat(message[2])
                      break;
                    case "remove":
                    case "del":
                    case "delete": // removes a user
                    ChatActions.delUserChat(message[2])
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
              globalChatMessages.push([userChat, messageChat, chatMessage[4].result.data.chatMessage.user.avatarUrl]);

              globalChatMessages = globalChatMessages.slice(Math.max(globalChatMessages.length - messageHistoryCount, 0))
              ChatMessages.logMessage(userChat, messageChat, chatMessage[4].result.data.chatMessage.user.avatarUrl);
              ModHandle.scanMessage(userChat.toLowerCase(), messageChat.toLowerCase(), userID) // filter the message if needed
            }
            catch (e3) {

            }
            // Add a user message counter if it isn't the bot
            if (userChat !== botName) { ChatStats.increaseUserMessageCounter() }
          }
        } catch (e2) {
          console.log(e2);
          disconnectError()
        }
      }
    } catch (e1) {
      console.log(e1);
    }
  });

    connection.onclose = function (event) { //The connection closed, if error the error will be triggered too
      try { // in rare cases the polling and hearrtbeat never start, this prevents a crash from stopping something that doesn't exist
      clearInterval(heartbeat) // stops the hearbteat
      ChatSettings.stopChatSettings(); // stops everything else
      ChatStats.stopChatStats()
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
      try { // in rare cases the polling and hearrtbeat never start, this prevents a crash from stopping something that doesn't exist
      clearInterval(heartbeat) // stops the hearbteat
      ChatSettings.stopChatSettings(); // stops everything else
      ChatStats.stopChatStats();
      } catch(e) {console.log(e)}
      throw "error, it crashed. p l e a s e f i x n o w"
    };
}

/**
 * Disconnects from Glimesh chat.
 */
function disconnect(displayMessage = true) {
  try {
    connection.close(1001, "So long and thanks for all the fish.") // closes the websocket
    if (displayMessage) successMessage("Chat has been successfully disconnected!", "You can close this now.");
    if (ChatSettings.isLoggingEnabled() == true) {
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
    if (ChatSettings.isLoggingEnabled() == true) {
      setTimeout(() => {
        ipcRenderer.send("logEnd")
      }, 3000);
    }
  } catch(e) {
    errorMessage(e, "Error disconnecting from the chat")
  }
}

/**
 * Returns the name of the Bot
 */
function getBotName() {
  return botName
}


module.exports = { getConnection, updatePath, isConnected, connectToGlimesh, disconnect, getBotName, join}
