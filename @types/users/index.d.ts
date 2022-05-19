/**
 * A user
 */
interface UserType {
    /**
     * The user's name
     */
    userName: string;
    /**
     * How much currency the user has
     */
    points: number;
    /**
     * How many minutes the user has watched the steam for
     */
    watchTime: number;
    /**
     * Which team the user is on (unimplemented)
     */
    team: null;
    /**
     * The user's rank
     */
    role: string;
    /**
     * The user's inventory (unimplemented)
     */
    inventory: any[];
    /**
     * The URL to the user's avatar
     */
    picture: string;
    /**
     * Array containg the users quotes
     */
    quotes: UserQuote[];
    /**
     * The user's Glimesh user ID
     */
    id: number;
}

/**
 * A quote said by a user
 */
interface QuoteType {
    /**
     * The user who said the quote
     */
    quoteName: string;
    /**
     * The quote message
     */
    quoteData: string;
    /**
     * The ID of the quote that corresponds to the user who said the quote
     */
    quoteID: number;
    /**
     * The date the quote was created
     */
    date: string;
}

/**
 * Quote data stored in the user DB
 */
interface UserQuote {
    /**
     * The ID of the quote. Glimboi ID, not DB ID
     */
    quoteID: number;
    /**
     * The quote message
     */
    quoteData: string;
    /**
     * The database ID of the quote
     */
    dbID: string;
}

interface RankType {
    rank: rankName;
    rankTier: number;
    canAddCommands: boolean;
    canEditCommands: boolean;
    canRemoveCommands: boolean;
    canAddPoints: boolean;
    canEditPoints: boolean;
    canRemovePoints: boolean;
    canAddUsers: boolean;
    canEditUsers: boolean;
    canRemoveUsers: boolean;
    canAddQuotes: boolean;
    canEditQuotes: boolean;
    canRemoveQuotes: boolean;
    canControlMusic: boolean;
    modImmunity: boolean;
    canStartEvents: boolean;
    canEndEvents: boolean;
    color: string
}

type rankName = "user" | "Mod" | "Streamer" | string
type rankProperties = "canAddCommands"| "canEditCommands" | "canRemoveCommands" | "canAddPoints" | "canEditPoints" | "canRemovePoints" | "canAddUsers" | "canEditUsers" |
"canRemoveUsers" | "canAddQuotes" | "canEditQuotes" | "canRemoveQuotes" | "canControlMusic" | "modImmunity" | "canStartEvents" | "canEndEvents"