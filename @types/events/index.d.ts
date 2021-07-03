type eventName = "raffle" | "poll" | "glimrealm" | "bankheist"

declare module "EventHandle" {
    export function handleEvent(event:eventName, user:userName, message: string): void
    export function getCurrentEvents(): eventName[]
    export function setCurrentEvents(data:eventName[]): void
    export var bankHeist: typeof import("BankHeist")
    export var poll: typeof import("Poll")
    export var glimRealm: typeof import("GlimRealm")
    export var raffle: typeof import("Raffle")
}

type BHStatus = "ready" | "prep" | "active" | "cooldown"

declare module "BankHeist" {
    /**
     * Starts or joins a bankheist
     * @param user The user who is joining or starting a heist
     */
    export function startBankHeist(user:userName): void
}

interface PollController {
    question: string;
    options: string[],
    responses: any[],
    results: any,
    users: userName[]
    cancel?(): any
}

declare module "Poll" {
    /**
     * Checks if a poll can be run, and if so starts a poll.
     * @param {string} user The user who activated the poll
     * @param {string} message The entire chat message
     * @param {boolean} GUI Was this actived from the GUI?
     * @param {string} stringMessage The message from chat, is parsed.
    */
    export function checkPollStatus(user:userName, message:message, GUI:boolean, stringMessage:any): void
    /**
     * Builds the poll table that shows the poll info
     */
    export function getPollStatus(): void
    /**
     * Returns the users in the poll
     */
    export function getUsers(): userName[]
    export function startPoll(poll: PollController, time:number): Promise<"NOPOLL" | "POLLFINISHED" | {status:"CANCELLED", reson:"MANUAL CANCELLATION"}>
    /**
     * Stops the poll if one is active
     */
    export function stopPoll(): void
    /**
     * Shows the new response on the poll modal
     * @param user user
     * @param response users response
     */
    export function updatePollData(user:userName, response: number): void
    /**
     * Returns the poll controller
     */
    export function getPoll(): PollController
}

type glimRealmStatus = "ready" | "active" | "charging"

declare module "GlimRealm" {
    /**
     * Enters the glimrop realm
     * @param user THe user who is entering the realm
     * @param data Object containing the total points of the user
     */
    export function glimDropRealm(user:userName, data:{points:number}): void
    /**
     * Returns the status of the Glimrealm portal
     */
    export function getGlimrealmStatus(): glimRealmStatus
    /**
     * Returns the users in the Glimrealm
     */
    export function getGlimRealmUsers(): userName[]
    /**
     * Opens a portal if the cooldown isn't active
     */
    export function openGlimRealm(): void
    /**
     * Sets who is in the Glimrealm
     * @param data An array of users
     */
    export function setGlimRealmUsers(data:userName[]): void
    /**
     * Starts a Glimrealm instance
     */
    export function startGlimrealm(): void
}

declare module "Raffle" {
    /**
     * Adds a user to the raffle
     * @param user The user to add to the raffle
     */
    export function addUserRaffle(user:userName): void
    /**
     * Checks if a raffle can be run, and if so starts a raffle
     * @param GUI Was this started from the GUI?
     * @param chatActive any
     */
    export function checkRaffleStatus(GUI:boolean, chatActive?: boolean): void
    /**
     * Returns all the users in the raffle
     */
    export function getRaffleUsers(): userName[]
    /**
     * Starta a raffle. After the time has passed the winner is returned
     * @param time How long to wait until the winner is drawn (milliseconds)
     */
    export function startRaffle(time:number): Promise<"Nobody joined the raffle so nobody won." | {status:"CANCELLED", reson:"MANUAL CANCELLATION"} | userName>
    /**
     * Stops a raffle early
     */
    export function stopRaffle(): void
}