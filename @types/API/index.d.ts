type glimeshMutation = "shortTimeoutUser" | "longTimeoutUser" | "deleteMessage" | "ban" | "unBan"

declare module "ApiHandle" {
    export function banUser(channel:string, user:number):Promise<any>
    export function unBanUser(channel:number, user:number): Promise<any>
    export function getUserID(user:string):Promise<number | null | {data:string, status: "AUTHNEEDED"}>
    export function getStreamerName(): string
    export function getID(): string | ""
    export function getSocials(social: "twitter" | string, channel:string): Promise<string | AuthError | null>
    export function getAdvice(): Promise<string | "Advice Failed :glimsad:">
    export function getDadJoke(): Promise<string | "Joke Failed :glimsad:">
    export function randomAnimalFact(animal: "dog" | "cat"): Promise<string | null>
    /**
     * Returns the name of the bot
    */
    export function getBotAccount(): Promise<string | AuthError | null>
    export function getChannelID(channel: string): Promise<number | AuthError | null | string>
    export function getStats(): Promise<null | {data: string, status: "NOSTREAMFOUND"} | {channel: {stream: {countViewers: number, newSubscribers: number}}, followers: []}>
    export function glimeshApiRequest(requestInfo: any, returnValue:string): Promise<any>
    export function timeoutUser(type:timeout, channel:string, user:number): Promise<true | null | AuthError>
    export function updateID(): void
    /**
     * Sets the access tokens new value
     * @param accessToken The new token
     */
    export function updatePath(accessToken:string): void
}

declare module "AuthHandle" {
    /**
     * Requests a token
     * @param clientID The streamers client ID
     * @param secretKey The streamers secret key
     * @param isManual Was this triggered by the user?
     */
    export function requestToken(clientID: clientID, secretKey: secretKey, isManual: boolean): Promise<"ALLGOOD" | "NOTGOOD">
    /**
     * Loads the auth db
     * @param updatedPath The path to the auth db
     */
    export function updatePath(updatedPath:string): void
    /**
     * Returns the auth info
     */
    export function readAuth(): Promise<Auth[]>
    /**
     * Updates the streamers client and secret ID
     * @param client Streamers client ID
     * @param secret Streamers secret key
     */
    export function updateID(client:clientID, secret:secretKey): Promise<"UPDATEDID">
    /**
     * Creates the auth DB
     * @param client Streamers client ID
     * @param secret Streamers secret ID
     */
    export function createID(client:clientID, secret:secretKey): Promise<"NOAUTH" | Auth >
    /**
     * Returns the most recent access token
     */
    export function getToken(): Promise<undefined | accessToken>
    /**
     * Returns the client ID
     */
    export function getID(): Promise<null | clientID>
}

declare interface AuthError {
    data: string;
    status: "AUTHNEEDED"
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