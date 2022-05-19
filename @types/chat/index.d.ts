/**
 * The glimesh users avatar URL
 */
type avatar = string

type messageID = number
type messageState = "none" | "deleted" | "timeout" | "ban"
interface channel {
    channel: string
    timestamp: number
    autoJoin?: boolean
    _id?: string
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
    string,
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
     * Message Tokens (parts of a glimesh message that are parsed)
     */
    any
]
