let quotesDB:Nedb;

/**
 * A quote.
 * @constructor quotename - User who said the quote
 * @constructor quotedata - The quote itself
 */
class Quote implements QuoteType {
    quoteName: string;
    quoteData: string;
    quoteID: number;
    date: string;
    constructor(quoteName: string, quoteData: string) {
        console.log(quoteName, quoteData);
        this.quoteName = quoteName; //The person who said the auote
        this.quoteData = quoteData; // The quote itself
        this.quoteID = 1 //ID of the users quotes. We change this after the creation of the quote
        this.date = new Date().toTimeString(); //Tik toc
    }
    generateID(quoteCreator: UserType) {
        console.log("Generating Quote ID");
        let totalQuotes = quoteCreator.quotes.length; // The total amount of quotes the user has
        if (totalQuotes > 0) {
            return Number(quoteCreator.quotes[totalQuotes - 1].quoteID) + 1; //Add 1 to the last quote ID
        } else {
            return 1; // If the user has no quotes, the ID is 1
        }
    }
}

/**
 * Updates the path to the DB.
 */
function updatePath(updatedPath: string) {
    quotesDB = new Datastore({
        filename: `${updatedPath}/data/quotes.db`,
        autoload: true,
    });
}

/**
 * Adds a quote
 * @param {string} quoteName The user who said the quote
 * @param {string} quoteData The data of the quote. (message)
 */
function addQuote(user: UserType, quoteData: string, onBehalfOf: string = "Glimboi"): Promise<QuoteType> {
    return new Promise(async resolve => {
        let newQuote = new Quote(user.userName, quoteData); //Create a new quote
        newQuote.quoteID = newQuote.generateID(user); //Generate the ID of the quote
        console.log('Quote ID created.');
        quotesDB.insert(newQuote, function (err: Error | null, doc: any) { //Insert the quote into the DB
            console.log(`Inserted ${doc.quoteData} with ID ${doc._id} and quote ID ${doc.quoteID}`);
            LogHandle.logEvent({ event: "Add Quote", users: [onBehalfOf, newQuote.quoteName] }); //Log the event
            resolve(newQuote);
        });
    })
}

/**
 * Removes a quote
 * @param {string} quoteName The quote data
 */
function removeQuote(id: number, user: string) {
    quotesDB.remove({ $and: [{ quoteID: id }, { quoteName: user }] }, {}, function (err, numRemoved) {
        console.log(`Quote ${id} was removed from ${user}`);
    });
}

/**
 * Removes all of the users quotes
 * @param {string} user The user who owns the quotes that will be deleted
 */
function removeAllQuotes(user: string) {
    console.log(`Removing all quotes by ${user}`);
    quotesDB.remove({ quoteName: user }, { multi: true }, function (err, numRemoved) {
        console.log(`${numRemoved} quotes were removed from ${user}`);
    });
}

/**
 * Returns all quotes as an array
 */
function getAll(): Promise<QuoteType[]> {
    return new Promise(resolve => {
        quotesDB.find({}, function (err: Error | null, docs: QuoteType[]) {
            console.log(docs);
            resolve(docs);
        })
    })
}

/**
 * Returns a random quote from the DB. Null if none exist
 */
function randomQuote(): Promise<null | { user: string, data: string }> {
    return new Promise(resolve => {
        quotesDB.find({}, function (err: Error | null, docs: QuoteType[]) {
            if (docs.length == 0) {
                resolve(null);
            } else {
                let randomQuoteIndex = Math.floor(Math.random() * docs.length);
                console.log(docs[randomQuoteIndex].quoteName, docs[randomQuoteIndex].quoteData);
                resolve({ user: docs[randomQuoteIndex].quoteName, data: docs[randomQuoteIndex].quoteData })
            }
        })
    })
}

/**
 * Counts the amount of quotes in the DB
 */
function countQuotes(): Promise<number> {
    return new Promise(resolve => {
        quotesDB.count({}, function (err: Error | null, count: number) {
            resolve(count);
        })
    })
}

export { addQuote, countQuotes, getAll, randomQuote, removeAllQuotes, removeQuote, updatePath };