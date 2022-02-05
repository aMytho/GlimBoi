type settingsProperty = | "pointsName" | "pointsStartingAmount" | "pointsAccumalation" |
"commandsRepeatDelay" | "commandsRepeatSpamProtection" | "chatLogging" | "chatHealth" | "musicChatAttribution" |
"musicWriteToFile" | "moderationFilterEnabled" | "moderationWarning1" | "moderationWarning2" |
"moderationWarning3" | "moderationWarningAbove" | "moderationModMessage" | "webhooksDiscordEnabled" | "webhooksDiscordWaitForConfirmation" |
"webhooksDiscordDefaultMessage" | "webhooksDiscordWebhookUri" | "webhooksGuildedEnabled" | "webhooksGuildedWaitForConfirmation" |
"webhooksGuildedDefaultMessage" | "webhooksGuildedWebhookUri" | "commandRepeatDelay" | "commandRepeatProtection";

interface LogType {
    event: logEvent;
    caused: string
    affected: string[];
    time: Date;
    description: string;
}

interface LogConstructor {
    /**
     * The event that we are logging
     */
    event: logEvent
    /**
     * The users that caused and are affected by the event
     */
    users: string[];
    /**
     * Optional data to be added to the event
     */
    data?: any
    /**
     * Should we show the user that the event was logged?
     */
    notification?: string
}

type logEvent = "Add User" | "Edit User" | "Remove User" | "Add Points" | "Edit Points" |
"Remove Points" | "Add Quote" | friendlyWarningAction | "New Follower" | "Follow User" | "Unfollow User"

/**
 * Duration of the timeout
 */
type timeout = "short" | "long"
/**
 * Streamer/mod or bot action
 */
type origin = "manual" | "ruleset"
/**
 * Strength of the filter from 0 (inactive) to 3 (strong)
 */
type filterStrength = 0 | 1 | 2 | 3
type warning = { user: string, amount: number }
type warningAction = "deleteMessage" | "shortTimeout" | "longTimeout" | "ban" | "none"
type friendlyWarningAction = "Delete Message" | "Short Timeout User" | "Long Timeout User" | "Ban User" | "UnBan User"
type modAction = "deleteMessage" | "shortTimeout" | "longTimeout" | "ban" | "unBan" | "none"
type bannedWordAction = "add" | "remove"
type bannedWordsDB = { words: string[] }[]
interface modInfoPack {
    messageID?: number
    userName?: string
    userID?: number
    source?: "manual" | "ruleset"
    caused?: string
}