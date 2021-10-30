// Handles some of the API requests to Glimesh and other services.
// Be aware that some non glimesh services may have rate limits in place.
// If you fork this change the user agent from glimboi to your own project please :)

const Webhooks: typeof import("../modules/API/webhook") = require(appData[0] + "/modules/API/webhook.js");
const WebSockets: typeof import("../modules/API/websocket") = require(appData[0] + "/modules/API/websocket.js");

let channelID = "";
let streamer = ""; // Streamer name
let accountName:any | null = null;

/**
 * Returns the current channel the bot is in.
 */
function getID() {
  	return channelID;
}

function glimeshError(data:Glimesh.RootQueryType): Glimesh.RootQueryType["data"] | false | null {
    try {
        if (data.errors) {
            if (data.errors[0].message == "You must be logged in to access the api") {
                return null
            } else {
                return false
            }
        } else {
            return data.data;
        }
    } catch (e2) {
        return null;
    }
}

async function glimeshQuery(query): Promise<Glimesh.RootQueryType["data"] | false | null> {
    let token = AuthHandle.getToken();
    let result = await fetch("https://glimesh.tv/api/graph", {method: "POST", body: query, headers: {Authorization: `Bearer ${token}`}});
    let parsedResult:Glimesh.RootQueryType = await result.json();
    console.log(parsedResult);
    if (parsedResult.errors) {
        return glimeshError(parsedResult);
    } else {
        return parsedResult["data"]
    }
}


/**
 * Returns a promise that contains the channel ID of the user we are about to join.
 * If no auth token is ready this will return null
 * @async
 * @param {string} channel The channel name
 * @returns The ID or null if unauthed or false if the channel does not exist.
 */
async function getChannelID(channel: string): Promise<number | null | false> {
    let query = `query {channel (streamerUsername: "${channel}"){id, streamer {displayname}}}`;
    let response = await glimeshQuery(query);
    console.log(response);
    if (typeof response == "object" && response !== null) {
        channelID = response.channel.id;
        streamer = response.channel.streamer.displayname;
        return Number(response.channel.id);
    } else if (response == null) {
        return null;
    } else {
        return false;
    }
}


/**
 * Requests a user ID.
 * @async
 * @param {string} user The user we request the ID from
 * @returns The user ID. If failed returns null
 */
async function getUserID(user: string): Promise<number | "INVALID" | false> {
    let query = `query {user(username: "${user}") {id}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null) {
        return Number(response.user.id);
    } else {
        return response as "INVALID" | false;
    }
}


/**
 * Returns the viewcount, and followers. If failed returns null
 * @async
 * @returns {Promise}
 */
async function getStats(): Promise<{viewcount: number, followers: number, streamTimeSeconds: number}> {
    let query = `query {channel(id: "${channelID}") {streamer {countFollowers}, stream {countViewers, metadata(last: 1) {edges {node {streamTimeSeconds}}}}}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null && response.channel.stream !== null) {
        if (Object.values(response.channel.stream).includes(null)) {
            return {viewcount: 0, followers: 0, streamTimeSeconds: 0};
        } else {
            return {viewcount: response.channel.stream.countViewers, followers: response.channel.streamer.countFollowers, streamTimeSeconds: response.channel.stream.metadata.edges[0].node.streamTimeSeconds}
        }
    } else {
        return {viewcount: 0, followers: 0, streamTimeSeconds: 0};
    }
}


/**
 * @async
 * Requests the name of the bot account
 * @returns {Promise} The name of the bot account. If failed returns null.
 */
async function getBotAccount(): Promise<string | null> {
  	if (accountName !== null) return accountName;
    let query = `query {myself {username}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null) {
        accountName = response.myself.username;
        return accountName;
    } else {
        return null;
    }
}

/**
 * Returns the stream title and thumbnail url if the streamer is live
 */
async function getStreamWebhook(streamer: string): Promise<null | any[]> {
    let query = `query {channel(streamerUsername: "${streamer}") {stream {title,thumbnailUrl}}}`;
    let response = await glimeshQuery(query);
    try {
        if (typeof response == "object" && response !== null) {
            if (Object.values(response.channel.stream).includes(null)) {
                return null;
            } else {
                return [response.channel.stream.title, response.channel.stream.thumbnailUrl];
            }
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

async function sendMessage(message, isSecondAttempt?: boolean) {
  	let query = `mutation{createChatMessage(channelId: ${channelID}, message: {message: "${message}"}) {message}}`
    console.log(query);
    let response = await glimeshQuery(query);
    console.log(response);
    if (query == null && !isSecondAttempt) {
        await AuthHandle.requestToken();
        sendMessage(message, true);
    }
}

/**
 * Deletes a message from glimesh chat with a given ID
 * @param messageID The message ID to delete
 */
async function deleteMessage(messageID: number) {
    let query = `mutation{deleteChatMessage(channelId: ${channelID}, messageId: ${messageID}) {id}}`
    let response = await glimeshQuery(query);
    console.log(response);
    return response
}

/**
 * Makes a request (mutation) to the Glimesh API
 * @param requestInfo
 * @param key "shortTimeoutUser" | "longTimeoutUser" | "deleteMessage" | "ban" | "unBan"
 * @returns
 */
async function glimeshApiRequest(requestInfo: any, key:glimeshMutation): Promise< GLimeshMutationError | userName> {
    console.log("key is" + key);
    let token = AuthHandle.getToken();
    return new Promise(async resolve => {
        let requestResult = await fetch("https://glimesh.tv/api", { method: "POST", body: requestInfo, headers: { Authorization: `bearer ${token}` } })
        let data = await requestResult.json();
        try {
            console.log(data);
            if (data.errors) {
                if (data.errors[0].message == "unauthorized") {
                    resolve({ error: data.errors[0].message, status: "PERMISSIONDENIED"})
                } else if (data.errors[0].message == "You must be logged in to access the api") {
                    resolve({ error: data.errors[0].message, status: "AUTHNEEDED"})
                } else {
                    throw "Unidentified error"
                }
            } else if (data.data) {
                switch (key) {
                    case "deleteMessage":
                    resolve(data.data.deleteMessage.user.username)
                        break;
                    case "shortTimeoutUser":resolve(data.data.shortTimeoutUser.user.username)
                        break;
                    case "longTimeoutUser":resolve(data.data.longTimeoutUser.user.username)
                        break;
                    case "ban":resolve(data.data.banUser.user.username)
                        break;
                    case "unBan":resolve(data.data.unbanUser.user.username)
                        break;
                    default:
                        break;
                }
            }
        } catch (e) {
            resolve({ error: data, status: "UNKNOWN" })
        }
    })
}

/**
 * Checks if an access token is still valid
 * @returns {Promise}
 */
async function getTokenStatus(token: accessToken) {

}

/**
 * @async
 * Requests random advice
 * @returns {Promise} Returns random advice. If fails returns- "Advice Failed :glimsad:"
 */
async function getAdvice(): Promise<string> {
    let response = await fetch("https://api.adviceslip.com/advice", { method: "GET" });
    let advice = await response.json();
    try {
        console.log("Completed advice request " + advice.slip.advice + advice.slip.id);
        return advice.slip.advice
    } catch (e) {
        return "Advice Failed :glimsad:"
    }
}


/**
 * @async
 * Requests a dad joke
 * @returns Returns a dad joke. If failed returns- "Joke Failed :glimsad:"
 */
async function getDadJoke():Promise<string> {
    let response = await fetch("https://icanhazdadjoke.com/", { method: "GET", headers: { 'User-Agent': `https://github.com/aMytho/GlimBoi Look at the readme file for contact info`, Accept: "application/json" } });
    let dadJoke = await response.json();
    try {
        console.log("Completed joke request" + dadJoke);
        return dadJoke.joke
    } catch (e) {
        return "Joke Failed :glimsad:"
    }
}

 /**
  * Returns the socail link requested of the channel that you are currently in
  * @param {string} social The type of social link (discord, youtube, etc)
  * @param {string} channel The channel to request the info from
  * @returns {Promise}
  */
async function getSocials(social: "twitter" | string, channel:string): Promise<string> {
    let query = `query {user(username: "${channel}") {socialDiscord, socialGuilded, socialInstagram, socialYoutube, socials {username, platform}}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null) {
        if (social == "twitter") {
            return response.user.socials[0].username;
        } else  {
            return response.user[`${social}`];
        }
    } else {
        return "unknown";
    }
}

async function randomAnimalFact(animal: "dog" | "cat") {
    try {
        let animalFactData = await fetch(`https://some-random-api.ml/animal/${animal}`, { method: "GET" })
        let animalFact = await animalFactData.json();
        return animalFact.fact
    } catch(e) {
        return null
    }
}

function getStreamerName() {
    return streamer;
}

/**
 * Triggers a streamlabs alert. Thanks Streamlabs!
 * @param message
 * @param token
 */
async function triggerAlert(message: string, token: string) {
    try {
        let alert = await fetch("http://localhost:5000/alerts", {
            method: "POST",
            body: new URLSearchParams({
                message: message,
                token: token,
                user: "Mytho"
            }),

        })
        let alertData = await alert.json();
        console.log(alertData);
    } catch (e) {
        console.log(e);
    }
}

export { deleteMessage, getAdvice, getBotAccount, getChannelID, getDadJoke, getID, getSocials, getStats,
getStreamerName, getStreamWebhook, getTokenStatus, getUserID, glimeshApiRequest, randomAnimalFact,
sendMessage, triggerAlert, Webhooks, WebSockets};