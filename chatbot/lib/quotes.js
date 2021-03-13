var path = "./";
let quotesDB;

/**
 * A quote. 
 * @constructor quotename - User who said the quote
 * @constructor quotedata - The quote itself
 */
class Quote {
  	constructor(quoteName, quoteData) {
    	console.log(quoteName, quoteData)
    	this.quoteName = quoteName; //The person who said the auote
    	this.quoteData = quoteData; // No explanation here
    	this.quoteID = generateID(quoteName) //ID of the users quotes. The DB ID is different.
    	this.date = generateDate(); //Tik toc
  	}
} 

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
  	console.log("Quote path is " + GUI);
  	path = GUI;
  	quotesDB = new Datastore({
    	filename: `${path}/data/quotes.db`,
    	autoload: true,
  	});
}

/**
 * Adds a quote
 * @param {string} quoteName The user who said the quote
 * @param {string} quoteData The data of the quote. (message)
 */
async function addquote(quoteName, quoteData) {
  	return new Promise(resolve => {
    	var newquote = new Quote(quoteName, quoteData);
    	newquote.quoteID.then(data => {
      		console.log('Quote ID created.')
      		console.log(data)
      		if (data == "ADDUSER") {
        		console.log("Creating user " + quoteName);
        		var newUser = UserHandle.addUser(quoteName);
        		newUser.then(user => {
          			if (user == "INVALIDUSER") {
            			console.log("User not found, failed to create quote");
            		try {document.getElementById("errorMessageAddQuote").innerText = "The user does not exist on glimesh so the quote can't be created."} catch(e) {}
            			resolve("USERNOTEXIST")
          			} else {
          				addquote(quoteName, quoteData);
          			}
        		})
         		return
      		} else {
        		if (data.quotes.length == 0) {
          			newquote.quoteID = 1
        		} else {
          			var count = data.quotes.length - 1;
          			console.log(data.quotes[count])
          			newquote.quoteID = Number(data.quotes[count].quoteID) + 1
        		}
      			console.log(newquote)
      			try {
        			quotesDB.insert(newquote, function (err, doc) {
          				console.log("Inserted", "'", doc.quoteData, "", "with ID", doc._id, "and quote ID", doc.quoteID);
          				UserHandle.addQuote(newquote, doc._id).then(data => {
            				try { document.getElementById('errorMessageAddQuote').innerText = `Quote Created!`} catch(e) {}
            				resolve("QUOTEFINISHED")
          				})    
        			});
      			} catch (e) {
        			console.log(e);
        			console.log(
          				"Failure to add quote. Ensure only one instance of the bot is running and check your quotes.db file (in the data folder) for curruption."
        			);
      			}
    		}
    	})
  	})
}

/**
 * Removes a quote
 * @param {string} quoteName The quote data
 */
function removeQuote(id, user) {
  	try {
    	quotesDB.remove({ $and: [{ quoteID: id }, { quoteName: user }] }, {}, function (err, numRemoved) {
      		console.log("Quote " + id + " was removed from the db");
    	});
  	} catch (e) {
    	console.log(e);
  	}
}

/**
 * Removes all of the users quotes
 * @param {string} user The user who owns the quotes that will be deleted
 */
function removeAllQuotes(user) {
  	console.log(user)
  	try {
    	quotesDB.remove({ quoteName: user }, {multi: true}, function (err, numRemoved) {
      		console.log(numRemoved + " quotes were removed from " + user)
    	});
  	} catch (e) {
    	console.log(e);
  	}
}

/**
 * Edits an existing quote
 * @param {string} quoteName The user who said the quote
 * @param {string} quoteData The quote itself
 */
function editquote(quoteName, quoteData) {
  	console.log(quoteName, quoteData);
  	quotesDB.update(
    	{ quoteName: quoteName },
    	{ $set: { quoteName } },
    	{},
    	function (err, numReplaced) {
      		console.log("Replacing " + quoteName);
    	}
  	);
}

/**
 * Returns all quotes as an array
 */
async function getAll() {
  	return new Promise(resolve => {
    	quotesDB.find({}, function (err, docs) {
      		console.log(docs)
      		resolve(docs)
    	})
  	})
}

/**
 * Generates the quote ID. Determined by the amount of quotes that the user has
 * @param {string} quotename the name of the quote
 */
async function generateID(quoteName) {
  	console.log("Generating ID");
  	var usedID = await UserHandle.findByUserName(quoteName); //Gets the number of quotes of this user. Is the user is not existent return ADDUSER
  	return usedID
}

/**
 * Generates the Date.
 */
function generateDate() {
  	var theTime = new Date().toTimeString();
  	console.log(theTime);
  	return theTime;
}

/**
 * Returns a random quote from the DB. Null if none exist
 */
async function randomQuote() {
  	return new Promise(resolve => {
    	quotesDB.find({}, function (err, docs) {
      		if (docs.length == 0 || docs == undefined) {
        		resolve(null)
      		} else {
      			var randomQuote = Math.floor(Math.random() * docs.length);
      			console.log(docs[randomQuote].quoteName, docs[randomQuote].quoteData);
      			resolve({user:docs[randomQuote].quoteName, data: docs[randomQuote].quoteData})
      		}
    	})
  	})
}

module.exports = { addquote, editquote, getAll, randomQuote, removeAllQuotes, removeQuote, updatePath }; //Send to the main file.
