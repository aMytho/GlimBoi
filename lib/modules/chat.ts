//This file handles connecting the bot to a chat.
import WebSocket from "ws";
const ChatParser:typeof import("../modules/chat/chatParser") = require(appData[0] + "/modules/chat/chatParser.js");

let connection:WebSocket; // the websocket connection
let heartbeat:any; //heartbeat
let botName = "GlimBoi"; //The username of the bot in normal caps

/**
 * Checks to make sure the token is valid and if it is joins a chat
 * @param {string} access_token Access token used for authentication
 * @param {number} channelID The channel ID for the channel we are joining
 * @param {boolean} isReconnect Whether or not this is a reconnect
 */
async function checkAndJoinChat(accessToken: accessToken, channelID: number, isReconnect: boolean) {
    // First we check the auth token and make sure its valid.
    if (accessToken) {
        if (isReconnect) {
            await AuthHandle.requestToken();
            console.log("Joining chat with a new token.")
            connectToGlimesh(AuthHandle.getToken(), channelID, isReconnect);
        } else {
            connectToGlimesh(accessToken, channelID, isReconnect);
        }
    } else {
        errorMessage("Auth Error", "Authorize the bot if you have not done so already. If you have request a new token on the homepage.")
    }
}


/**
 * Returns the connection for other modules
 * @returns {WebSocket} WebSocket Connection
 */
function getConnection(): WebSocket {
    return connection;
}

/**
 * Determines if the websocket is connected or connecting
 * @return {boolean}
 */
function isConnected(): boolean {
    if (connection === undefined) {return false};
    return connection.readyState !== WebSocket.CLOSED && connection.readyState !== WebSocket.CLOSING;
}

/**
 * Connects to a Glimesh chat.
 * @param {string} access_token Access token used for authentication
 * @param {number} channelID The channel ID for the channel we are joining
 */
function connectToGlimesh(access_token:string, channelID:number, isReconnect:boolean) {
    const url = `wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&client_id=${AuthHandle.getClientID()}` // The websocket URL
    connection = new WebSocket(url); // Connection is now an offical connection!
    chatID = channelID // The channel ID is now an accessible variable for this module

    connection.on("open", function open() { // When the connection opens...
        console.log("Connected to Glimesh Chat");
        connection.send('["1","1","__absinthe__:control","phx_join",{}]'); //requests a connection
        subscribeToGlimeshEvent("chat", { channelID: channelID });
        //every 20 seconds send a heartbeat so the connection won't be dropped for inactivity.
        heartbeat = setInterval(() => {
            connection.send(`[null,"4","phoenix","heartbeat",{}]`);
        }, 30000);

        // Run the post chat scripts
        postChat();

        if (isReconnect) {
            if (reconnectMessage) {
                ChatMessages.filterMessage("Glimboi was disconnected and has now returned.", "glimboi");
            }
        } else {
            ChatMessages.filterMessage("Glimboi has joined the chat :glimsmile:", "glimboi");
        }
    });

    //We recieve a message from glimesh chat! (includes heartbeats and other info)
    connection.on("message", function incoming(event) {
        console.log(event);
        event = JSON.parse(event.toString());
        //First check for heartbeat message.
        let chatMessage = event;
        if (chatMessage[1] == null) {
            ChatParser.handleGlimeshMessage(chatMessage[4].result.data.chatMessage);
        } else if (chatMessage[1] == 4) {
            //Heartbeat
            console.log(`Status: ${chatMessage[3]}`);
        } else if (chatMessage[1] == 7) {
            // This is a message the bot has sent
        }
});

    //The connection closed, if error the error will be triggered too
    connection.on("close", function close(event) {
        console.log(event);
        console.trace("Connection closed");
        try {
            clearInterval(heartbeat); // stops the hearbteat
            ChatSettings.stopChatSettings(); // stops everything else
            ChatStats.stopChatStats();
            ChatLogger.endMessageLogging();
            leaveChatButton();//sets the UI so it shows that we are not in a chat
            if (needsReconnect) {
                reconnect();
            }
        } catch (e) {
            console.log(e);
        }
        if (CacheStore.get("chatLogging", false) == true) {
            setTimeout(() => {
                ipcRenderer.send("logEnd") // ends the logging
            }, 3000);
        }
        if (!needsReconnect) {
            successMessage("Chat Disconnected!", "Chat has been successfully disconnected.");
        }
    });

    // oh noes, an error!
    connection.on("error", function error(error) {
        console.log(`Chat Connection Error: ${error}`);
        // Chat error or parse error?, the disconnect is triggered so we don't need any extra code
    })
};

/**
 * Listens for a specific event in the Glimesh API
 */
function subscribeToGlimeshEvent(event: glimeshEvent, {channelID}) {
    switch (event) {
        case "chat":
            connection.send(`["1","2","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: ${channelID}) { id, user { username avatarUrl id } message } }","variables":{} }]`);
            break;
        case "followers":
            break;

        default:
            break;
    }
}


/**
 * Disconnects from Glimesh chat.
 */
function disconnect() {
    console.log("DISCONNECTING AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    try {
        connection.close(1000, "So long and thanks for all the fish."); // closes the websocket
    } catch (e) {
        errorMessage("Chat Error", "You are not connected to a chat.");
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
    ChatLogger = require(appData[0] + "/modules/chat/chatLogging.js");
    // Load the chat settings/stats
    ChatSettings.loadChatSettings();
    ChatStats.loadChatStats();
    // Load Overlay (Media and Music)
    Server.startServer();
    // Connect to OBS
    ApiHandle.WebSockets.OBSWebSocket.connect();
    // Check for webhooks to send
    if (ApiHandle.Webhooks.DiscordWebhook.checkIfEnabled() && hasSentWebhooks == false) {
        if (CacheStore.get("discordWebhookConfirmation", true)) {
            askForWebhookConfirmation("discord");
        } else {
            ApiHandle.Webhooks.DiscordWebhook.sendDiscordMessage();
            hasSentWebhooks = true;
        }
    }
    if (ApiHandle.Webhooks.GuildedWebhook.checkIfEnabled() && hasSentWebhooks == false) {
        if (CacheStore.get("guildedWebhookConfirmation", true)) {
            askForWebhookConfirmation("guilded");
        } else {
            ApiHandle.Webhooks.GuildedWebhook.sendGuildedMessage();
            hasSentWebhooks = true;
        }
    }

    // Gets the name of the bot. Used to determine who is speaking (cooldown stuff)
    ApiHandle.getBotAccount().then(data => {
        try {
            console.log(`GlimBoi is acting as ${data}.`)
            if (data == null) {
                console.log("Error getting bot username.");
                botName = "GlimBoi"
            } else {
                botName = data
            }
        } catch (e) {
            console.log(e)
        }
    });
}

export {checkAndJoinChat, getConnection, isConnected, connectToGlimesh, disconnect, getBotName}