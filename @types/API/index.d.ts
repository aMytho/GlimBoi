type glimeshMutation = "shortTimeoutUser" | "longTimeoutUser" | "deleteMessage" | "ban" | "unBan"

declare interface AuthError {
    data: string;
    status: "AUTHNEEDED"
}

declare interface GLimeshMutationError {
    error: string;
    status: "PERMISSIONDENIED" | "UNKNOWN" | "AUTHNEEDED"
}

interface Auth {
    access_token: accessToken;
    scope: string;
    creation: string;
    clientID?: string;
    secret?: string
    _id?: string;
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

/**
 * Number representing the state of authentication. 0none, 1, id, 2 authed
 */
type authStatusNumber = 0 | 1 | 2

/**
 * String representing the type of webhook.
 */
type webhookType = "discord" | "guilded"