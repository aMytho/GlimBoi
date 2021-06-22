interface CommandType {
    commandName: string;
    uses: number
    points: number;
    cooldown: number;
    rank: rankName;
    repeat: boolean;
    actions: any
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
    export function getAll(): Promise<CommandType[]>
}