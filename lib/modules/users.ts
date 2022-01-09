//Controls the User DB

let usersDB:Nedb;

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
        this.points = Number(CacheStore.get("startingPoints", 0));
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
        user = user.toLowerCase();
        usersDB.find({ userName: user }, async function (err:string, docs:docs) {
            if (docs.length == 0) {
                console.log("No user was found with the name " + user);
                let ID = await ApiHandle.getUserID(user)
                if (typeof ID !== "number" || ID == null || typeof ID == "object") {
                    console.log(ID);
                    done("INVALIDUSER")
                } else {
                    let tempUser = new User(user, ID) //makes the user. L I F E !
                    usersDB.insert(tempUser, function (err:Error | null, doc:UserType) {
                        console.log(doc);
                        console.log("User created!");
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
 * Updates the path to the DB.
 */
function updatePath(env: string) {
    usersDB = new Datastore({ filename: `${env}/data/users.db`, autoload: true });
}

  /**
 * Finds a user by their username.
 * @returns If successful returns the user.
 * @returns If the user does not exist returns ADDUSER
 * @todo Find by ID instead.
 */
async function findByUserName(name: string): Promise<UserType | "ADDUSER"> {
    return new Promise(resolve => {
        usersDB.find({ userName: name.toLowerCase() }, function (err: Error | null, docs: userDoc[]) {
            // If the user exists return them, otherwise return ADDUSER
            resolve(docs[0] ? docs[0] : "ADDUSER");
        })
    })
}

/**
 * @returns All the users in the DB. Sent as an array
 */
async function getAll(): Promise<userDoc[]> {
    return new Promise(resolve => {
        usersDB.find({}, function (err: string, docs: userDoc[]) {
            resolve(docs)
        })
    })
}

/**
 * Removes a user
 * @param {string} user The user you are removing.
 * @param {boolean} inModal Was this done from the GUI?
 * @param {string} userWhoRemoves The user who removed the abt to be deleted user.
 * @returns {array} The user that was removed
 */
async function removeUser(user: string, inModal: boolean, userWhoRemoves: string = "Glimboi"): Promise<userName> {
    user = user.toLowerCase()
    return new Promise(resolve => {
        usersDB.remove({ userName: user }, {}, function (err: Error | null, numRemoved: number) {
            console.log("Removed " + user);
            LogHandle.logEvent({ event: "Remove User", users: [userWhoRemoves, user] });
            if (inModal == false) {
                syncUsers(user, "remove")
            }
            QuoteHandle.removeAllQuotes(user);
            resolve(user);
        });
    })
}

/**
 * Adds a quote.
 * @param {string} quote
 * @param {number} id
 */
async function addQuote(quote: QuoteType, id: number): Promise<"USERQUOTEADDED"> {
    return new Promise(resolve => {
        quote.quoteName = quote.quoteName.toLowerCase()
        usersDB.update({ userName: quote.quoteName }, { $push: { quotes: { quoteID: quote.quoteID, quoteData: quote.quoteData, dbID: id } } },
            { multi: false, }, function (err: Error | null) {
                console.log("Quote linked to " + quote.quoteName + ". Quote Complete.");
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
async function removeQuoteByID(id: number, user: string): Promise<"NOQUOTEFOUND" | userDoc> {
    return new Promise(resolve => {
        user = user.toLowerCase();
        usersDB.find({ $and: [{ userName: user }, { quotes: { $elemMatch: { quoteID: id } } }] }, function (err: Error | null, docs: userDoc[]) {
            console.log(docs);
            if (docs.length < 1) {
                resolve("NOQUOTEFOUND")
                return;
            } else {
                for (let index = 0; index < docs[0].quotes.length; index++) {
                    if (docs[0].quotes[index].quoteID == id) {
                        console.log("Found the quote in the user DB");
                        docs[0].quotes.splice(index, 1)
                        usersDB.update({ $and: [{ userName: user }, { quotes: { $elemMatch: { quoteID: id } } }] },{ $set: { quotes: docs[0].quotes } },
                            { returnUpdatedDocs: true }, function (err: Error | null, numAffected: number, affectedDocuments: userDoc) {
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
async function getTopPoints(): Promise<userDoc[]> {
    return new Promise(resolve => {
        usersDB.find({}).sort({ points: -1 }).exec(function (err: Error | null, docs: userDoc[]) {
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
async function editUser(userName: string, role: rankName, points: number, editor: string = "Glimboi"): Promise<userDoc> {
    return new Promise(resolve => {
        userName = userName.toLowerCase();
        console.log(userName, role, points);
        usersDB.update({ userName: userName }, { $set: { role: role, points: Number(points) } }, { returnUpdatedDocs: true },
            function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
                console.log("Edited " + userName);
                console.log(affectedDocuments);
                LogHandle.logEvent({ event: "Edit User", users: [editor, userName], data: [role, points] });
                resolve(affectedDocuments);
            });
    })
}

function editUserAll(user: userName, points, role: rankName, watchTime: number) {
    return new Promise(resolve => {
        usersDB.update({ userName: user.toLowerCase() }, { $set: { role: role, points: points, watchTime: watchTime } }, { returnUpdatedDocs: true },
            function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
                console.log("Edited " + user);
                console.log(affectedDocuments);
                LogHandle.logEvent({ event: "Edit User", users: ["Glimboi", user], data: [role, points, watchTime] });
                editUserTable(user, role, points,   watchTime)
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
async function editUserPoints(userName: string, points: number): Promise<userDoc> {
    return new Promise(resolve => {
        console.log(userName, points)
        usersDB.update({ userName: userName.toLowerCase() }, { $set: { points: Number(points) } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
            console.log("Edited " + userName);
            console.log(affectedDocuments);
            editUserTable(userName, affectedDocuments.role, Number(points), Number(affectedDocuments.watchTime));
            resolve(affectedDocuments);
        });
    })
}

/**
 * Adds points and watch time to the users who are active
 * @param {Array} Users
 */
function earnPointsWT(Users: { userName: userName }[]): void {
    usersDB.update({ $or: Users }, { $inc: { points: CacheStore.get("earningPoints", 15), watchTime: 15 } },
        { returnUpdatedDocs: true, multi: true }, function (err: Error | null, numReplaced: number, affectedDocuments: userDoc[]) {
            console.log("Adding " + CacheStore.get("earningPoints", 15) + " points to " + numReplaced + " users.");
            affectedDocuments.forEach(function (item: UserType, index: number) {
                editUserTable(item.userName, item.role, item.points, item.watchTime);
            });
        });
}

/**
 * Adds some points to a user
 * @param {string} user The user who will be getting points
 * @param {number} points The amount of points to add
 */
function addPoints(user: userName, points: number): void {
    points = Number(points)
    usersDB.update({ userName: user.toLowerCase() }, { $inc: { points: points } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
            console.log(affectedDocuments);
            console.log(`Added ${points} points to ${user}.`);
            editUserTable(user, affectedDocuments.role, Number(affectedDocuments.points), Number(affectedDocuments.watchTime));
        })
}

/**
 * Removes the users points
 * @param {string} user The user
 * @param {number} value How many points will be removed
 */
function removePoints(user: userName, value: number): void {
    usersDB.update({ userName: user.toLowerCase() }, { $inc: { points: -value } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: userDoc) {
            console.log("Removing " + value + " points from " + user);
            editUserTable(user, affectedDocuments.role, affectedDocuments.points, affectedDocuments.watchTime);
        })
}

/**
 * Removes points from a user. Does not go below 0.
 * @param user The user
 * @param value How many points will be removed
 */
async function removePointsAboveZero(user:userName, value:number) {
    value = Math.abs(value);
    let userExists = await findByUserName(user);
    if (userExists !== "ADDUSER") {
        if (userExists.points - value >= 0) {
            removePoints(user, value);
        }
    }
}

/**
 * Counts the number of users
 */
async function countUsers(): Promise<number> {
    return new Promise(resolve => {
        usersDB.count({}, function (err: Error | null, count: number) {
            resolve(count);
        })
    })
}

/**
 * Get the total points in the ecosystem
 */
async function getAllPoints() {
    return new Promise(resolve => {
        usersDB.find({}, { points: 1, _id: 0}, function (err, docs) {
            let points = 0;
            docs.forEach(function (doc) {
                points += doc.points;
            });
            resolve(points)
        });
    })
}

export {addPoints, addQuote, addUser, countUsers, earnPointsWT, editUser, editUserAll, editUserPoints, findByUserName,
getAll, getAllPoints, getTopPoints, removePoints, removePointsAboveZero, removeUser, removeQuoteByID, updatePath}