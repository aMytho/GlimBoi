//Controls the User DB
const Datastore = require('nedb')
const app = require('electron');

var usersDB;
var path = "./";

class User {
    constructor(
      userName
    ) {
      this.userName = userName;
      this.points = 0;
      this.watchTime = 0;
      this.team = null;
      this.role = "user";
      this.inventory = [];
      this.picture = "link";
      this.quotes = []
    }
  }


async function addUser(user) {
    var tempUser = new User(user) //makes the user. L I F E !
    var newUser = await new Promise(done => {
      usersDB.insert(tempUser, function(err, doc) {
        console.log(doc);
        console.log("User created!")
        done(doc)
      });
    })
    return newUser
};

function updatePath(GUI) {
    console.log("User path is " + GUI);
    path = GUI;
    usersDB = new Datastore({ filename: `${path}/chatbot/data/users.db`, autoload: true });
  
   //quotesDB = new Datastore({ filename: `${path}data/quotes.db`, autoload: true });
   //usersDB = new Datastore({ filename: `${path}data/users.db`, autoload: true });
  }

async function findByUserName(name) {
  var queryResult = await new Promise(resolve => {
   usersDB.find({userName: name}, function (err, docs) {
     console.log(docs);
     if (docs.length == 0 ) {
       console.log("No user was found with the name " + name);
       resolve("ADDUSER")
     } else {
       resolve(docs)
     }

    //resolve(docs)
  })
})
return queryResult
}

async function getAllUsers() {
  console.log("searching.");
  const result = await getAll()
  console.log('test2')
  console.log(result)
  return result
}

function getAll() {
  return new Promise(resolve => {
    usersDB.find({}, function (err, docs) {
      console.log('Returning all users.')
      resolve(docs)
    })
  })
}


function addQuote(quote, id) {
  usersDB.update({userName:quote.quoteName}, {$push: {quotes: {quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id}}}, {multi: false, }, function(err,) {
    console.log("Quote linked to " + quote.quoteName + ". Quote Complete.");
  })
}


module.exports = {addQuote, addUser, findByUserName, getAllUsers, updatePath, User}