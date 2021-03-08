//This file handles connecting the bot to a chat.
const WebSocket = require("ws"); // websocket library
var connection; // the websocket connection
var chatID = "" // the channel ID

var heartbeat; //heartbeat

var botName = "GlimBoi"; //The username of the bot in normal caps

var messageHistoryCount = 20;

var recentChannelsDB;
var path = "./";



/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
  console.log("User path is " + GUI);
  path = GUI;
  recentChannelsDB = new Datastore({ filename: `${path}/data/recentChannels.db`, autoload: true });
}

/**
 * Adds a recent channel to GlimBoi
 * @param {string} object The channel object
 * @returns If successful returns the user.
 */
async function addRecentChannel(channel, timestamp = null, autoJoin = false) {
  var timestamp = timestamp ?? (Date.now());

  var channelDoc = await new Promise(done => {
    recentChannelsDB.find({ channel: channel }, function (err, doc) {
      if (doc.length == 0) {
        console.log("No channel was found with the name " + channel);
        recentChannelsDB.insert({channel: channel, timestamp: timestamp}, function (err, doc) {
          console.log(doc);
          done(doc)
        });
      } else {
        recentChannelsDB.update({ channel: channel }, { $set: { timestamp: timestamp } }, {returnUpdatedDocs: true}, function (err, num, doc) {
          console.log(doc);
          done(doc)
        });
      }
    })
  })
  return channelDoc;
}

/**
 * Disables autoJoin for all channels, then enables for a specified channel
 *
 * @param {string} id
 * @param {bool} autoJoinEnabled
 */
async function setAutoJoinChannelByID(id, autoJoinEnabled) {
  return new Promise(done => {
    console.log(`Disabling autoJoin for all channels`);

    recentChannelsDB.update({ autoJoin: true }, { $set: { autoJoin: false } }, {returnUpdatedDocs: false}, function (err, num, doc) {
      if (autoJoinEnabled) {
        console.log(`Setting autojoin to ${autoJoinEnabled} for ${id}`);
        recentChannelsDB.update({ _id: id }, { $set: { autoJoin: autoJoinEnabled } }, {returnUpdatedDocs: true}, function (err, num, doc) {
          done(doc)
        });
      } else {
        done(null);
      }
    });
  });
}

/**
 * Removes a channel from recent chat DB, by the channel ID, the ID is what's in the DB
 *
 * @param {string} id Name of the id
 */
async function removeRecentChannelByID(id) {
  return new Promise(resolve => {
    recentChannelsDB.remove({ _id: id }, { multi: false }, function (err, doc) {
      resolve()
    });
  });
}


/**
 * Get all recent Channels
 * @returns Returns array of channel objects
 */
async function getAllRecentChannels() {
  return new Promise(resolve => {
    recentChannelsDB.find({}, function (err, docs) {
      console.log('Returning all recent channels.');
      resolve(docs)
    })
  })
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
    ChatSettings = require(appData[0] + "/chatbot/lib/chat/chatSettings.js");
    ChatSettings.loadChatSettings(settings);
    ChatActions = require(appData[0] + "/chatbot/lib/chat/chatActions.js")
    ChatStats = require(appData[0] + "/chatbot/lib/chat/chatStats.js")
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
                        if (data == "ADDUSER") { filterMessage("That user does not exist in the database yet. Type !user new " + userChat.toLowerCase(), "Glimboi") } else {
                          filterMessage(userChat.toLowerCase() + " has " + data[0].points + " " + settings.Points.name, "Glimboi")
                        }
                      })
                      break;
                    case "top":
                      UserHandle.getTopPoints(userChat.toLowerCase()).then(data => {
                        console.log(data)
                        if (data.length > 0) {
                          filterMessage("The top user is " + data[0].userName, "glimboi")
                        } else {
                          filterMessage("There are not enough users to use the leaderboad function.", "glimboi")
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
                              filterMessage("That number is not valid.")
                            } else if (data[pointsPosition-1] !== undefined) {
                              pointsPosition = pointsPosition - 1
                              filterMessage("Number " + (pointsPosition + 1) + " is " + data[pointsPosition].userName + " with " + data[pointsPosition].points)
                            } else {
                              filterMessage("There is not a user with that position.")
                            }
                          } else {
                            filterMessage("There are not enough users to use the leaderboad function.", "glimboi")
                          }
                        })
                      }
                      break;
                  }
                  break;
                case "!test":
                  glimboiMessage("Test complete. If you have a command called test this replaced it.");
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
              logMessage(userChat, messageChat, chatMessage[4].result.data.chatMessage.user.avatarUrl);
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
 * Filters a message to prepare it for sending. If it cannot be sent we send a message to chat notifying the stream.
 * @param {string} message The chat message to be sent to chat
 * @param {string} source Where the emssage is coming from. Either user or glimboi
 */
function filterMessage(message, source) {
  if (message.length == 0 ) {
    console.log("Message was not long enough or no message was sent.");
    sendMessage("The message was not long enough or no message was sent.")
    return
  }
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
  try {
    console.log(test)
    connection.send(test)
  } catch(e) {
    errorMessage("Message Error", "Message failed to send. You must be authenticated and be in a chat to send a message.")
  }
}


/**
 * Logs the message in the UI. Send a message to the main process to log the file if enabled.
 * @param {string} user The user who said the message
 * @param {string} message The message
 * @param {string} avatar The avatar URL
 */
function logMessage(user, message, avatar) {
  var adminClass = (user === botName) ? 'admin_chat' : '';

  $("#chatList").append(`
    <li class="left clearfix ${adminClass} w-100" name='${user}' oncontextmenu='testingStuff(event)'>
        <div class="chat-body1 clearfix testing" name='${user}'>
        <span class="chat-img1 pull-left" name='${user}'>
            <img src="${avatar}" alt="User Avatar" class="rounded-circle" name='${user}'>
        </span>
        <p name='${user}'><span id="chatUser" name='${user}' >${user}: </span> ${message}</p>
        <!--<div class="whiteText pull-left">09:40PM</div> -->
        </div>
    </li>`
  );
    var scroll = document.getElementById("chatContainer")
    scroll.scrollTo(0,document.getElementById("chatList").scrollHeight);

  if (ChatSettings.isLoggingEnabled() == true) {
    ipcRenderer.send("logMessage", {message: message, user: user}) // tell the main process to log this to a file.
  }

}

/**
 * Returns the name of the Bot
 */
function getBotName() {
  return botName
}


module.exports = { updatePath, addRecentChannel, setAutoJoinChannelByID, getAllRecentChannels, removeRecentChannelByID, isConnected, connectToGlimesh, disconnect, filterMessage, getBotName, glimboiMessage, join, logMessage, sendMessage}
