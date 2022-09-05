interface CommandType {
    /**
     * Name of the command
     */
    commandName: string;
    triggers: TriggerStructure[];
    /**
     * The amount of times the command has been activated
     */
    uses: number
    /**
     * The amount of points to run the command
     */
    points: number;
    /**
     * How long the command must be on cooldown for
     */
    cooldown: number;
    /**
     * The minimum rank to run the command
     */
    rank: rankName;
    /**
     * Whether to repeat the command on a timer
     */
    repeat: boolean;
    /**
     * Delete the command after it finishes running
     */
    shouldDelete: boolean;
    /**
     * The actions of the command
     */
    actions: ChatAction[];
    /**
     * The message to send
     * @deprecated Replaced by actions
     */
    message?: string;
    /**
     * Whether or not the command can be activated
     */
    disabled: boolean;
    /**
     * The sound to play
     * @deprecated Replaced by actions
     */
    sound?: string;
    /**
     * The media to display
     * @deprecated
     */
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
     * Will the command be deleted once used? (!cmd)
     */
     shouldDelete: boolean;
    /**
     * What the command does
     */
    actions: any;
    disabled: boolean;
    triggers: TriggerStructure[];
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
    info: actionInfo
    generateVariables: actionVariables
}

declare class ChatAction implements ChatActionType {
    action: actionName
    info: actionInfo
    generateVariables: actionVariables
    parseGenerateVariables(variables): actionVariables
    run(variable:any): Promise<any>;
}

interface ChatMessageType extends ChatActionType {
    message: string
}

type BuildChatMessage = {message: string}
interface ApiRequestGetType extends ChatActionType {
    url:string
    headers:any
    returns: any
}

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

type actionName = "ChatMessage" | "ApiRequestGet" | "ApiRequest" | "Audio" | "Ban" | "Follow" | "ImageGif" |
"Matrix" | "ObsWebSocket" | "Points" | "ReadFile" |  "Video" | "Timeout" | "Twitter" | "Notification" |
"Wait" | "WriteFile"
type actionInfo = any[] | any
type actionVariables = string[]

type actionMode = "add" | "edit"

type CommandTrigger = "ChatMessage" | "Follow" | "Welcome User" | "Subscribe" | "Gift Sub" | "Donate" | "Manual";

type TriggerStructure = {
    trigger: CommandTrigger;
    constraints?: undefined | TriggerConstraints;
}
type TriggerConstraints = ChatMessageTrigger | FollowTrigger | WelcomeUserTrigger

type ChatMessageTrigger = {
    /**
     * What the message must start with to be triggered
     */
    startsWith?: string;
}

type FollowTrigger = {}

type WelcomeUserTrigger = {
    /**
     * The user to exclusivly welcome.
     */
    user?: string;
}

type SubscribeTrigger = {}

type TriggerContext = {
    /**
     * Allows the command to run regardless of permissions
     */
    bypassPermissions?: boolean;
    /**
     * The message from chat
     */
    message?: string;
    messageId?: string;
    user?: {
        avatarUrl?: string;
        id?: string;
        username?: string;
    }
    trigger: CommandTrigger;

    variables?: ContextPossibleVariables;
}

type ContextPossibleVariables = {
    /**
     * Someone gifted a sub
     */
    recipient?: {
        username?: string;
    }
    /**
     * Someone donated to the streamer
     */
    donation?: {
        amount?: string
    }
}