interface CommandType {
    commandName: string;
    uses: number
    points: number;
    cooldown: number;
    rank: rankName;
    repeat: boolean;
    actions: any
    message?: string
    sound?: string
    media?: string
}

interface CommandContructor {
    /**
     * The name of the command
     */
    commandName: string;
    /**
     * How many times the command has been used
     */
    uses: number;
    /**
     * How many points the command costs to run
     */
    points: number;
    /**
     * How long until the command can be used after activation
     */
    cooldown: number;
    /**
     * What rank you must be to use the command
     */
    rank: rankName;
    /**
     * Will this command be on the repeat list?
     */
    repeat: boolean;
    /**
     * What the command does
     */
    actions: any
}

interface RepeatableCommand extends CommandType {
    repeat: true
}


/**
 * The name of the command
 */
type commandName = string

interface commandDoc extends CommandType {
    _id: number
}

declare module "CommandHandle" {
    /**
     * Adds a command
     * @param commandData The data for the command
     */
    export function addCommand(commandData:CommandContructor): CommandType
    /**
     * Increments the command uses by 1
     * @param command The command to add a use to
     */
    export function addCommandCount(command:commandName): void
    /**
     * Filters a command from chat and if valid adds it
     * @param {string} commandName The name of the command
     * @param {string} commandData The data for the chatmessage
     * @param {string} type !command or !cmd
    */
    export function addCommandFilter(commandName:commandName, commandData:string, type: "!command" | "!cmd"): void
    /**
     * Edits a command
     * @param param0 Command data
     */
    export function editCommand({ commandName, actions, cooldown, uses, points, rank, repeat }:CommandContructor): void
    /**
     * Searches for the command.
     * @param command The name of the command
     */
    export function findCommand(command:commandName): Promise<CommandType | null>
    /**
     * Returns every command in the database. Also loads the repeat commands. Only run on load
     */
    export function getAll(): Promise<CommandType[]>
    /**
     * Returns all commands
     */
    export function getCurrentCommands(): CommandType[]
    /**
     * Runs a random repeat command if any exist
     */
    export function randomRepeatCommand(): void
    /**
     * Returns info about commands and sends it to chat
     */
    /**
     * Loads the commands db
     * @param updatedPath The path to the db
     */
    export function updatePath(updatedPath:string): void
    /**
     * Removes the command from the db and the command table
     * @param commandName The command to remove
     */
    export function removeCommand(commandName:commandName): void
    export function info(): string
    export var ChatAction: typeof import("../../lib/modules/commands/commandActionHandler")
    export var CommandRunner: typeof import("../../lib/modules/commands/commandRunner")
}

interface ChatActionType {
    action: actionName
    effect: actionEffect
    info: actionInfo
    generateVariables: actionVariables
}

declare class ChatAction implements ChatActionType {
    action: actionName
    effect: actionEffect
    info: actionInfo
    generateVariables: actionVariables
    removeGeneratedVariables(): void
    parseGenerateVariables(variables): actionVariables
}

interface ChatMessageType extends ChatActionType {
    message: string
}

type BuildChatMessage = {message: string}
type RunChatMessage = {activation: any, user: userName}

interface ApiRequestGetType extends ChatActionType {
    url:string
    headers:any
    returns: any
}

type BuildApiRequestGet = {url:string, headers: any, returns: any}

interface AudioType extends ChatActionType {
    source: mediaName
}

type BuildAudio = {source:mediaName}

interface ImageGifType extends ChatActionType {
    source: mediaName
}

type BuildimageGif = {source: mediaName}

interface VideoType extends ChatActionType {
    source: mediaName
}

type BuildVideo = {source: mediaName}

interface WaitType extends ChatActionType {
    wait: number
}

type BuildWait = {wait:number}


type actionName = string;
type actionEffect = string;
type actionInfo = any[] | any
type actionVariables = string[]

declare module "ChatActions" {
    /**
     * Sends an API request to get data
     */
    export class ApiRequestGet extends ChatAction implements ApiRequestGetType {
        url: string
        headers: any
        returns: any
        constructor({url, headers, returns}:BuildApiRequestGet)
        run():Promise<void>
    }
    /**
     * Plays a sound effect
     */
    export class Audio extends ChatAction implements AudioType {
        source: mediaName
        constructor({source}:BuildAudio)
        run():Promise<void>
    }
    /**
     * Sends a message to chat
     */
    export class ChatMessage extends ChatAction implements ChatMessageType {
        message: string
        constructor({message}:BuildChatMessage)
        run({activation, user}:RunChatMessage):Promise<void>
    }
    /**
     * Displays an Image/Gif in the overlay
     */
    export class ImageGif extends ChatAction implements ImageGifType {
        source: mediaName
        constructor({source}:BuildimageGif)
        run():Promise<void>
    }
    /**
     * Displays a video in the overlay
     */
    export class Video extends ChatAction implements VideoType {
        source: mediaName
        constructor({source}:BuildVideo)
        run():Promise<void>
    }
    /**
     * Waits a specified amount of time
     */
    export class Wait extends ChatAction implements WaitType {
        wait: number
        constructor({wait}:WaitType)
        run():Promise<void>
    }
    export var ActionResources: typeof import("../../lib/modules/commands/actionResources")
}

declare module "ActionResources" {
    /**
     * Adds a variable to the list for an action to use
     * @param variable THe variable to add to the list
     */
    export function addVariable(variable): void
    /**
     * Sends an API request and applies the data from it to variables
     * @param param0
     */
    export function ApiRequest({ url, headers, mode, request, path, pathType }): void
    /**
     * Removes action variables from the varaible list
     * @param variables
     */
    export function removeVariables(variables): void
    /**
     *  Searches and replaces variables with their values in a ChatMessage
     * @param data
     */
    export function searchForVariables(data: {message:string}): string
    export function getv (): string[]
}

declare module "CommandRunner" {
    /**
     * Checks that a command can be ran and if so runs it
     * @param data The command data
     */
    export function checkCommand(data): void
    /**
     * Runs a command
     * @param param0 Command data
     */
    export function runCommand({message, command, user}): void
}