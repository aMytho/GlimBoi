//This file handles connecting the bot to a chat.
let connection:WebSocket; // the websocket connection
let heartbeat:any; //heartbeat
let botName = "GlimBoi"; //The username of the bot in normal caps
let messageHistoryCount = 20;

/**
 * Tries to join a glimesh chat. Returns an error if the attempt failed.
 * @param {string} access_token Access token used for authentication
 * @param {number} channelID The channel ID for the channel we are joining
 */
function join(access_token:accessToken, channelID, isReconnect:boolean) {
  	try {connectToGlimesh(access_token, channelID, isReconnect)} catch(e) {
     	console.log("we caught the error, poggers");
     	errorMessage(e, "Chat Error")
  	}
}

/**
 * Returns the connection for other modules
 *
 * @returns {WebSocket} WebSocket Connection
 */
function getConnection(): WebSocket {
  	return connection;
}

/**
 * Determines if the websocket is connected or connecting
 *
 * @return {boolean}
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
function connectToGlimesh(access_token:string, channelID, isReconnect:boolean) {
  	const url = `wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=${access_token}` // The websocket URL
  	connection = new WebSocket(url); // Connection is now an offical connection!
  	chatID = channelID // The channel ID is now an accessible variable for this module

  	connection.onopen = function () { // When the connection opens...
    	console.log("Connected to the Glimesh API");
    	connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
    	connection.send(`["1","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { id,user { username avatarUrl id } message } }","variables":{} }]`); //Requests a specific channel. I can do multiple at the same time but idk about doing that...

    	heartbeat = setInterval(() => { //every 30 seconds send a heartbeat so the connection won't be dropped for inactivity.
      		connection.send('[null,"6","phoenix","heartbeat",{}]');
    	}, 20000);

        // Run the post chat scripts
        postChat();

        if (isReconnect) {
            ChatMessages.filterMessage("Glimboi was disconnected and has now returned.", "glimboi");
        } else {
            ChatMessages.filterMessage("Glimboi has joined the chat :glimsmile:", "glimboi");
        }
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
                    console.log(chatMessage[4], chatMessage)
          			if (chatMessage[4].result.data !== undefined) {
            			let userChat:userName = chatMessage[4].result.data.chatMessage.user.username;
            			let messageChat = chatMessage[4].result.data.chatMessage.message;
            			let userID = Number(chatMessage[4].result.data.chatMessage.user.id)
            			console.log(userChat + ": " + messageChat);
            			EventHandle.getCurrentEvents().forEach(element => {
              				EventHandle.handleEvent(element, userChat, messageChat)
            			});
            			ChatStats.addCurrentUser(userChat)
            			if (messageChat.startsWith("!")) { //If it is a command of some sort...
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
                                    case "get": ChatActions.getPointsChat(userChat, message[2])
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
                                case "!sr":
                  					if (message[1] !== undefined) {
                                        switch (message[1].toLowerCase()) {
                                            case "current":
                                            case "now":
                                                ChatActions.getSong();
                                              break;
                                            case "next":
                                            case "n":
                                                ChatActions.nextSong(userChat, "get")
                                              break;
                                            case "last":
                                            case "l":
                                                ChatActions.previousSong(userChat, "get")
                                              break;
                                            case "skip": ChatActions.nextSong(userChat, "set")
                                            break;
                                            case "previous": ChatActions.previousSong(userChat, "set");
                                            break;
                                            case "repeat":
                                            case "loop":
                                                ChatActions.replaySong(userChat)
                                            break;
                                            case "shuffle":
                                            case "random":
                                                ChatActions.toggleShuffle(userChat)
                                            break;
                                            case "toggle":
                                                ChatActions.toggleShuffle(userChat)
                                            break;
                                            //case "queue":
                                            //case "list":
                                                //ChatMessages.glimboiMessage("Feature coming soon");
                                            //break;
                                            default: ChatMessages.glimboiMessage("Command not known. Try !sr next, last, skip, previous, repeat, shuffle, toggle");
                                              break;
                                          }
                                      } else {
                                        ChatMessages.glimboiMessage("Command not known. Try !sr next, last, skip, previous, repeat, shuffle, toggle");
                                      }
                  				break;
                				default: //its not a glimboi command, may be a streamer command. We need to check and send the output to chat.
                  					CommandHandle.CommandRunner.checkCommand(chatMessage[4].result.data.chatMessage)
                  				break;
              				}
            			}
            			try {
                            ChatMessages.logMessage(userChat, messageChat, chatMessage[4].result.data.chatMessage.user.avatarUrl, false, chatMessage[4].result.data.chatMessage.id, "none");
              				globalChatMessages.push([userChat, messageChat, chatMessage[4].result.data.chatMessage.user.avatarUrl, chatMessage[4].result.data.chatMessage.id, "none"]);
              				globalChatMessages = globalChatMessages.slice(Math.max(globalChatMessages.length - messageHistoryCount, 0));
              				ModHandle.ModPowers.scanMessage(userChat, messageChat.toLowerCase(), chatMessage[4].result.data.chatMessage.id, userID) // filter the message if needed
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
        		errorMessage(String([event.code, event.reason]), "Chat Error. Attempting to reconnect...");
                reconnect()
      		}
    	};

    connection.onerror = function (error) { // oh noes, an error!
      	console.log(`[error] ${error}`);
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
function disconnect(displayMessage:boolean) {
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
 * Disconnecting because of an error parsing the message
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

/**
 * Runs after the connection is made to chat.
 */
function postChat():void {
    // Load requirements for working chat
    ChatSettings = require(appData[0] + "/modules/chat/chatSettings.js");
    ChatActions = require(appData[0] + "/modules/chat/chatActions.js");
    ChatStats = require(appData[0] + "/modules/chat/chatStats.js");
    ChatMessages = require(appData[0] + "/modules/chat/chatMessages.js");
    // Load the chat settings/stats
    ChatSettings.loadChatSettings(settings);
    ChatStats.loadChatStats();
    // Load Overlay (OBS and Music)
    OBSHandle.startServer();
    // Check for webhooks to send
    if (ApiHandle.Webhooks.DiscordWebhook.checkIfEnabled() && hasSentWebhooks == false) {
        if (settings.Webhooks.discord.waitForConfirmation) {
            askForWebhookConfirmation("discord");
        } else {
            ApiHandle.Webhooks.DiscordWebhook.sendDiscordMessage();
            hasSentWebhooks = true;
        }
    }
    if (ApiHandle.Webhooks.GuildedWebhook.checkIfEnabled() && hasSentWebhooks == false) {
        if (settings.Webhooks.guilded.waitForConfirmation) {
            askForWebhookConfirmation("guilded");
        } else {
            ApiHandle.Webhooks.GuildedWebhook.sendGuildedMessage();
            hasSentWebhooks = true;
        }
    }

    // Gets the name of the bot. Used to determine who is speaking (cooldown stuff)
    ApiHandle.getBotAccount().then(data => {
        try {// @ts-ignore
            console.log(`GlimBoi is acting as ${data} and the status is ${data.status}`)
            if (data == null) {
                console.log("Error getting bot username.");
                botName = "GlimBoi"
                // @ts-ignore
            } else if (data.status !== undefined) {
                console.log("Auth error");
                botName = "GlimBoi"
            } else {
                // @ts-ignore
                botName = data
            }
        } catch (e) {
            console.log(e)
        }
    });
}


export { getConnection, isConnected, connectToGlimesh, disconnect, getBotName, join}
