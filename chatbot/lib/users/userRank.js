// This file manages the rank system
var rankDB; //Controls the Rank DB
var ranks = [];
var userRank = {rank: "user", canAddCommands: true, canEditCommands: false, canRemoveCommands: false, canAddPoints: false, canEditPoints: false, canRemovePoints: false, canAddQuotes: true, canEditQuotes: false, canRemoveQuotes: false, canAddUsers: true, canEditUsers: false, canRemoveUsers: false};
var modRank = {rank: "Mod", canAddCommands: true, canEditCommands: true, canRemoveCommands: true, canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: false, canRemoveQuotes: true, canAddUsers: true, canEditUsers: false, canRemoveUsers: true};
var streamerRank = {rank: "Streamer", canAddCommands: true, canEditCommands: true, canRemoveCommands: true, canAddPoints: true, canEditPoints: true, canRemovePoints: true, canAddQuotes: true, canEditQuotes: true, canRemoveQuotes: true, canAddUsers: true, canEditUsers: true, canRemoveUsers: true};

/**
 * A new Rank
 */
class Rank {
    constructor(rank) {
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
    }
}

/**
 * Sends the rank db to the right location.
 * @param {string} path The app data directory
 */
function updatePath(path) {
    rankDB = new Datastore({ filename: `${path}/data/ranks.db`, autoload: true });
    getAll()
}

/**
 * Ran on startup, gets a local copy of all ranks. If none exist the default are created.
 */
function getAll() {
    rankDB.find({}, function (err, docs) {
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
function createRank(rank) {
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
function removeRank(rank) {
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

function editRank(rank) {
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
        canRemoveUsers: rank.canRemoveUsers}
    }, {}, function (err, numReplaced) {
        console.log("Rank settings updated");
    });
}

/**
 * Ensures the user can do the specified action
 * @param {string} user The user who will be tested
 * @param {string} action What the user is attempting to access
 * @param {string} type The type of the action. We use this to determine if we look for boolean, number, string, etc
 */
function rankController(user, action, type) {
    return new Promise(resolve => {
        UserHandle.findByUserName(user).then(data => {
            if (data !== "ADDUSER") {
                var rankInfo = getRankPerms(data.role);
                if (type == "string") {
                    if (rankInfo !== null && rankInfo[`${action}`] == true) {
                        resolve(true)
                    } else {
                        resolve(false)
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
function getRankPerms(rank) {
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
function getCurrentRanks() {
    return ranks
}

module.exports = {createRank, editRank, getAll, getCurrentRanks, getRankPerms, rankController, removeRank, updatePath}