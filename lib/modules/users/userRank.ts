// This file manages the rank system
var rankDB:Nedb; //Controls the Rank DB
var ranks:RankType[] = [];
var userRank = {rank: "user", canAddCommands: true, canEditCommands: false, canRemoveCommands: false,
canAddPoints: false, canEditPoints: false, canRemovePoints: false, canAddQuotes: true, canEditQuotes: false,
canRemoveQuotes: false, canAddUsers: true, canEditUsers: false, canRemoveUsers: false, canControlMusic: false,
canDeleteMessages: false, canTimeoutUsers: false, canBanUsers: false, canUnBanUsers: false, modImmunity: false};
var modRank = {rank: "Mod", canAddCommands: true, canEditCommands: true, canRemoveCommands: true,
canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: false,
canRemoveQuotes: true, canAddUsers: true, canEditUsers: false, canRemoveUsers: true, canControlMusic: true,
canDeleteMessages: true, canTimeoutUsers: false, canBanUsers: false, canUnBanUsers: false, modImmunity: false};
var streamerRank = {rank: "Streamer", canAddCommands: true, canEditCommands: true, canRemoveCommands: true,
canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: true,
canRemoveQuotes: true, canAddUsers: true, canEditUsers: true, canRemoveUsers: true, canControlMusic: true,
canDeleteMessages: true, canTimeoutUsers: false, canBanUsers: true, canUnBanUsers: true, modImmunity: true};


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
    canBanUsers: boolean
    canUnBanUsers: boolean
    modImmunity: boolean
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
    }
}

/**
 * Sends the rank db to the right location.
 * @param {string} path The app data directory
 */
function updatePath(updatedPath:string) {
    // @ts-ignore
    rankDB = new Datastore({ filename: `${updatedPath}/data/ranks.db`, autoload: true });
    getAll()
}

/**
 * Ran on startup, gets a local copy of all ranks. If none exist the default are created.
 */
function getAll() {
    rankDB.find({}, function (err: Error | null, docs:RankType[]) {
        if (docs.length !== 0) {
            ranks = docs
        } else {
            rankDB.insert([userRank, modRank, streamerRank], function (err, newDocs) {
                ranks = newDocs
            });
        }
    });
}

/**
 * Checks if the rank exists and if not, creates it
 * @param {string} rank The rank to be created
 */
function createRank(rank:rankName) {
    return new Promise(resolve => {
        if (getRankPerms(rank) == null) {
            console.log("Creating " + rank);
            var rankData = new Rank(rank);
            rankDB.insert([rankData], function (err, newDocs) {
                ranks.push(rankData);
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
function removeRank(rank:rankName) {
  // We don't delete the base ranks.
  return new Promise(resolve => {
    if (rank !== "user" && rank !== "Mod" && rank !== "Streamer") {
        for (let i = 0; i < ranks.length; i++) {
          if (ranks[i].rank == rank) {
            ranks.splice(i, 1);
            resolve("RANKREMOVED")
            rankDB.remove({ rank: rank }, {}, function (err, numRemoved) {
              console.log("Removed " + numRemoved + " ranks");
            });
          }
        }
        resolve("NORANKFOUND")
      } else {
        resolve("INVALIDRANK")
      }
  })
}

/**
 * Updates a rank with new data
 * @param {object} rank A rank with updated properties.
 */
function editRank(rank:RankType) {
    for (let i = 0; i < ranks.length; i++) {
        if (rank.rank == ranks[i].rank) {
            ranks[i] = rank
        }
    }
    rankDB.update({ rank: rank.rank }, { $set: {
        canAddCommands: rank.canAddCommands, canEditCommands: rank.canEditCommands,
        canRemoveCommands: rank.canRemoveCommands, canAddPoints: rank.canAddPoints, canEditPoints: rank.canEditPoints,
        canRemovePoints: rank.canRemovePoints, canAddQuotes: rank.canAddQuotes, canEditQuotes: rank.canEditQuotes,
        canRemoveQuotes: rank.canRemoveQuotes, canAddUsers: rank.canAddUsers, canEditUsers: rank.canEditUsers,
        canRemoveUsers: rank.canRemoveUsers, canControlMusic: rank.canControlMusic, canDeleteMessages: rank.canDeleteMessages,
        canTimeoutUsers: rank.canTimeoutUsers, canBanUsers: rank.canBanUsers, canUnBanUsers: rank.canUnBanUsers,
        modImmunity: rank.modImmunity}
    }, {}, function (err, numReplaced) {
        console.log("Rank settings updated");
    });
}

/**
 * Adds a property to a specific rank
 * @param {string} rank The rank we are adding the property to
 * @param {string} property What property we are adding to the rank
 */
function addRankProperty(rank:rankName, property:rankProperties) {
    for (let i = 0; i < ranks.length; i++) {
        if (rank == ranks[i].rank) {
            ranks[i][`${property}`] = false;
        }
    }
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
function rankController(user:userName, action:string, type:string):Promise<true | false | null> {
    return new Promise(resolve => {
        UserHandle.findByUserName(user).then(data => {
            if (data !== "ADDUSER") {
                var rankInfo = getRankPerms(data.role);
                if (type == "string") {
                    if (rankInfo == null) { // the rank doesn't exist anymore
                        resolve(false);
                    } else if (rankInfo[`${action}`] == true) { // they have permission
                        resolve(true);
                    } else if (rankInfo[`${action}`] == false) {// they don't have permission
                        resolve(false)
                    } else if (rankInfo[`${action}`] == undefined) { // this is a new permission, we deny it and add it to the db.
                        // @ts-ignore
                        addRankProperty(data.role, action);
                        resolve(false);
                    }
                } else {
                    resolve(false)
                }
            } else {
                resolve(null)
            }
        })
    })
}

/**
 * Gets the permissions of a specific rank
 * @param {string} rank The rank you want info about
 * @returns {object} Object if found, null if not
 */
function getRankPerms(rank:rankName) {
    for (let i = 0; i < ranks.length; i++) {
        if (rank == ranks[i].rank) {
            return ranks[i];
        }
    }
    return null
}

/**
 * Returns the array of rank data
 * @returns {array}
 */
function getCurrentRanks(): Array<RankType> {
    return ranks
}

export {createRank, editRank, getAll, getCurrentRanks, getRankPerms, rankController, removeRank, updatePath}