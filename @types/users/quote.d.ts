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