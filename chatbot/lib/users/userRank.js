// This file manages the rank system
var rankDB; //Controls the Rank DB
var ranks = [];
var userRank = {rank: "user", canAddCommands: true, canEditCommands: false, canRemoveCommands: false, canAddPoints: false, canEditPoints: false, canRemovePoints: false};
var modRank = {rank: "mod", canAddCommands: true, canEditCommands: true, canRemoveCommands: true, canAddPoints: true, canEditPoints: true, canRemovePoints: true};
var streamerRank = {rank: "streamer", canAddCommands: true, canEditCommands: true, canRemoveCommands: true, canAddPoints: true, canEditPoints: true, canRemovePoints: true};
/**
 * A new Rank
 */
class Rank {
    constructor(rank) {
        this.rank = rank.toLowerCase();
        this.canAddCommands = false;
        this.canEditCommands = false;
        this.canRemoveCommands = false;
        this.canAddPoints = false;
        this.canEditPoints = false;
        this.canRemovePoints = false;
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
        if (getRankPerms(rank.toLowerCase()) !== null) {
            console.log("Creating " + rank);
            var rankData = new Rank(rank);
            rankDB.insert({ rankData }, function (err, newDocs) {
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
  if (rank !== "user" && rank !== "mod" && rank !== "streamer") {
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i].rank == rank) {
        ranks.splice(i, 1);
        rankDB.remove({ rank: rank }, {}, function (err, numRemoved) {
          console.log("Removed " + numRemoved + "ranks");
        });
      }
    }
  }
}


/**
 * Ensures the user can do the specified action
 * @param {string} currentRank The current rank of the user
 * @param {string} action What the user is attempting to access
 * @param {string} type The type of the action. We use this to determine if we look for boolean,number,string,etc
 */
function rankController(currentRank, action, type) {
    getRankPerms(currentRank).then(data => {
        if (data !== null && data[`${action}`] == true) {
            return true
        }
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

module.exports = {createRank, getAll, getCurrentRanks, rankController, removeRank, updatePath}