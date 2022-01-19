// File handles discord webhooks

/**
 * Sends a message to discord
 * @param {string} message The message to send
 */
async function sendDiscordMessage(message?:string) {
    let discordMessage = message || CacheStore.get("discordWebhookMessage", "$streamer just went live on https://glimesh.tv/$streamer");
    discordMessage = discordMessage.split("$streamer").join(ApiHandle.getStreamerName());
    if (checkIfEnabled()) {
        let body = new FormData();
        body.append("content", discordMessage);
        await fetch(CacheStore.get("discordWebhookURL", ""), {method: "POST", body: body});
        console.log("Finished Discord webhook");
        hasSentWebhooks = true;
    } else {
        return false
    }
}

/**
 * Checks if the webhook is enabled and that the user has set a uri
 * @returns {boolean} True if enabled, false if not
 */
function checkIfEnabled(): boolean {
    if (CacheStore.get("discordWebhookEnabled", false)) {
        if (CacheStore.get("discordWebhookURL", "")) {
            return true
        } else {
            errorMessage("Discord Webhook error", "Discord webhook is enabled but no webhook URI has been set");
            return false
        }
    } else {
        return false;
    }
}

export {checkIfEnabled, sendDiscordMessage}