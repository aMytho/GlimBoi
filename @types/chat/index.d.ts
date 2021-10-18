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
type storedChatMessage = [userName, message, avatar, messageID, messageState, any]