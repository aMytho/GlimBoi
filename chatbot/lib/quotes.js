var fs = require("fs");
const { app, BrowserWindow } = require("electron");
const Datastore = require("nedb");
const { type } = require("os");

console.log(__dirname);
var path = "./";
var otherPath = null;

let quotesDB;
//let quotesDBTest = new Datastore({ filename: `${path}data/quotes.db`, autoload: true });

class Quote {
  constructor(quoteName, quoteData) {
    this.quoteName = quoteName; //The person who said the auote
    this.quoteData = quoteData; // No explanation here
    this.quoteID = generateID(); //Id of the quotes used to edit and delete it from the USER side. The DB has its own ID which is separate.
    this.date = generateDate(); //Tik toc
  }
}

//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
  quotesDB = new Datastore({
    filename: `${path}/chatbot/data/quotes.db`,
    autoload: true,
  });
}

//Adds a quote
function addquote(quoteName, quoteData) {
  var newquote = new Quote(quoteName, quoteData);
  try {
    //inserts a document as a quote. Uses the quote made above.
    quotesDB.insert(newquote, function (err, doc) {
      console.log("Inserted", doc.quoteName, "with ID", doc._id);
    });
  } catch (e) {
    console.log(e);
    console.log(
      "Failure to add quote. Ensure only one instance of the bot is running and check your quotes.db file (in the data folder) for curruption."
    );
  }
  return newquote;
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

//Generates the Id of the quotes tha iteracts with users. The DB ID is different and not related to this.
function generateID() {
  console.log("Generating ID");
  var ID = Math.floor(Math.random() * 1000); //We limit the quotes to 999. If you need more increase this number.
  console.log(ID);
      var isTaken = "invalid";
    //I give it 1000 tries to get a non used id. If you somehow do not succeed I'm going to laugh
    /*
    quotesDB.find({ quoteID: 481 }, function (err, docs,) {
      console.log("Docs is " + docs);
      console.log(typeof docs);
      if (docs == "") {
          console.log("This ID is open. Adding")
          isTaken = false;
      } else {
        console.log("ID is taken. Retrying");
        ID = Math.floor(Math.random() * 1000);
        isTaken = true;
      }
    });
*/
  return ID = 5;
}

function generateDate() {
  var theTime = new Date().toTimeString();
  console.log(theTime);
  return theTime;
}

module.exports = { addquote, editquote, removequote, updatePath }; //Send to the main file.
