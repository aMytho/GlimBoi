interface CommandType {
    commandName: string;
    uses: number
    points: number;
    cooldown: number;
    rank: rankName;
    repeat: boolean;
    actions: ChatAction[];
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

type BuildObsWebSocket = {
    requestType: string
    data: any
    variables: CommandActionVariables[]
    instruction: string
}

type CommandActionVariables = {
    variable: string
    data: string
}

type CustomUserVaribles = {
    name: string;
    data: string | any;
}

type actionName = "ChatMessage" | "ApiRequestGet" | "Audio" | "Ban" | "ImageGif" | "ObsWebSocket" | "Video" | "Timeout" | "Wait"
type actionEffect = string;
type actionInfo = any[] | any
type actionVariables = string[]

type actionMode = "add" | "edit"