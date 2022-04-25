// Handles some of the API requests to Glimesh and other services.
// Be aware that some non glimesh services may have rate limits in place.
// If you fork this change the user agent from glimboi to your own project please :)

/**
 * Any API that isn't a websocket
 */
const Webhooks: typeof import("../modules/API/webhook") = require(appData[0] + "/modules/API/webhook.js");
/**
 * Websocket APIs
 */
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
            let errMessage = data.errors[0].message;
            if (errMessage == "You must be logged in to access the api" || errMessage == "unauthorized") {
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
async function getChannelID(channel: string, setMain?: boolean): Promise<number | null | false> {
    let query = `query {channel (streamerUsername: "${channel}"){id, streamer {displayname}}}`;
    let response = await glimeshQuery(query);
    console.log(response);
    if (typeof response == "object" && response !== null) {
        if (setMain) {
            streamer = response.channel.streamer.displayname;
            channelID = response.channel.id;
        }
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
async function getStats(): Promise<{viewcount: number, followers: number, streamTimeSeconds: number, title: string}> {
    let query = `query {channel(id: "${channelID}") {streamer {countFollowers}, stream {countViewers, title, metadata(last: 1) {edges {node {streamTimeSeconds}}}}}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null && response.channel.stream !== null) {
        if (Object.values(response.channel.stream).includes(null)) {
            return {viewcount: 0, followers: 0, streamTimeSeconds: 0, title: ""};
        } else {
            return {
                viewcount: response.channel.stream.countViewers,
                title: response.channel.stream.title,
                followers: response.channel.streamer.countFollowers,
                streamTimeSeconds: response.channel.stream.metadata.edges[0].node.streamTimeSeconds
            }
        }
    } else {
        return {viewcount: 0, followers: 0, streamTimeSeconds: 0, title: ""};
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
async function glimeshApiRequest(requestInfo: any, key:glimeshMutation): Promise< GLimeshMutationError | string> {
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
 * Returns the streamer ID (userID) of a streamer
 * @param channelId
 * @returns
 */
async function getStreamerId(channelId: number) {
    let query = `query {channel(id: ${channelId}) {streamer {id}}}`;
    let response = await glimeshQuery(query);
    if (typeof response == "object" && response !== null) {
        return response.channel.streamer.id
    } else {
        return null
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

async function getSubCategory(username: string) {
    try {
        let query = `query {channel(streamerUsername: "${username}") {subcategory {name}}}`;
        let response = await glimeshQuery(query);
        if (typeof response == "object" && response !== null) {
            return response.channel.subcategory.name;
        } else {
            return "unknown";
        }
    } catch(e) {
        return null
    }
}

/**
 * Follows or unfollows a channel
 * @param channelID The channel ID to follow or unfollow
 * @param unfollow Is this an unfollow?
 * @param liveNotifications Subscribe to live notifications?
 */
async function followUser(channelID: number, unfollow: boolean, liveNotifications = false) {
    let query = "";
    if (unfollow) {
        query = `mutation{unfollow(streamerId: ${channelID}) {id, streamer {username}}}`;
    } else {
        query = `mutation{follow(streamerId: ${channelID}, liveNotifications: ${liveNotifications}) {id, streamer {username}}}`;
    }
    let response = await glimeshQuery(query);
    console.log(response);
    if (typeof response == "object" && response !== null) {
        if (unfollow) { // @ts-ignore
            showToast(`Unfollowed ${response.unfollow.streamer.username}`);
        } else { // @ts-ignore
            showToast(`Followed ${response.follow.streamer.username}`);
        }
        return response;
    } else if (response == null) {
        showToast("You must authorize the bot to be able to follow/unfollow a user");
        return null;
    } else if (response == false) {
        if (unfollow) {
            showToast("You are not following this user so you can't unfollow them.");
        } else {
            showToast("You are already following this user.");
        }
        return false
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

export { deleteMessage, followUser, getBotAccount, getChannelID, getID, getSocials, getStats,
getStreamerName, getStreamWebhook, getUserID, getStreamerId, getSubCategory, glimeshApiRequest, randomAnimalFact,
sendMessage, Webhooks, WebSockets};