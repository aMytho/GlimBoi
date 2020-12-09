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
      usersDB.find({userName:user}, function (err, docs) {
        if (docs.length == 0) {
          console.log("No user was found with the name " + user);
          usersDB.insert(tempUser, function(err, doc) {
            console.log(doc);
            console.log("User created!")
            done(doc)
          });
        } else {
          done("USEREXISTS")
        }
      })
    })
    return newUser
};

function updatePath(GUI) {
    console.log("User path is " + GUI);
    path = GUI;
    usersDB = new Datastore({ filename: `${path}/chatbot/data/users.db`, autoload: true });
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


async function getAll() {
  return new Promise(resolve => {
    usersDB.find({}, function (err, docs) {
      console.log('Returning all users.')
      resolve(docs)
    })
  })
}

async function removeUser(user) {
 return new Promise(resolve => {
  usersDB.remove({ userName: user }, {}, function (err, numRemoved) {
    console.log("Removed " + user)
    resolve(user);
  });
 }) 
}


function addQuote(quote, id) {
  usersDB.update({userName:quote.quoteName}, {$push: {quotes: {quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id}}}, {multi: false, }, function(err,) {
    console.log("Quote linked to " + quote.quoteName + ". Quote Complete.");
  })
}

async function getTopPoints() {
  return new Promise(resolve => {
    usersDB.find({}).sort({ points: -1 }).exec(function (err, docs) {
      // docs is [doc1, doc3, doc2];
      resolve(docs)
    });
  })
}


module.exports = {addQuote, addUser, findByUserName, getAll, getTopPoints, removeUser, updatePath, User}