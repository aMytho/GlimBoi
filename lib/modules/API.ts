// Handles some of the API requests to Glimesh and other services.
// Be aware that some non glimesh services may have rate limits in place.
// If you fork this change the user agent from glimboi to your own project please :)
let clientID = "";
let token = "";
let channelID = "";
let streamer = ""; // Streamer name
let accountName:any | null = null;

/**
 * This function updates the access token so we can make glimesh API requests with full permissions.
 * @param {string} accessToken The access token for this session.
 */
function updatePath(accessToken:string) {
  	token = accessToken;
}

/**
 * Tries to update the client ID. This var is only used in the API file, this does not affect the ID in the database.
 * If no ID is found we alert the user.
 */
async function updateID() {
    // @ts-ignore
  	let newClientID = await AuthHandle.getID();
    if (newClientID == null) {
      	console.log("No ID exists yet.");
      	successMessage("Auth Missing", "Please authenticate before doing anything in the bot. Some functions require the API to work properly. GlimBoi cannot run without the proper authentication. <br>Complete the auth tutorial on the start page!");
    } else {
      	clientID = newClientID;
      	console.log("API.js is using the new client ID");
    }
}

/**
 * Returns the current channel the bot is in.
 */
function getID() {
  	return channelID;
}


/**
 * Returns a promise that contains the channel ID of the user we are about to join.
 * If no auth token is ready this will return null
 * @async
 * @param {string} channel The channel name
 * @returns The ID or null if unsuccessful.
 */
async function getChannelID(channel: string) {
  	let ID = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel (username: "${channel}"){id, streamer {displayname}}}`, headers: { Authorization: `Bearer ${token}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			console.log(data);
          			channelID = data.data.channel.id;
          			streamer = data.data.channel.streamer.displayname; // We can use the streamer name now.
          			resolve(data.data.channel.id);
        		} catch (e) {
          			try {
            			resolve({ data: data.errors[0].message, status: "AUTHNEEDED" });
          			} catch (e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	return ID;
}


/**
 * Requests a user ID.
 * @async
 * @param {string} user The user we request the ID from
 * @returns {Promise<number>} The user ID. If failed returns null
 */
async function getUserID(user: string): Promise<number | null | AuthError> {
    // @ts-ignore
  	let ID:Promise<number | null | AuthError > = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {user(username: "${user}") {id}}`, headers: { Authorization: `Client-ID ${clientID}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			console.log("The ID of " + user + " is " + data.data.user.id);
          			resolve(Number(data.data.user.id));
        		} catch(e) {
          			try {
            			resolve({data: data.errors[0].message, status: "AUTHNEEDED"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	return ID;
}

/**
 * @async
 * Currently unused
 * @returns {Promise} The category. If failed returns null
 */
async function getCurrentGame() {
  	let category = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel(username: "mytho") {stream {category {slug}}}}`, headers: { Authorization: `Client-ID ${clientID}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try { //if it is null and nested this will prevent a crash.
          			resolve(data.data.channel.id);
          		} catch(e) {
            		try {
              			resolve({data: data.errors[0].message, status: "AUTHNEEDED"});
            		} catch(e2) {
              			resolve(null);
            		}
          		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	return category;
}


/**
 * Returns the viewcount, subscribers (this session), and followers. If failed returns null
 * @async
 * @returns {Promise}
 */
async function getStats() {
  	let viewers = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel(id:${channelID}) {stream {countViewers,newSubscribers}},followers(streamerUsername: "${streamer}") {id}}`, headers: { Authorization: `Client-ID ${clientID}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try { //if it is null and nested this will prevent a crash.
          			console.log(data);
          			console.log("Current viewcount:" + data.data.channel.stream.countViewers + " Subscribers: " + data.data.channel.stream.newSubscribers + " Followers: " + data.data.followers.length);
          			resolve(data.data);
        		} catch(e) {
          			try {
            			resolve({data: data.errors[0].message, status: "NOSTREAMFOUND"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	return viewers;
}


/**
 * @async
 * Requests the name of the bot account
 * @returns {Promise} The name of the bot account. If failed returns null.
 */
async function getBotAccount() {
  	if (accountName !== null) return new Promise((resolve) => resolve(accountName));

  	let bot = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {myself {username}}`, headers: { Authorization: `bearer ${token}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			console.log("The bot has a username of " + data.data.myself.username);
          			accountName = data.data.myself.username;
          			resolve(data.data.myself.username);
        		} catch(e) {
          			try {
            			resolve({data: data.errors[0].message, status: "AUTHNEEDED"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	return bot;
}

/**
 * Times out a user for a set duration.
 * @param {string} type Short or Long
 * @param {number} channel Channel ID
 * @param {number} user User ID
 */
async function timeoutUser(type:timeout, channel:number, user:number) {
  	return new Promise(resolve => {
    	let body;
    	if (type == "short") {
      		body = `mutation { shortTimeoutUser(channelId:${channel}, userId:${user}) {action, user {displayname}}}`;
    	} else {
      		body = `mutation { longTimeoutUser(channelId:${channel}, userId:${user}) {action, user {displayname}}}`;
    	}
    	fetch("https://glimesh.tv/api", { method: "POST", body: body, headers: { Authorization: `bearer ${token}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			if (data.data.shortTimeoutUser !== null) {
            			resolve(data);
          			} else {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			}
        		} catch(e) {
          			try {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
}

/**
 * Bans a user
 * @param {number} channel The channel ID
 * @param {number} user The user ID
 */
async function banUser(channel, user) {
  	return new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `mutation { banUser(channelId:${channel}, userId:${user}) {action, user {displayname}}}`, headers: { Authorization: `bearer ${token}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			if (data.data.banUser !== null) {
            			resolve(data);
          			} else {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			}
        		} catch(e) {
          			try {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
}


/**
 * Unbans a user
 * @param {number} channel The channel ID
 * @param {number} user The user ID
 */
async function unBanUser(channel:number, user:number) {
  	return new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `mutation { unbanUser(channelId:${channel}, userId:${user}) {action, user {displayname}}}`, headers: { Authorization: `bearer ${token}` }})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			if (data.data.unbanUser !== null) {
            			resolve(data);
          			} else {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			}
        		} catch(e) {
          			try {
            			resolve({error: data.errors[0].message, status: "AUTHNEEDED"});
          			} catch(e2) {
            			resolve(null);
          			}
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
}

/**
 * Makes a request (mutation) to the Glimesh API
 * @param requestInfo
 * @param key "shortTimeoutUser" | "longTimeoutUser" | "deleteMessage" | "ban" | "unBan"
 * @returns
 */
async function glimeshApiRequest(requestInfo: any, key:glimeshMutation): Promise< GLimeshMutationError | userName> {
    console.log("key is" + key);
    return new Promise(async resolve => {
        let requestResult = await fetch("https://glimesh.tv/api", { method: "POST", body: requestInfo, headers: { Authorization: `bearer ${token}` } })
        let data = await requestResult.json()
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
 * @async
 * Requests random advice
 * @returns {Promise} Returns random advice. If fails returns- "Advice Failed :glimsad:"
 */
async function getAdvice(): Promise<any> {
  	let advice = await new Promise(resolve => {
    	fetch("https://api.adviceslip.com/advice", { method: "GET"})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			console.log(data.slip.advice + data.slip.id);
          			resolve(data.slip.advice);
        		} catch(e) {
          			resolve("Advice Failed :glimsad:");
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	console.log("Completed advice request");
  	return advice;
}


/**
 * @async
 * Requests a dad joke
 * @returns Returns a dad joke. If failed returns- "Joke Failed :glimsad:"
 */
async function getDadJoke() {
  	let joke = await new Promise(resolve => {
    	fetch("https://icanhazdadjoke.com/", { method: "GET", headers: {'User-Agent': `https://github.com/aMytho/GlimBoi Look at the readme file for contact info`, Accept: "application/json"}})
    	.then((res) => {
      		res.json().then((data) => {
        		try {
          			console.log(data);
          			resolve(data.joke);
        		} catch(e) {
          			resolve("Joke Failed :glimsad:");
        		}
      		});
    	})
    	.catch((err) => console.error(err));
  	});
  	console.log("Completed joke request");
  	return joke;
}

 /**
  * Returns the socail link requested of the channel that you are currently in
  * @param {string} social The type of social link (discord, youtube, etc)
  * @param {string} channel The channel to request the info from
  * @returns {Promise}
  */
async function getSocials(social: "twitter" | string, channel:string) {
  	let socialLink = await new Promise(resolve => {
    	fetch("https://glimesh.tv/api", { method: "POST", body: `query {user(username: "${channel}") {socialDiscord, socialGuilded, socialInstagram, socialYoutube, socials {username, platform}}}`, headers: { Authorization: `bearer ${token}` } })
      	.then((res) => {
        	res.json().then((data) => {
          		try {
            		if (social == "twitter") { // Twitter is a verified link, the return value is different because of this
              			console.log("The requested social link is " + data.data.user.socials[0].username);
              			resolve(data.data.user.socials[0].username);
            		} else {
              			console.log("The requested social link is " + data.data.user[`${social}`]);
              			resolve(data.data.user[`${social}`]);
            		}
          		} catch (e) {
            		try {
              			resolve({ data: data.errors[0].message, status: "AUTHNEEDED" });
            		} catch (e2) {
              			resolve(null);
            		}
          		}
        	});
      	})
      	.catch((err) => console.error(err));
  	});
  	return socialLink;
}

async function randomAnimalFact(animal: "dog" | "cat") {
    try {
        let animalFactData = await fetch(`https://some-random-api.ml/facts/${animal}`, { method: "GET" })
        let animalFact = await animalFactData.json();
        return animalFact.fact
    } catch(e) {
        return null
    }
}

function getStreamerName() {
    return streamer;
}

export { banUser, getAdvice, getBotAccount, getChannelID, getDadJoke, getID, getSocials, getStats, getStreamerName, getUserID, glimeshApiRequest, randomAnimalFact, timeoutUser, unBanUser, updateID, updatePath};
