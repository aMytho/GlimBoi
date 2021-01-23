const Datastore = require("nedb");
var path = "./";
let quotesDB;

class Quote {
  constructor(quoteName, quoteData) {
    this.quoteName = quoteName; //The person who said the auote
    this.quoteData = quoteData; // No explanation here
    this.quoteID = generateID(quoteName) //ID of the users quotes. The DB ID is different.
    this.date = generateDate(); //Tik toc
  }
} 

//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("Quote path is " + GUI);
  path = GUI;
  quotesDB = new Datastore({
    filename: `${path}/data/quotes.db`,
    autoload: true,
  });
}

//Adds a quote
function addquote(quoteName, quoteData) {
  var newquote = new Quote(quoteName, quoteData);
  newquote.quoteID.then(data => {
    if (data == "ADDUSER") {
      console.log("Creating user " + quoteName);
      var newUser = UserHandle.addUser(quoteName);
      newUser.then(user => {
        if (user == "INVALIDUSER") {
          console.log("User not found, failed to create quote");
          document.getElementById("errorMessageAddQuote").innerText = "The user does not exist on glimesh so the quote can't be created."
        } else {
        addquote(quoteName, quoteData);
        }
      })
       return
    } else {
    newquote.quoteID = data[0].quotes.length + 1
    console.log(newquote)
    try {
      quotesDB.insert(newquote, function (err, doc) {
        console.log("Inserted", "'", doc.quoteData, "", "with ID", doc._id, "and quote ID", doc.quoteID);
        UserHandle.addQuote(newquote, doc._id);
        document.getElementById('errorMessageAddQuote').innerText = `Quote Created!`
      });
    } catch (e) {
      console.log(e);
      console.log(
        "Failure to add quote. Ensure only one instance of the bot is running and check your quotes.db file (in the data folder) for curruption."
      );
    }
  }
  })
}

//Removes a quote
function removequote(quoteName) {
  try {
    quotesDB.remove({ quoteName: quoteName }, {}, function (err, numRemoved) {
      console.log(quoteName + " was removed from the db");
    });
  } catch (e) {
    console.log(e);
  }
}

//Edits a quote
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

async function getAll() {
  return new Promise(resolve => {
    quotesDB.find({}, function (err, docs) {
      console.log(docs)
      resolve(docs)
    })
  })
}

//Generates the ID of the quote. THis is determined by the users total number of quotes.
 async function generateID(quoteName) {
  console.log("Generating ID");
  var usedID = await UserHandle.findByUserName(quoteName); //Gets the number of quotes of this user. Is the user is not existent return ADDUSER
  return usedID
}


function generateDate() {
  var theTime = new Date().toTimeString();
  console.log(theTime);
  return theTime;
}

async function randomQuote() {
  return new Promise(resolve => {
    quotesDB.find({}, function (err, docs) {
      var randomQuote = Math.floor(Math.random() * docs.length);
      console.log(docs[randomQuote].quoteName, docs[randomQuote].quoteData);
      resolve({user:docs[randomQuote].quoteName, data: docs[randomQuote].quoteData})
    })
  })
}

module.exports = { addquote, editquote, getAll, randomQuote, removequote, updatePath }; //Send to the main file.
