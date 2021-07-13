// File handles webhook

const DiscordWebhook:typeof import("../API/webhooks/discord") = require(appData[0] + "/modules/API/webhooks/discord.js");
const GuildedWebhook:typeof import("../API/webhooks/guilded") = require(appData[0] + "/modules/API/webhooks/guilded.js");

export {DiscordWebhook, GuildedWebhook};