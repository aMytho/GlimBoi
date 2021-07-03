/**
 * A plain text message
 */
type message = string

/**
 * The glimesh users avatar URL
 */
type avatar = string

interface channel {
    channel: string
    timestamp: Date
    autoJoin?: boolean
}



declare module "ChatMessages" {
    /**
     * Filters a message and sends it to chat
     * @param message The message to be sent
     * @param source User sent or bot sent
     */
    export function filterMessage(message:message, source?: "user" | "glimboi"): void
    /**
     * Sends a message to chat
     * @param data The message to be sent
     */
    export function sendMessage(data:message): void
    /**
     * Sends a message to chat
     * @param data The message to be sent
     */
    export function glimboiMessage(data:message, from?:string): void
    /**
     * Logs a message to the chat window. Also sends to IPCRenderer for message logging if enabled
     * @param user The user who sent the message
     * @param message The message to log
     * @param avatar The avatar url of the user
     */
    export function logMessage(user:userName, message:message, avatar:avatar): void
}

declare module "ChatHandle" {
    /**
     * Returns the websocket connection
     */
    export function getConnection(): WebSocket
    /**
     * Are we connected to Glimesh chat?
     */
    export function isConnected(): boolean
    /**
     * Connect to Glimesh chat
     * @param access_token The access token for auth
     * @param channelID The channel ID we will join
     * @param isReconnect Is this a reconnection?
     */
    export function connectToGlimesh(access_token:accessToken, channelID, isReconnect:boolean): void
    /**
     * Disconnects from Glimesh chat
     * @param displayMessage Displays the reason for the disconnect
     */
    export function disconnect(displayMessage:boolean): void
    /**
     * Returns the name of the bot
     */
    export function getBotName(): string
    /**
     * Joins a channel, adds error handling
     * @param access_token The access token for auth
     * @param channelID The channel ID we will join
     * @param isReconnect Is this a reconnection?
     */
    export function join(access_token:accessToken, channelID, isReconnect:boolean): void
}

declare module "ChatSettings" {
    /**
     * Is message logging enabled?
     */
    export function isLoggingEnabled(): boolean
    /**
     * Loads all chat settings
     * @param settings Current Glimboi Settings
     */
    export function loadChatSettings(settings:Settings): void
    /**
     * Called when the chat is disconnected. Turns off all intervals
     */
    export function stopChatSettings(): void
    /**
     * Updates chat settings
     * @param settings The settings to change
     */
    export function updateChatSettings(settings:Settings): void
}

type chatChannel = {channel: string, timestamp: string, autoJoin?: boolean}

declare module "ChatChannels" {
    /**
     * Loads the chat channels DB
     * @param updatedPath The path to the DB
     */
    export function updatePath(updatedPath:string): void
    export function addRecentChannel(channel:string, timestamp?:any, autoJoin?:boolean): Promise<chatChannel>
    export function setAutoJoinChannelByID(id:string, autoJoinEnabled:boolean): Promise<chatChannel | null>
    export function getAllRecentChannels(): Promise<chatChannel[]>
    export function removeRecentChannelByID(id:string): Promise<void>
}