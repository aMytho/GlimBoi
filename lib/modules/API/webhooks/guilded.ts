// File handles guilded webhooks.

/**
 * Sends a message to the guilded webhook.
 * @param {string} message The message to be sent
 */
async function sendGuildedMessage(message?:string) {
    let streamerName = ApiHandle.getStreamerName();
    let guildedMessage = message || CacheStore.get("guildedWebhookMessage", "$streamer just went live on https://glimesh.tv/$streamer");
    guildedMessage = guildedMessage.split("$streamer").join(streamerName);
    let streamInfo = await ApiHandle.getStreamWebhook(streamerName);
    let streamThumbnail:string, streamTitle:string;
    if (streamInfo) {
        streamTitle = streamInfo[0];
        streamThumbnail = streamInfo[1];
    } else {
        streamTitle = "";
        streamThumbnail = "";
    }
    if (checkIfEnabled()) {
        let body = buildGuildedMessage([streamThumbnail, streamTitle, streamerName, guildedMessage]);
        await fetch(CacheStore.get("guildedWebhookURL", ""), {method: "POST", body: body, headers: { "Content-Type": "application/json" }});
        console.log("Finished Guilded webhook");
        hasSentWebhooks = true;
    } else {
        return false
    }
}

/**
 * Checks if the webhook is enabled and that a URL exists
 */
function checkIfEnabled() {
    if (CacheStore.get("guildedWebhookEnabled", false) && CacheStore.get("guildedWebhookURL", "")) {
        return true;
    } else {
        return false;
    }
}

function testGuildedMessage() {
    sendGuildedMessage("Test of Guilded Webhook");
}

/**
 * Builds the message to be sent to the webhook.
 */
function buildGuildedMessage([thumbnail, title, streamer, guildedMessage]): string {
    if (thumbnail) {
        let body = {
            "content": guildedMessage,
            "embeds": [{
                "title": `${title}`,
                "url": `https://glimesh.tv/${streamer}`,
                "color": 3164874,
                "footer": {
                    "text": "Sent from Glimboi"
                },
                "image": {
                    "url": `${thumbnail}`
                },
                "author": {
                    "name": `${streamer} is now streaming`
                }
            }
            ]
        }
        return JSON.stringify(body);
    } else {
        let body = {
            "content": guildedMessage,
            "embeds": [{
                "title": `${streamer} just went live on Glimesh`,
                "url": `https://glimesh.tv/${streamer}`,
                "color": 3164874,
                "footer": {
                    "text": "Sent from Glimboi"
                },
                "author": {
                    "name": `${streamer} is now streaming`
                }
            }]
        }
        return JSON.stringify(body);
    }
}

// export the functions
export {checkIfEnabled, sendGuildedMessage, testGuildedMessage}