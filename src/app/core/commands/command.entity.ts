export interface Command {
    /**
     * Name of the command
     */
    commandName: string;
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
    rank: string;
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
    actions: any[];
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
    media?: string;
    /**
     * The triggers of the command
     */
    triggers: TriggerStructure[];
}

export type CommandTrigger = "ChatMessage" | "Follow" | "Welcome User" | "Subscribe" | "Gift Sub" | "Donate";

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