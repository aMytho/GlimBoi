//Controls the User DB
var usersDB;
var path = "./";
/**
 * An array of users
 */
var users = [];
/**
 * A GlimBoi user
 */
class User {
    constructor(
      userName, ID
    ) {
      this.userName = userName;
      this.points = Number(settings.Points.StartingAmount)
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
async function addUser(user, inModal) {
  var newUser = await new Promise(done => {
    usersDB.find({ userName: user }, function (err, docs) {
      if (docs.length == 0) {
        console.log("No user was found with the name " + user);
        ApiHandle.getUserID(user).then(ID => {
          if (isNaN(ID) == true || ID == null || typeof ID == Object) {
            console.log(ID);
            done("INVALIDUSER")
          } else {
            console.log(ID)
            var tempUser = new User(user.toLowerCase(), ID) //makes the user. L I F E !
            usersDB.insert(tempUser, function (err, doc) {
              console.log(doc);
              users.push(tempUser)
              console.log("User created!");
              if (inModal == false) {
                syncUsers(doc, "add")
              }
              done(doc)
            });
          }
        })
      } else {
        console.log(user + " already exists in the database.")
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
  name = name.toLowerCase()
  var queryResult = await new Promise(resolve => {
    for (let index = 0; index < users.length; index++) {
      if (name == users[index].userName) {
        resolve(users[index]);
        break
      }
    }
    resolve("ADDUSER")
  })
  return queryResult
}

/**
 * @returns All the users in the DB. Sent as an array
 */
async function getAll() {
  return new Promise(resolve => {
    usersDB.find({}, function (err, docs) {
      users = docs;
      resolve(docs)
    })
  })
}

/**
 * Returns an array of users
 * @returns {array} An array of users
 */
function getCurrentUsers() {
  return users
}

/**
 * Removes a user
 * @param {string} user The user you are removing.
 * @returns {array} The user that was removed
 */
async function removeUser(user, inModal) {
 user = user.toLowerCase()
 return new Promise(resolve => {
  usersDB.remove({ userName: user }, {}, function (err, numRemoved) {
    console.log("Removed " + user);
    for (let index = 0; index < users.length; index++) {
      if (user == users[index].userName) {
        users.splice(index, 1);
        if (inModal == false) {
          syncUsers(user, "remove")
        }
        QuoteHandle.removeAllQuotes(user);
        resolve(user);
        break;
      }
    }
  });
 })
}

/**
 * Adds a quote.
 * @param {string} quote
 * @param {number} id
 */
async function addQuote(quote, id) {
  return new Promise(resolve => {
    quote.quoteName = quote.quoteName.toLowerCase()
    usersDB.update({userName:quote.quoteName}, {$push: {quotes: {quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id}}}, {multi: false, }, function(err,) {
      console.log("Quote linked to " + quote.quoteName + ". Quote Complete.");
      for (let i = 0; i < users.length; i++) {
        if (users[i].userName == quote.quoteName) {
          users[i].quotes.push({quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id});
          break;
        }  
      }
      syncQuotes(quote.quoteName, quote, "add");
      resolve("USERQUOTEADDED")
    })
  })
}

/**
 * Removes a quote from the users collection and from the quote collection. Attempts to update the user table.
 * @param {Number} id The quote ID (quote id, not database id)
 * @param {string} user The user who the quote belongs to. Lowercase please!
 * @async
 */
async function removeQuoteByID(id, user) {
  return new Promise(resolve => {
  usersDB.find({$and: [{userName: user}, {quotes: {$elemMatch: {quoteID: id}}}]}, function (err, docs) {
    console.log(docs);
    if (docs.length < 1) {
      resolve("NOQUOTEFOUND")
      return;
    } else {
      for (let index = 0; index < docs[0].quotes.length; index++) {
        if (docs[0].quotes[index].quoteID == id) {
          console.log("Found the quote in the user DB");
          docs[0].quotes.splice(index, 1)
          usersDB.update({$and: [{userName: user}, {quotes: {$elemMatch: {quoteID: id}}}]}, {$set: {quotes: docs[0].quotes}}, {returnUpdatedDocs: true}, function(affectedDocuments) {
            console.log(affectedDocuments);
            QuoteHandle.removeQuote(id, user);
            syncQuotes(user, docs[0].quotes, "remove")
            resolve(affectedDocuments);
          })
        }
      }
    }
  })
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

async function editUser(userName, role, points) {
  return new Promise(resolve => {
    console.log(userName, role, points)
    usersDB.update({ userName: userName }, { $set: { role: role, points: Number(points) } }, {returnUpdatedDocs: true}, function (err, numReplaced, affectedDocuments) {
      console.log("Edited " + userName);
      console.log(affectedDocuments)
      resolve(affectedDocuments);
    });
  })
}

async function editUserPoints(userName, points) {
  return new Promise(resolve => {
    console.log(userName, points)
    usersDB.update({ userName: userName }, { $set: {points: Number(points) } }, {returnUpdatedDocs: true}, function (err, numReplaced, affectedDocuments) {
      console.log("Edited " + userName);
      console.log(affectedDocuments)
      resolve(affectedDocuments);
    });
  })
}

/**
 * Adds points and watch time to the users who are active
 * @param {Array} users
 */
function earnPointsWT(users) {
  usersDB.update({ $or: users }, { $inc: { points: settings.Points.accumalation, watchTime: 15 } }, {returnUpdatedDocs: true, multi: true}, function (err, numReplaced, affectedDocuments) {
    console.log("Adding " + settings.Points.accumalation + " points to " + numReplaced + " users.");
    affectedDocuments.forEach(element => {
      editUserTable(element.userName, element.role, element.points)
    });
  });
}

function removePoints(user, value) {
  usersDB.update({ userName: user }, { $inc: { points: -value} }, {returnUpdatedDocs: true}, function (err, numReplaced, affectedDocuments) {
    console.log("Removing " + value + " points from " + user);
    editUserTable(user, affectedDocuments.role, affectedDocuments.points)
  });
}

module.exports = {addQuote, addUser, earnPointsWT, editUser, editUserPoints, findByUserName, getAll, getCurrentUsers, getTopPoints, removePoints, removeUser, removeQuoteByID, updatePath, User}