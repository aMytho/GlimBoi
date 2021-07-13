interface Settings {
    Points: {
        enabled: boolean;
        name: string;
        StartingAmount: number;
        accumalation: number;
    },
    Commands: {
        enabled: boolean;
        Prefix: string;
        Error: boolean;
        repeatDelay: number;
        repeatSpamProtection: number;
    },
    chat: {
        logging: boolean;
        filter: boolean;
        health: number;
    },
    music: {
        chatAttribution: boolean;
        writeToFile: boolean;
    },
    Moderation: {
        filterEnabled: boolean;
        warning1: warningAction;
        warning2: warningAction;
        warning3: warningAction;
        warningAbove: warningAction;
        modMessage: boolean;
    },
    Webhooks: {
        discord: {
            enabled: boolean;
            waitForConfirmation: boolean;
            defaultMessage: string;
            webhookUri: string;
        }
        guilded: {
            enabled: boolean;
            waitForConfirmation: boolean;
            defaultMessage: string;
            webhookUri: string;
        }
    }
    }

// @ts-ignore
declare let settings: Settings
// @ts-ignore
declare class CacheStoreClass {
    path: string
    cache: any
    constructor()
    /**
     * Sets a chache item
     * @param key If the key doesn't exist we can create the key
     * @param value The value of the key
     */
    set(key: string, value: any): void
    /**
     * Gets a key / value pair, sets the key if setDefault == true
     * @param key The key to search for
     * @param defaultValue The default value to set if none exist
     * @param setDefault Should we set this as the default value
     */
    get(key: string, defaultValue: any, setDefault: boolean): any
    /**
     * Gets or creates the cache file if none exist.
     * @param path The path to the cache file
     */
    setFile(path: string): object
}

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
     * The users that caused and aare affected by the event
     */
    users: userName[];
    /**
     * Optional data to be added to the event
     */
    data?: any
}

type logEvent = "Add User" | "Edit User" | "Remove User" | "Add Points" | "Edit Points" | "Remove Points" | "Add Quote" | friendlyWarningAction

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
type warning = { user: userName, amount: number }
type warningAction = "deleteMessage" | "shortTimeout" | "longTimeout" | "ban" | "none"
type friendlyWarningAction = "Delete Message" | "Short Timeout User" | "Long Timeout User" | "Ban User" | "UnBan User"
type modAction = "deleteMessage" | "shortTimeout" | "longTimeout" | "ban" | "unBan" | "none"
type bannedWordAction = "add" | "remove"
type bannedWordsDB = { words: string[] }[]
interface modInfoPack {
    messageID?: number
    userName?: userName
    userID?: number
    source?: "manual" | "ruleset"
    caused?: userName
}