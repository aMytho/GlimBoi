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
    export function findByUserName(name:string): Promise<UserType | "ADDUSER">
    export function getAll(): Promise<UserDocs>
    /**
     * Removes a user
     * @param user The user who is being removed
     * @param inModal Was this done in the UI or from chat?
     * @param userWhoRemoves The user that is deleting another user
     */
    export function removeUser(user:userName, inModal:boolean, userWhoRemoves?:string | "Glimboi"): Promise<userName>
    /**
     * Removes a quote by its ID from the user db
     * @param id The Quote ID to remove
     * @param user Who the quote belongs to
     */
    export function removeQuoteByID (id:quoteID, user:userName): Promise<"NOQUOTEFOUND" | UserDocs>
}