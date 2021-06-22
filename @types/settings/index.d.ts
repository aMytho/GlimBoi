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
    }
}

declare let settings:Settings

interface Auth {
    access_token: accessToken;
    scope: string;
    creation: string;
}

/**
 * The client ID of the users dev app on glimesh
 */
type clientID = string

/**
 * The secret key of the users dev app on glimesh
 */
type secretKey = string

/**
 * A token that lets you connect to the Glimesh API. Valid for 6 hours
 */
type accessToken = string