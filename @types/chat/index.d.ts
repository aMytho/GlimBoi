/**
 * A plain text message
 */
type message = string

/**
 * The glimesh users avatar URL
 */
type avatar = string

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
    export function glimboiMessage(data:message): void
}