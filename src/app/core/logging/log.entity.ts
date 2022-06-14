export class Log {
    event: string;
    caused: string
    affected: string[];
    time: Date;
    description: string
    constructor({ event, users, data = null, notification }: any) {
        this.event = event;
        this.caused = users[0];
        this.affected = this.handleUsers(users);
        this.time = new Date();
        this.description = this.determineDescription(event, this.caused, this.affected, data);
        //if (notification) showToast(notification);
    }

    /**
     *
     * @param {array} users
     * @returns
     */
    handleUsers(users: string[]) {
        users.shift();
        return users;
    }

    /**
     * Returns the description with the event details.
     * @param {string} event The event for the log
     * @param {string} caused The user that caused the event
     * @param {array} affected The users that are affected
     * @param {array} data The data about the event. Null if none
     * @returns {string}
     */
    determineDescription(event: string, caused: string, affected: string[], data: any): string {
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
            case "Delete Message":
                return `${this.time}: ${caused} deleted a message from ${affected[0]} with ID ${data.messageID}`
            case "Short Timeout User":
                return `${this.time}: ${caused} performed a short timeout on ${affected[0]}`
            case "Long Timeout User":
                return `${this.time}: ${caused} performed a long timeout on ${affected[0]}`
            case "Ban User":
                return `${this.time}: ${caused} banned ${affected[0]}`
            case "UnBan User":
                return `${this.time}: ${caused} removed a ban on ${affected[0]}`
            case "Add Quote":
                return `${this.time}: ${caused} added a new quote from ${affected}`
            case "New Follower":
                return `${this.time}: ${caused} just followed the stream!`
            default:
                return "No event was sent to the Log Handler."
        }
    }
}