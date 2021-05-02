//This file handles connecting the bot to a chat.
let connection; // the websocket connection
let heartbeat; //heartbeat
let botName = "GlimBoi"; //The username of the bot in normal caps
let messageHistoryCount = 20;

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

  	connection.onopen = function () { // When the connection opens...
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
        // Load Overlay (OBS and Music)
        OBSHandle.startServer();

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
    	});
  	};

  	connection.onmessage = function (event) { //We recieve a message from glimesh chat! (includes heartbeats and other info)
    	try {
      		//First check for heartbeat message.
      		let chatMessage = JSON.parse(event.data);
      		if (chatMessage[4].status !== undefined) {
        		console.log("Status: " + chatMessage[4].status);
      		} else {
        		//Its probably a chat message
        		try {
          			if (chatMessage[4].result.data !== undefined) {
            			let userChat = chatMessage[4].result.data.chatMessage.user.username;
            			let messageChat = chatMessage[4].result.data.chatMessage.message;
            			let userID = Number(chatMessage[4].result.data.chatMessage.user.id)
            			console.log(userChat + ": " + messageChat);
            			EventHandle.getCurrentEvents().forEach(element => {
              				EventHandle.handleEvent(element, userChat, messageChat)
            			});
            			ChatStats.addCurrentUser(userChat)
            			if (messageChat.startsWith("!")) { //If it is a command of some sort...
              				console.log("Searching for command");
              				let message = messageChat.split(" ")
              				switch (message[0]) {
                				case "!commands": // Returns a list of all commands
                					ChatActions.commandList();
                  				break;
                				case "!command":
                				case "!cmd":
                  				switch (message[1]) {
                    				case "add":
                    				case "new":
                                        ChatActions.addCommand(userChat.toLowerCase(), message[2], messageChat, message[0])
                      				break;
                                    case "del":
                                    case "remove":
                                    case "delete":
                                        ChatActions.removeCommand(userChat.toLowerCase(), message[2].toLowerCase())
                                        break;
                                    case "":
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
                    					ChatActions.addQuoteChat(userChat.toLowerCase(), chatMessage[4].result.data.chatMessage, message[2])
                      				break;
                    				case "remove": // removes a quote
                    				case "delete": // removes a quote
                    				case "del": // removes a quote
                    					ChatActions.delQuoteChat(userChat.toLowerCase(), message[2], message[3]);
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
                      					ChatActions.getOwnPointsChat(userChat);
                      				break;
                    				case "top":
                      					ChatActions.getTopPoints()
                      				break;
                                    case "add":
                                    case "+":
                                    case "inc": ChatActions.addPointsChat(userChat, message[2], message[3])
                                    break;
                                    case "sub":
                                    case "-":
                                    case "del": ChatActions.removePointsChat(userChat, message[2], message[3])
                                    break;
                                    case "set":
                                    case "=": ChatActions.editPointsChat(userChat, message[2], message[3])
                                    break;
                                    case "get": ChatActions.getPointsChat(message[2])
                                    break;
                                    case "help": ChatMessages.filterMessage("Syntax: !points ACTION(add,sub,set,get) USER(who you are targeting) COUNT(a number)", "glimboi")
                                    break;
                    				default:
                      					ChatActions.getTopPoints(message[1], true);
                      				break;
                  				}
                  				break;
                				case "!test": ChatMessages.glimboiMessage("Test complete. If you have a command called test this replaced it.");
                  				break;
                				case "!raffle": EventHandle.raffle.checkRaffleStatus(false, ChatHandle.isConnected())
                  				break;
                				case "!poll": EventHandle.poll.checkPollStatus(userChat, null, null, messageChat);
                  				break;
                				case "!glimrealm": EventHandle.glimRealm.openGlimRealm()
                  				break;
                                case "!bankheist": EventHandle.bankHeist.startBankHeist(userChat.toLowerCase())
                				case "!user":
                  					switch (message[1]) {
                    					case "new":
                    					case "add": // adds a user
                    						ChatActions.addUserChat(userChat.toLowerCase(), message[2])
                      					break;
                    					case "remove":
                    					case "del":
                    					case "delete": // removes a user
                    						ChatActions.delUserChat(userChat.toLowerCase(), message[2])
                      					break;
                    					default:
                      					break;
                  					}
                  				break;
                                case "!rank": ChatActions.getRank(userChat.toLowerCase());
                                break;
                                case "!song" : ChatActions.getSong();
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
            			} catch (e3) {
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
  	};

    connection.onclose = function (event) { //The connection closed, if error the error will be triggered too
      	try { // in rare cases the polling and hearrtbeat never start, this prevents a crash from stopping something that doesn't exist
      		clearInterval(heartbeat) // stops the hearbteat
      		ChatSettings.stopChatSettings(); // stops everything else
      		ChatStats.stopChatStats()
      	} catch(e) {console.log(e)}
      		if (event.wasClean) {
        		console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
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
    	connection.close(1000, "So long and thanks for all the fish.") // closes the websocket
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
    	connection.close(1000, "So long and thanks for all the fish.")
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


module.exports = { getConnection, isConnected, connectToGlimesh, disconnect, getBotName, join}
