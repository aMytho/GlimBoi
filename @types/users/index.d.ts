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

declare module "UserHandle" {
    export function addUser(user:string, inModal?: boolean, createdBy?: string): Promise< "INVALIDUSER" | "USEREXISTS" | userDoc>
    export function addPoints(user:userName, points:number): void
    /**
     * Adds a quote to the user db
     * @param quote The quote data
     * @param id The ID of the quote in the quote database
     */
    export function addQuote(quote:QuoteType, id:number): Promise<"USERQUOTEADDED">
    /**
     * Searches for a user by their username
     * @param name The name of the user you are searching for
     */
    export function earnPointsWT(Users:{userName: userName}[]): void
    export function editUserPoints(userName:string, points:number): Promise<userDoc>
    export function findByUserName(name:string): Promise<UserType | "ADDUSER">
    /**
     * Loads all users from the DB
     */
    export function getAll(): Promise<UserDocs>
    /**
     * Returns the current users
     */
    export function getCurrentUsers():UserType[]
    /**
     * Returns users sorted by point amount
     */
    export function getTopPoints(): Promise<userDoc[]>
    /**
     * Removes a user
     * @param user The user who is being removed
     * @param inModal Was this done in the UI or from chat?
     * @param userWhoRemoves The user that is deleting another user
     */
    export function removeUser(user:userName, inModal:boolean, userWhoRemoves?:string | "Glimboi"): Promise<userName>
    /**
     * Removes points form a user
     * @param user The user who will be losing points
     * @param value How many points to remove
     */
    export function removePoints(user:userName, value:number): void
    /**
     * Removes a quote by its ID from the user db
     * @param id The Quote ID to remove
     * @param user Who the quote belongs to
     */
    export function removeQuoteByID (id:quoteID, user:userName): Promise<"NOQUOTEFOUND" | UserDocs>
    export function updatePath(env:string): void
}

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

declare module "QuoteHandle" {
    export function addquote(quoteName:quoteName, quoteData:quoteData): Promise<"USERNOTEXIST" | "QUOTEFINISHED">
    export function editquote(quoteName:quoteName, quoteData:quoteData): void
    export function removeQuote(id:quoteID, user:userName): void
    export function removeAllQuotes(user:userName): void
    export function updatePath(updatedPath:string): void
    export function getAll(): Promise<QuoteDB[]>
    export function randomQuote(): Promise<null | {user:userName, data:quoteData}>
}

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

declare module "RankHandle" {
    export function rankController(user:userName, action:string, type:string): Promise<boolean | null>
    export function getCurrentRanks(): Array<RankType>
    export function getRankPerms(rank:rankName): RankType | null
    export function updatePath(updatedPath:string): void
    export function createRank(rank:rankName): Promise<"RANKADDED" | "RANKEXISTS">
    /**
     * Edits a rank with new properties
     * @param rank The rank info to apply
     */
    export function editRank(rank:RankType): void
    export function removeRank(rank:rankName): Promise<"RANKREMOVED" | "NORANKFOUND" | "INVALIDRANK">
}