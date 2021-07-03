// A files that handles stats from chat and views, subs, and followers

var stats: NodeJS.Timeout; // Queries for updated stats every 15 minutes
var checkForUsers: NodeJS.Timeout; // An interval that checks to see who has been active in chat
var currentUsers:userName[] = [] // Array of current users.
var recentUserMessages = 0; //a count of user messages to compare against repeatable bot messages
/**
 * An interval that queries for channel stats (viewcount, followers, and new subs)
 */
function startChannelStats() {
    stats = setInterval(() => {
        ApiHandle.getStats().then(data => {
            if (data == null) { // They are not live or the channel doesn't exist.
                console.log("The user is not live or there was an error getting stats.")
            } else { // Sets the info from the request next to the icons on the chat page.
                // @ts-ignore
                if (data.channel.stream.countViewers !== undefined && data.channel.stream.countViewers !== null) {
                    // @ts-ignore
                    document.getElementById("fasUsers")!.innerHTML = `<span><i class="fas fa-users"></i></span> ${data.channel.stream.countViewers}`
                }
                // @ts-ignore
                if (data.followers.length !== undefined && data.followers.length !== null) {
                    // @ts-ignore
                    document.getElementById("fasHeart")!.innerHTML = `<span><i class="fas fa-heart"></i></span> ${data.followers.length}`
                }
                // @ts-ignore
                if (data.channel.stream.newSubscribers !== undefined && data.channel.stream.newSubscribers !== null) {
                    // @ts-ignore
                    document.getElementById("fasStar")!.innerHTML = `<span><i class="fas fa-star"></i></span> ${data.channel.stream.newSubscribers}`
                }
            }
        })
    }, 900000);
}

/**
 * Checks for the amount of users and distributes points to them. Adds any new users
 */
function botToViewerRatio() {
    // Checks for new users
    checkForUsers = setInterval(() => {
        console.log("Searching for new users and applying points to them.");
        var currentUsersFiltered:any = [...new Set(currentUsers)];
        currentUsers = [];
        console.log(currentUsersFiltered);
        if (currentUsersFiltered.length == 0) {
            console.log("No users in chat. No points will be sent out.")
        } else {
            (async function() {
                for (let i = 0; i < currentUsersFiltered.length; i++) {
                    await UserHandle.addUser(currentUsersFiltered[i], false);
                    currentUsersFiltered[i] = {userName: currentUsersFiltered[i].toLowerCase()}
                }
            })().then(data => {
                console.log(currentUsersFiltered)
                UserHandle.earnPointsWT(currentUsersFiltered);
            })
        }
    }, 900000);
}

/**
 * Returns the amount of recent user messages
 * @returns {Number} The amount of recent user messages
 */
function getUserMessageCount() {
    return recentUserMessages
}

/**
 * Increases the amount of user messages by one
 */
function increaseUserMessageCounter() {
    recentUserMessages++
}

/**
 * Resets the amount of user messages
 */
function resetUserMessageCounter() {
    recentUserMessages = 0
}

/**
 * Adds a user to the array of current users
 * @param {string} user
 */
function addCurrentUser(user:userName) {
    currentUsers.push(user.toLowerCase())
}

/**
 * Loads the chat ststs. Starts all stat intervals (views,follows,subs, points/watchtime)
 */
function loadChatStats() {
    startChannelStats();
    botToViewerRatio();
}

/**
 * Stops all the interval related to chat stats
 */
function stopChatStats() {
    clearInterval(stats);
    clearInterval(checkForUsers);
}

export {addCurrentUser, getUserMessageCount, increaseUserMessageCounter, loadChatStats, resetUserMessageCounter, stopChatStats}