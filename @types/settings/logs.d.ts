interface LogType {
    event: string;
    caused: string
    affected: string[];
    time: Date;
    description: string;
}

interface LogConstructor {
    /**
     * The event that we are logging
     */
    event: string;
    /**
     * The users that caused and aare affected by the event
     */
    users: userName[];
    /**
     * Optional data to be added to the event
     */
    data?: any
}

declare module "LogHandle" {
    export function logEvent({}:LogConstructor):void
}