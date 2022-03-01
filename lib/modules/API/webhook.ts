// File handles webhooks

const DiscordWebhook:typeof import("../API/webhooks/discord") = require(appData[0] + "/modules/API/webhooks/discord.js");
const GuildedWebhook:typeof import("../API/webhooks/guilded") = require(appData[0] + "/modules/API/webhooks/guilded.js");
const TwitterWebhook:typeof import("../API/webhooks/twitter") = require(appData[0] + "/modules/API/webhooks/twitter.js");
const MatrixWebhook: typeof import("../API/webhooks/matrix") = require(appData[0] + "/modules/API/webhooks/matrix.js");

export {DiscordWebhook, GuildedWebhook, MatrixWebhook, TwitterWebhook};