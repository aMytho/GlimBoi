//Controls the User DB

import Nedb from "@seald-io/nedb";

let usersDB:Nedb;

/**
 * A GlimBoi user
 * @param {string} userName The username of the user
 * @param {number} ID The user ID of the user (from glimesh.tv)
 */
class User implements UserType {
    userName: string;
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
function addUser(user:string, inModal: boolean, createdBy: string = "Glimboi"): Promise<"INVALIDUSER" | "USEREXISTS" | UserType> {
    return new Promise(done => {
        user = user.toLowerCase();
        usersDB.find({ userName: user }, async function (err:string, docs:docs) {
            if (docs.length == 0) {
                console.log("No user was found with the name " + user);
                let ID = await ApiHandle.getUserID(user);
                if (typeof ID !== "number" || ID == null || typeof ID == "object") {
                    console.log(ID);
                    done("INVALIDUSER");
                } else {
                    let tempUser = new User(user, ID) //makes the user. L I F E !
                    usersDB.insert(tempUser, function (err:Error | null, doc:UserType) {
                        console.log(doc);
                        console.log("User created!");
                        LogHandle.logEvent({ event: "Add User", users: [createdBy, tempUser.userName],
                        notification: `${tempUser.userName} was added to the database.` });
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
 */
function findByUserName(name: string): Promise<UserType | "ADDUSER"> {
    return new Promise(resolve => {
        usersDB.find({ userName: name.toLowerCase() }, function (err: Error | null, docs: UserType[]) {
            // If the user exists return them, otherwise return ADDUSER
            resolve(docs[0] ? docs[0] : "ADDUSER");
        })
    })
}

/**
 * Returns the users sorted requested
 */
function findManyUsers(users: string[]): Promise<UserType[]> {
    return new Promise(resolve => {
        usersDB.find({ userName: { $in: users } }, function (err: Error | null, docs: UserType[]) {
            resolve(docs);
        })
    })
}

/**
 * Returns all users
*/
function getAll(): Promise<UserType[]> {
    return new Promise(resolve => {
        usersDB.find({}, function (err: string, docs: UserType[]) {
            resolve(docs);
        })
    })
}

/**
 * Removes a user
 * @param {string} user The user you are removing.
 * @param {boolean} inModal Was this done from the GUI?
 * @param {string} userWhoRemoves The user who removed the abt to be deleted user.
 */
function removeUser(user: string, inModal: boolean, userWhoRemoves: string = "Glimboi"): Promise<string> {
    user = user.toLowerCase()
    return new Promise(resolve => {
        usersDB.remove({ userName: user }, {}, function (err: Error | null, numRemoved: number) {
            console.log("Removed " + user);
            LogHandle.logEvent({ event: "Remove User", users: [userWhoRemoves, user], notification: `${user} was removed from the database.` });
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
function addQuote(username: string, quoteData: string, onBehalfOf: string = "Glimboi"): Promise<boolean> {
    return new Promise(async resolve => {
        username = username.toLowerCase();
        let userExists = await findByUserName(username);
        if (userExists == "ADDUSER") {
            let newUser = await addUser(username, false, onBehalfOf);
            if (newUser !== "INVALIDUSER") {
                return await addQuote(username, quoteData, onBehalfOf);
            } else {
                resolve(false);
                return
            }
        }
        let newQuote = await QuoteHandle.addQuote(userExists, quoteData, onBehalfOf);
        usersDB.update({ userName: newQuote.quoteName }, { $push: { quotes: { quoteID: newQuote.quoteID, quoteData: newQuote.quoteData, dbID: newQuote.quoteID } } },
            { multi: false, }, function (err: Error | null) {
                console.log(`Quote linked to ${newQuote.quoteName} Quote Complete.`);
                syncQuotes(newQuote.quoteName, "add");
                resolve(true)
            })
    })
}

/**
 * Removes a quote from the users collection and from the quote collection. Attempts to update the user table.
 * @param {Number} id The quote ID (quote id, not database id)
 * @param {string} user The user who the quote belongs to. Lowercase please!
 */
function removeQuoteByID(id: number, user: string): Promise<"NOQUOTEFOUND" | UserType> {
    return new Promise(resolve => {
        user = user.toLowerCase();
        usersDB.find({ $and: [{ userName: user }, { quotes: { $elemMatch: { quoteID: id } } }] }, function (err: Error | null, docs: UserType[]) {
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
                            { returnUpdatedDocs: true }, function (err: Error | null, numAffected: number, affectedDocuments: UserType) {
                                console.log(affectedDocuments);
                                QuoteHandle.removeQuote(id, user);
                                syncQuotes(user, "remove")
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
function getTopPoints(): Promise<UserType[]> {
    return new Promise(resolve => {
        usersDB.find({}).sort({ points: -1 }).exec(function (err: Error | null, docs: UserType[]) {
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
 */
function editUser(userName: string, points: number, role: rankName, watchTime: number, editor: string = "Glimboi"): Promise<UserType> {
    return new Promise(resolve => {
        userName = userName.toLowerCase();
        console.log(userName, role, points);
        usersDB.update({ userName: userName }, { $set: { role: role, points: Number(points) } }, { returnUpdatedDocs: true },
            function (err: Error | null, numReplaced: number, affectedDocuments: UserType) {
                console.log("Edited " + userName);
                console.log(affectedDocuments);
                LogHandle.logEvent({ event: "Edit User", users: [editor, userName],
                data: [role, points, watchTime],
                notification: `${userName} now has rank ${role} with ${points} ${CacheStore.get("pointsName", "Points")}`});
                resolve(affectedDocuments);
            });
    })
}

/**
 * Edits how many points the user has
 * @param {string} userName The user
 * @param {number} points How many points they will have
 */
function editUserPoints(userName: string, points: number): Promise<UserType> {
    return new Promise(resolve => {
        console.log(userName, points)
        usersDB.update({ userName: userName.toLowerCase() }, { $set: { points: Number(points) } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: UserType) {
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
function earnPointsWT(Users: { userName: string }[]): void {
    usersDB.update({ $or: Users }, { $inc: { points: CacheStore.get("earningPoints", 15), watchTime: 15 } },
        { returnUpdatedDocs: true, multi: true }, function (err: Error | null, numReplaced: number, affectedDocuments: UserType[]) {
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
function addPoints(user: string, points: number): void {
    points = Number(points)
    usersDB.update({ userName: user.toLowerCase() }, { $inc: { points: points } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: UserType) {
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
function removePoints(user: string, value: number): void {
    usersDB.update({ userName: user.toLowerCase() }, { $inc: { points: -value } }, { returnUpdatedDocs: true },
        function (err: Error | null, numReplaced: number, affectedDocuments: UserType) {
            console.log("Removing " + value + " points from " + user);
            editUserTable(user, affectedDocuments.role, affectedDocuments.points, affectedDocuments.watchTime);
        })
}

/**
 * Removes points from a user. Does not go below 0.
 * @param user The user
 * @param value How many points will be removed
 */
async function removePointsAboveZero(user:string, value:number) {
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
function countUsers(): Promise<number> {
    return new Promise(resolve => {
        usersDB.count({}, function (err: Error | null, count: number) {
            resolve(count);
        })
    })
}

/**
 * Get the total points in the ecosystem
 */
function getAllPoints() {
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

export {addPoints, addQuote, addUser, countUsers, earnPointsWT, editUser, editUserPoints, findByUserName, findManyUsers,
getAll, getAllPoints, getTopPoints, removePoints, removePointsAboveZero, removeUser, removeQuoteByID, updatePath}