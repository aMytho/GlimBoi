var fs = require("fs");
const { app, BrowserWindow } = require("electron");
const Datastore = require("nedb");
var UserHandle = require("./users.js");
var path = "./";
var otherPath = null;

let quotesDB;
let userDB;
//let quotesDBTest = new Datastore({ filename: `${path}data/quotes.db`, autoload: true });

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
    filename: `${path}/chatbot/data/quotes.db`,
    autoload: true,
  });
 /* userDB = new Datastore({
    filename: `${path}/chatbot/data/users.db`,
    autoload: true,
  });*/
 // userDB.persistence.setAutocompactionInterval( 5000 /*ms*/ )
}

//Adds a quote
function addquote(quoteName, quoteData) {
  var newquote = new Quote(quoteName, quoteData);
  newquote.quoteID.then(data => {
    if (data == "ADDUSER") {
      console.log("Creating user " + quoteName);
      var newUser = UserHandle.addUser(quoteName);
      newUser.then(user => {
        addquote(quoteName, quoteData);
      })
       return
    } else {
    newquote.quoteID = data[0].quotes.length + 1
    console.log(newquote)
    try {
      quotesDB.insert(newquote, function (err, doc) {
        console.log("Inserted", "'", doc.quoteData, "", "with ID", doc._id, "and quote ID", doc.quoteID);
        UserHandle.addQuote(newquote, doc._id)
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

function getAll() {
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

function test() {
  
  userDB.find({}, function (err, docs) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaa');
    console.log(docs);
    console.log('aaaaaaaaaaaaa')
  })


}

module.exports = { addquote, editquote, getAll, removequote, updatePath }; //Send to the main file.