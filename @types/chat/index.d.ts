/**
 * A plain text message
 */
type message = string

/**
 * The glimesh users avatar URL
 */
type avatar = string

type messageID = number
type messageState = "none" | "deleted" | "timeout" | "ban"
interface channel {
    channel: string
    timestamp: Date
    autoJoin?: boolean
}

type chatChannel = {channel: string, timestamp: string, autoJoin?: boolean}
type storedChatMessage = [
    /**
     * The user who sent the message
     */
    string,
    /**
     * The message
     */
    message,
    /**
     * The URL of the user's avatar
     */
    avatar,
    /**
     * The ID of the message
     */
    messageID,
    /**
     * The state of the message
     */
    messageState,
    /**
     * IDK
     */
    any
]
