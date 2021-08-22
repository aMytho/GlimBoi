// This file manages the rank system
let rankDB:Nedb; //Controls the Rank DB
let userRank = {rank: "user", canAddCommands: true, canEditCommands: false, canRemoveCommands: false,
canAddPoints: false, canEditPoints: false, canRemovePoints: false, canAddQuotes: true, canEditQuotes: false,
canRemoveQuotes: false, canAddUsers: true, canEditUsers: false, canRemoveUsers: false, canControlMusic: false,
canDeleteMessages: false, canTimeoutUsers: false, canBanUsers: false, canUnBanUsers: false, modImmunity: false,
canStartEvents: true};
let modRank = {rank: "Mod", canAddCommands: true, canEditCommands: true, canRemoveCommands: true,
canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: false,
canRemoveQuotes: true, canAddUsers: true, canEditUsers: false, canRemoveUsers: true, canControlMusic: true,
canDeleteMessages: true, canTimeoutUsers: false, canBanUsers: false, canUnBanUsers: false, modImmunity: false,
canStartEvents: true};
let streamerRank = {rank: "Streamer", canAddCommands: true, canEditCommands: true, canRemoveCommands: true,
canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: true,
canRemoveQuotes: true, canAddUsers: true, canEditUsers: true, canRemoveUsers: true, canControlMusic: true,
canDeleteMessages: true, canTimeoutUsers: false, canBanUsers: true, canUnBanUsers: true, modImmunity: true,
canStartEvents: true};


/**
 * A new Rank
 */
class Rank implements RankType {
    rank:rankName
    canAddCommands: boolean;
    canEditCommands: boolean;
    canRemoveCommands: boolean;
    canAddPoints: boolean;
    canEditPoints: boolean;
    canRemovePoints: boolean;
    canAddUsers: boolean;
    canEditUsers: boolean;
    canRemoveUsers: boolean;
    canAddQuotes: boolean;
    canEditQuotes: boolean;
    canRemoveQuotes: boolean;
    canControlMusic: boolean;
    canDeleteMessages: boolean;
    canTimeoutUsers: boolean;
    canBanUsers: boolean;
    canUnBanUsers: boolean;
    modImmunity: boolean;
    canStartEvents: boolean;
    constructor(rank:rankName) {
        this.rank = rank;
        this.canAddCommands = false;
        this.canEditCommands = false;
        this.canRemoveCommands = false;
        this.canAddPoints = false;
        this.canEditPoints = false;
        this.canRemovePoints = false;
        this.canAddUsers = false;
        this.canEditUsers = false;
        this.canRemoveUsers = false;
        this.canAddQuotes = false;
        this.canEditQuotes = false;
        this.canRemoveQuotes = false;
        this.canControlMusic = false;
        this.canDeleteMessages= false;
        this.canTimeoutUsers = false;
        this.canBanUsers = false;
        this.canUnBanUsers = false;
        this.modImmunity = false;
        this.canStartEvents = false;
    }
}

/**
 * Sends the rank db to the right location.
 * @param {string} path The app data directory
 */
function updatePath(updatedPath:string) {
    rankDB = new Datastore({ filename: `${updatedPath}/data/ranks.db`, autoload: true });
    getAll(true);
}

/**
 * Ran on startup, gets a local copy of all ranks. If none exist the default are created.
 */
function getAll(checkNew?: boolean): Promise<RankType[]> {
    return new Promise(resolve => {
        rankDB.find({}, async function (err: Error | null, docs: RankType[]) {
            if (docs.length !== 0) {
                if (checkNew && await checkRankProperties(docs)) {
                    resolve(await getAll(false));
                } else {
                    resolve(docs);
                }
            } else { // No ranks exist, insert the default ranks
                rankDB.insert([userRank, modRank, streamerRank], function (err, newDocs) {
                    console.log("Created default ranks")
                    resolve(newDocs);
                });
            }
        });
    })
}

function checkRankProperties(docs: RankType[]) {
    return new Promise(resolve => {
        docs.forEach(rank => { // If new properties exist add them to the ranks.
            let isChanged = false;
            for (const key in userRank) {
                if (rank[key] === undefined) {
                    rank[key] = userRank[key];
                    isChanged = true;
                }
            }
            if (isChanged) {
                editRank(rank);
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}

/**
 * Checks if the rank exists and if not, creates it
 * @param {string} rank The rank to be created
 */
function createRank(rank:rankName) {
    return new Promise(async resolve => {
        if (await getRankPerms(rank) == null) {
            console.log("Creating " + rank);
            let rankData = new Rank(rank);
            rankDB.insert([rankData], function (err, newDocs) {
                resolve("RANKADDED");
            });
        } else {
            resolve("RANKEXISTS")
        }
    })
}

/**
 * Removes a user created rank
 * @param {string} rank The rank to be removed
 */
function removeRank(rank: rankName): Promise<"NORANKFOUND" | "RANKREMOVED" | "INVALIDRANK"> {
    return new Promise(resolve => {
        if (rank !== "user" && rank !== "Mod" && rank !== "Streamer") {
            rankDB.remove({ rank: rank }, {}, function (err, numRemoved) {
                console.log("Removed " + numRemoved + " ranks");
                if (numRemoved == 0) {
                    resolve("NORANKFOUND");
                } else {
                    resolve("RANKREMOVED");
                }
            });
        } else {
            resolve("INVALIDRANK"); // We don't delete the base ranks.
        }
    })
}

/**
 * Updates a rank with new data
 * @param {object} rank A rank with updated properties.
 */
function editRank(rank:RankType) {
    rankDB.update({ rank: rank.rank }, { $set: rank}, {}, function (err, numReplaced) {
        console.log("Rank settings updated");
    });
}

/**
 * Adds a property to a specific rank
 * @param {string} rank The rank we are adding the property to
 * @param {string} property What property we are adding to the rank
 */
function addRankProperty(rank:rankName, property:rankProperties) {
    rankDB.update({rank: rank}, { $set: { [`${property}`]: false}}, {}, function (err, numReplaced) {
        console.log(property + " was added to" + rank)
    })
}

/**
 * Ensures the user can do the specified action
 * @param {string} user The user who will be tested
 * @param {string} action What the user is attempting to access
 * @param {string} type The type of the action. We use this to determine if we look for boolean, number, string, etc
 */
function rankController(user: userName, action: rankProperties, type: string): Promise<true | false | null> {
    return new Promise(async resolve => {
        let userExists = await UserHandle.findByUserName(user);
        if (userExists !== "ADDUSER") {
            let rankInfo = await getRankPerms(userExists.role);
            if (type == "string") {
                if (rankInfo == null) { // the rank doesn't exist anymore
                    resolve(false);
                } else if (rankInfo[`${action}`] == true) { // they have permission
                    resolve(true);
                } else if (rankInfo[`${action}`] == false) {// they don't have permission
                    resolve(false)
                } else if (rankInfo[`${action}`] == undefined) { // this is a new permission, we deny it and add it to the db.
                    addRankProperty(userExists.role, action);
                    resolve(false);
                }
            } else {
                resolve(false)
            }
        } else {
            resolve(null)
        }
    })
}

/**
 * Gets the permissions of a specific rank
 * @param {string} rank The rank you want info about
 * @returns {object} Object if found, null if not
 */
function getRankPerms(rank: rankName): Promise<RankType | null> {
    return new Promise(resolve => {
        rankDB.findOne({ rank: rank }, {}, function (err, doc: RankType | null) {
            resolve(doc); // Returns the rank, null if not found
        })
    })
}

export {createRank, editRank, getAll, getRankPerms, rankController, removeRank, updatePath}