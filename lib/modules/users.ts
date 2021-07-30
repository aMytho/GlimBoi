//Controls the User DB

let usersDB:Nedb;
let path = "./";
/**
 * An array of users
 */
let users:User[] = [];
declare let b:lol

/**
 * A GlimBoi user
 * @param {string} userName The username of the user
 * @param {number} ID The user ID of the user (from glimesh.tv)
 */
class User implements UserType {
    userName: userName;
    points: number;
    watchTime: number;
    team: null;
    role: string
    inventory: any[];
    picture: string;
    quotes: any[];
    id: number;
    constructor(userName:string, ID:number) {
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
 * @param {string} user The name of the user to be created
 * @param {boolean} inModal Is the user added from the GUI?
 * @param {string} createdBy The user who created the new user
 * @returns If successful returns the user.
 * @returns If the user doesn't exist on GLimesh returns code INVALIDUSER
 * @returns If the exists returns USEREXISTS
 */
async function addUser(user:string, inModal: boolean, createdBy: string = "Glimboi"): Promise<"INVALIDUSER" | "USEREXISTS" | UserType> {
    return await new Promise(done => {
        usersDB.find({ userName: user }, async function (err:string, docs:docs) {
            if (docs.length == 0) {
                console.log("No user was found with the name " + user);
                let ID = await ApiHandle.getUserID(user)
                if (typeof ID !== "number" || ID == null || typeof ID == "object") {
                    console.log(ID);
                    done("INVALIDUSER")
                } else {
                    let tempUser = new User(user.toLowerCase(), ID) //makes the user. L I F E !
                    usersDB.insert(tempUser, function (err:Error | null, doc:UserType) {
                        console.log(doc);
                        console.log("User created!");
                        users.push(tempUser);
                        LogHandle.logEvent({ event: "Add User", users: [createdBy, tempUser.userName] });
                        if (inModal == false) {
                            globalThis.syncUsers(doc, "add")
                        }
                        done(doc)
                    });
                }
            } else {
                console.log(user + " already exists in the database.")
                done("USEREXISTS")
            }
        })
    })
};

/**
 * Updates the path to the DB. The path variable is updated
 */
function updatePath(env:string) {
  	path = env;
      // @ts-ignore
  	usersDB = new Datastore({ filename: `${path}/data/users.db`, autoload: true });
}

  /**
 * Finds a user by their username.
 * @returns If successful returns the user.
 * @returns If the user does not exist returns ADDUSER
 * @todo Find by ID instead.
 */
async function findByUserName(name:string): Promise<UserType | "ADDUSER"> {
  	name = name.toLowerCase()
  	 return new Promise(resolve => {
    	for (let index = 0; index < users.length; index++) {
      		if (name == users[index].userName) {
        		resolve(users[index]);
        		break
      		}
    	}
    	resolve("ADDUSER")
  	})
}

/**
 * @returns All the users in the DB. Sent as an array
 */
async function getAll(): Promise<UserDocs> {
  	return new Promise(resolve => {
    	usersDB.find({}, function (err:string, docs:UserDocs) {
      		users = docs;
      		resolve(docs)
    	})
  	})
}


function getCurrentUsers():UserType[] {
  	return users
}

/**
 * Removes a user
 * @param {string} user The user you are removing.
 * @param {boolean} inModal Was this done from the GUI?
 * @param {string} userWhoRemoves The user who removed the abt to be deleted user.
 * @returns {array} The user that was removed
 */
async function removeUser(user:string, inModal:boolean, userWhoRemoves = "Glimboi"): Promise<userName> {
 	user = user.toLowerCase()
 	return new Promise(resolve => {
  		usersDB.remove({ userName: user }, {}, function (err:Error | null, numRemoved:number) {
    		console.log("Removed " + user);
    		for (let index = 0; index < users.length; index++) {
      			if (user == users[index].userName) {
        			users.splice(index, 1);
                    LogHandle.logEvent({ event: "Remove User", users: [userWhoRemoves, user] });
        			if (inModal == false) {
          				globalThis.syncUsers(user, "remove")
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
async function addQuote(quote:QuoteType, id:number): Promise<"USERQUOTEADDED"> {
  	return new Promise(resolve => {
    	quote.quoteName = quote.quoteName.toLowerCase()
    	usersDB.update({userName:quote.quoteName}, {$push: {quotes: {quoteID: quote.quoteID, quoteData:quote.quoteData, dbID: id}}}, {multi: false, }, function(err:Error | null) {
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
async function removeQuoteByID(id:number, user:string): Promise<"NOQUOTEFOUND" | UserDocs> {
  	return new Promise(resolve => {
  		usersDB.find({$and: [{userName: user}, {quotes: {$elemMatch: {quoteID: id}}}]}, function (err:Error | null, docs:UserDocs) {
    		console.log(docs);
    		if (docs.length < 1) {
      			resolve("NOQUOTEFOUND")
      			return;
    		} else {
      			for (let index = 0; index < docs[0].quotes.length; index++) {
        			if (docs[0].quotes[index].quoteID == id) {
          				console.log("Found the quote in the user DB");
          				docs[0].quotes.splice(index, 1)
          				usersDB.update({$and: [{userName: user}, {quotes: {$elemMatch: {quoteID: id}}}]}, {$set: {quotes: docs[0].quotes}}, {returnUpdatedDocs: true}, function(err: Error | null, numAffected:number, affectedDocuments:UserDocs) {
            				console.log(affectedDocuments);
            				QuoteHandle.removeQuote(id, user);
            				globalThis.syncQuotes(user, docs[0].quotes, "remove")
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
async function getTopPoints(): Promise<userDoc[]> {
  	return new Promise(resolve => {
    	usersDB.find({}).sort({ points: -1 }).exec(function (err:Error | null, docs:UserDocs) {
      		// docs is [doc1, doc3, doc2];
      		resolve(docs)
    	});
  	})
}

/**
 * Edits a users points and role
 * @param {string} userName The user
 * @param {string} role The role they will have
 * @param {number} points The points they will have
 * @returns {promise}
 */
async function editUser(userName:string, role:rankName, points:number, editor:string = "Glimboi"): Promise<UserDocs> {
  	return new Promise(resolve => {
    	console.log(userName, role, points)
    	usersDB.update({ userName: userName }, { $set: { role: role, points: Number(points) } }, {returnUpdatedDocs: true}, function (err:Error | null, numReplaced:number, affectedDocuments:UserDocs) {
      		console.log("Edited " + userName);
      		console.log(affectedDocuments);
            LogHandle.logEvent({ event: "Edit User", users: [editor, userName], data: [role, points] });
            for (let i = 0; i < users.length; i++) {
                if (userName == users[i].userName) {
                    users[i].role = role
                }
            }
      		resolve(affectedDocuments);
    	});
  	})
}

/**
 * Edits how many points the user has
 * @param {string} userName The user
 * @param {number} points How many points they will have
 * @returns {promise}
 */
async function editUserPoints(userName:string, points:number): Promise<userDoc> {
  	return new Promise(resolve => {
    	console.log(userName, points)
    	usersDB.update({ userName: userName }, { $set: {points: Number(points) } }, {returnUpdatedDocs: true}, function (err:Error | null, numReplaced:number, affectedDocuments:userDoc) {
      		console.log("Edited " + userName);
      		console.log(affectedDocuments);
      		for (let i = 0; i < users.length; i++) {
          		if (userName == users[i].userName) {
            		users[i].points = Number(points);
            		globalThis.editUserTable(userName, affectedDocuments.role, Number(points))
          		}
      		}
      		resolve(affectedDocuments);
    	});
  	})
}

/**
 * Adds points and watch time to the users who are active
 * @param {Array} Users
 */
function earnPointsWT(Users:{userName: userName}[]): void {
  	usersDB.update({ $or: Users }, { $inc: { points: settings.Points.accumalation, watchTime: 15 } }, {returnUpdatedDocs: true, multi: true}, function (err:Error | null, numReplaced:number, affectedDocuments:UserDocs) {
    	console.log("Adding " + settings.Points.accumalation + " points to " + numReplaced + " users.");
    	affectedDocuments.forEach(function(item:UserType, index:number) {
      		globalThis.editUserTable(item.userName, item.role, item.points);
      		globalThis.editUserWatchTime(item.userName, item.watchTime)
      		for (let i = 0; i < users.length; i++) {
          		if (item.userName == users[i].userName) {
              		users[i].points = affectedDocuments[index].points;
              		users[i].watchTime = affectedDocuments[index].watchTime;
              		break;
          		}
      		}
    	});
  	});
}

/**
 * Adds some points to a user
 * @param {string} user The user who will be getting points
 * @param {number} points The amount of points to add
 */
function addPoints(user:userName, points:number): void {
    points = Number(points)
    usersDB.update({userName: user}, {$inc: {points: points}}, {returnUpdatedDocs: true}, function(err:Error | null, numReplaced:number, affectedDocuments:userDoc) {
        console.log(`Added ${points} points to ${user}.`);
        for (let i = 0; i < users.length; i++) {
            if (user == users[i].userName) {
                users[i].points = users[i].points + points
                globalThis.editUserTable(user, affectedDocuments.role, Number(users[i].points))
                break
            }
        }
    })
}

/**
 * Removes the users points
 * @param {string} user The user
 * @param {number} value How many points will be removed
 */
function removePoints(user: userName, value: number): void {
    usersDB.update({ userName: user }, { $inc: { points: -value } }, { returnUpdatedDocs: true }, function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
        console.log("Removing " + value + " points from " + user);
        for (let i = 0; i < users.length; i++) {
            if (user == users[i].userName) {
                if (users[i].points - value < 0) {
                    users[i].points = 0
                } else {
                    users[i].points = affectedDocuments.points;
                    globalThis.editUserTable(user, affectedDocuments.role, affectedDocuments.points);
                }
                break
            }
        }
    });
}

export {addPoints, addQuote, addUser, earnPointsWT, editUser, editUserPoints, findByUserName, getAll, getCurrentUsers, getTopPoints, removePoints, removeUser, removeQuoteByID, updatePath, User}