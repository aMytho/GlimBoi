//Controls the User DB
const Datastore = require('nedb')

var usersDB;
var path = "./";

/**
 * A GlimBoi user
 */
class User {
    constructor(
      userName, ID
    ) {
      this.userName = userName;
      this.points = 0;
      this.watchTime = 0;
      this.team = null;
      this.role = "user";
      this.inventory = [];
      this.picture = "link";
      this.quotes = []
      this.id = ID
    }
  }

/**
 * Adds a user to GlimBoi
 * @param {string} user The name of the user
 * @returns If successful returns the user. 
 * @returns If the user doesn't exist on GLimesh returns code INVALIDUSER
 * @returns If the exists returns USEREXISTS
 */
async function addUser(user) {
    var newUser = await new Promise(done => {
      usersDB.find({userName:user}, function (err, docs) {
        if (docs.length == 0) {
          console.log("No user was found with the name " + user);
          ApiHandle.getUserID(user).then(ID => {
            if (isNaN(ID) == true || ID == null || typeof ID == Object) {
              console.log(ID);
                done("INVALIDUSER")
            } else {
                console.log(ID)
                var tempUser = new User(user.toLowerCase(), ID) //makes the user. L I F E !
                usersDB.insert(tempUser, function(err, doc) {
                  console.log(doc);
                  console.log("User created!");
                  done(doc)
                });
            }            
          })
        } else {
          done("USEREXISTS")
        }
      })
    })
    return newUser
};

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(GUI) {
    console.log("User path is " + GUI);
    path = GUI;
    usersDB = new Datastore({ filename: `${path}/data/users.db`, autoload: true });
  }

  /**
 * Finds a user by their username.
 * @returns If successful returns the user.
 * @returns If the user does not exist returns ADDUSER
 * @todo Find by ID instead.
 */
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
  })
})
return queryResult
}

/**
 * @returns All the users in the DB. Sent as an array
 */
async function getAll() {
  return new Promise(resolve => {
    usersDB.find({}, function (err, docs) {
      console.log('Returning all users.')
      resolve(docs)
    })
  })
}

/**
 * Removes a user
 * @param {string} user The user you are removing.
 * @returns {array} The user that was removed
 */
async function removeUser(user) {
 return new Promise(resolve => {
  usersDB.remove({ userName: user }, {}, function (err, numRemoved) {
    console.log("Removed " + user)
    resolve(user);
  });
 }) 
}

/**
 * Adds a quote. 
 * @param {string} quote 
 * @param {number} id 
 */
function addQuote(quote, id) {
  usersDB.update({userName:quote.quoteName}, {$push: {quotes: {quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id}}}, {multi: false, }, function(err,) {
    console.log("Quote linked to " + quote.quoteName + ". Quote Complete.");
  })
}

/**
 * Returns the users sorted by points.
 * @returns The array of user
 */
async function getTopPoints() {
  return new Promise(resolve => {
    usersDB.find({}).sort({ points: -1 }).exec(function (err, docs) {
      // docs is [doc1, doc3, doc2];
      resolve(docs)
    });
  })
}


module.exports = {addQuote, addUser, findByUserName, getAll, getTopPoints, removeUser, updatePath, User}