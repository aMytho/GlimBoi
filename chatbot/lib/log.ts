// This file handles the glimboi logging system. This is separate from chat logging (message oonly)

let loggingDB:Nedb;
let logPath = "./";

/**
 * Logging Event. Any non message event
 */
class LoggingEvent implements LogType {
    event: string;
    caused: string
    affected: string[];
    time: Date;
    description: string
    constructor({event, users, data = null}:LogConstructor) {
        this.event = event;
        this.caused = users[0];
        this.affected = this.handleUsers(users);
        this.time = new Date();
        this.description = this.determineDescription(event, this.caused, this.affected, data);
    }

    /**
     *
     * @param {array} users
     * @returns
     */
    handleUsers(users:string[]) {
        let userData = [];
        users.splice(0, 1);
        for (let i = 0; i < users.length; i++) {
            userData.push(users[i])
        }
        return userData
    }

    /**
     * Returns the description with the event details.
     * @param {string} event The event for the log
     * @param {string} caused The user that caused the event
     * @param {array} affected The users that are affected
     * @param {array} data The data about the event. Null if none
     * @returns {string}
     */
    determineDescription(event:string, caused:string, affected:string[], data:any) {
        switch (event) {
            case "Add User":
                return `${this.time}: ${caused} added ${affected[0]} to the user list.`;
            case "Edit User":
                return `${this.time}: ${caused} edited ${affected[0]}. Rank: ${data[0]}. Points: ${data[1]}.`
            case "Remove User":
                return `${this.time}: ${caused} removed ${affected[0]} from the user list.`
            case "Add Points":
                return `${this.time}: ${caused} added ${data[0]} ${data[1]}s to ${affected[0]}`
            case "Edit Points":
                return `${this.time}: ${caused} set ${data[0]} ${data[0]}s to ${affected[0]}`
            case "Remove Points":
                return `${this.time}: ${caused} removed ${data[0]} ${data[0]}s to ${affected[0]}`
            case "Remove User":
                return `${this.time}: ${caused} removed ${affected[0]} from the user list.`
            case "Remove User":
                return `${this.time}: ${caused} removed ${affected[0]} from the user list.`
            case "Remove User":
                return `${this.time}: ${caused} removed ${affected[0]} from the user list.`
            case "Remove User":
                return `${this.time}: ${caused} removed ${affected[0]} from the user list.`
            default:
                return "No event was sent to the Log Handler."
        }
    }
}

/**
 * Updates the path to the DB. The path variable is updated
 */
 function updatePath(path:string) {
    logPath = path
    loggingDB = new Datastore({ filename: `${path}/data/logging.db`, autoload: true });
}


/**
 * Logs an event to the db.
 * @param {object} data The data revelant to the event
 */
function logEvent(data) {
    let newEvent = new LoggingEvent(data)
    console.log(newEvent);
    return
    loggingDB.insert(newEvent, function (err, doc) {
        console.log("Event logged", + newEvent)
  });
}

function getRecentLogs() {
    loggingDB.find({}, function (err: Error | null, doc) {
        console.log("Event logged", + newEvent)
  });
}

function getLogByType(log) {
    loggingDB.find({event: log}, function (err: Error | null, doc) {
        console.log("Event logged", + newEvent)
  });
}

function getLogByID(id:string) {
    loggingDB.find({event: log}, function (err: Error | null, doc) {
        console.log("Event logged", + newEvent)
  });
}

module.exports = {logEvent, LoggingEvent ,updatePath}
