// File handles discord webhooks

/**
 * Sends a message to discord
 * @param {string} message The message to send
 */
async function sendDiscordMessage(message?:string) {
    let discordMessage = message || settings.Webhooks.discord.defaultMessage;
    discordMessage = discordMessage.split("$streamer").join(ApiHandle.getStreamerName());
    if (checkIfEnabled()) {
        let body = new FormData();
        body.append("content", discordMessage);
        await fetch(settings.Webhooks.discord.webhookUri, {method: "POST", body: body});
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
    if (settings.Webhooks.discord.enabled) {
        if (settings.Webhooks.discord.webhookUri) {
            return true
        } else {
            errorMessage("Discord Webhook error", "Discord webhook is enabled but no webhook URI has been set");
            return false
        }
    } else {
        return false;
    }
}

/**
 * Sends a test message to discord
 */
function testDiscordMessage() {
    sendDiscordMessage("Test of Discord Webhook");
}

export {checkIfEnabled, sendDiscordMessage, testDiscordMessage}