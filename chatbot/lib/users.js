//Controls the User DB
const Datastore = require('nedb')
const app = require('electron')

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


function adduser(user) {
    var tempUser = new User(user) //makes the user. L I F E !
    usersDB.insert(tempUser, function(err, doc) {
      console.log(doc)
    });
    console.log("user created!");
};

function updatePath(GUI) {
    console.log("path is " + GUI);
    path = GUI;
    usersDB = new Datastore({ filename: `${path}/chatbot/data/users.db`, autoload: true });
  
   //quotesDB = new Datastore({ filename: `${path}data/quotes.db`, autoload: true });
   //usersDB = new Datastore({ filename: `${path}data/users.db`, autoload: true });
  }

function query(name, value) {

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
      console.log('test1')
      resolve(docs)
    })
  })
}





module.exports = {adduser, getAllUsers, updatePath, query}