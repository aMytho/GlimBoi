interface UserType {
    userName: userName;
    points: number;
    watchTime: number;
    team: null;
    role: string
    inventory: any[];
    picture: string;
    quotes: any[];
    id: number;
}

/**
 * Object containing the affected document
 */
type userDoc = UserType

 /**
 * Object containing the affected document
 */
type UserDocs = UserType[]

/**
 * The name of a user
 */
type userName = string

interface QuoteType {
    quoteName: string;
    quoteData: string;
    quoteID: number;
    date: string;
}

interface QuoteDB extends QuoteType {
    _id: string;
}

/**
 * The name of the quote
 */
type quoteName = string;

/**
 * What is in the quote (the message)
 */
type quoteData = string;

/**
 * The ID of the quote
 */
type quoteID = number

interface RankType {
    rank:rankName
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
    canDeleteMessages: boolean;
    canTimeoutUsers: boolean;
    canBanUsers: boolean
    canUnBanUsers: boolean
    modImmunity: boolean
}

type rankName = "user" | "Mod" | "Streamer" | string
type rankProperties = "canAddCommands" | "canEditCommands"