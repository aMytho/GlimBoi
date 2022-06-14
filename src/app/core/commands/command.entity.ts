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
    media?: string
}