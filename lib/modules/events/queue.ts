// File handles queue

let usersInQueue: string[] = [];

function addToQueue(user: string) {
    usersInQueue.push(user.toLowerCase());
    ChatMessages.sendMessage(`${user} has joined the queue.`);
    alterUI(user, "add");
}

async function canJoinQueue(user: string, override: boolean): Promise<boolean> {
    // Make sure they are not already in the queue
    if (usersInQueue.indexOf(user) !== -1) {
        ChatMessages.sendMessage(`${user} is already in the queue`);
        return false;
    }
    let userExists = await UserHandle.findByUserName(user);
    if (userExists) {
        if (override) {
            return true;
        } else {
            // Check points and rank restrictions
            if (await Util.compareUserPoints(userExists, CacheStore.get("queuePoints", 100), false)) {
                let queueRank = await RankHandle.getRankPerms(CacheStore.get("queueRank", "Everyone"));
                let userRank = await RankHandle.getRankPerms((userExists as UserType).role);
                if (CacheStore.get("queueRank", "Everyone") == "Everyone") {
                    UserHandle.removePointsAboveZero((userExists as UserType).userName, CacheStore.get("queuePoints", 100));
                    return true;
                }
                if (queueRank && userRank && userRank.rankTier >= queueRank.rankTier) {
                    UserHandle.removePointsAboveZero((userExists as UserType).userName, CacheStore.get("queuePoints", 100));
                    return true;
                }
                ChatMessages.sendMessage(
                    `${user} does not have the minimum rank tier to join the queue. They need to be at least ${queueRank.rankTier}`);
                return false;
            } else {
                ChatMessages.sendMessage(
                    `${user} does not have enough points to join the queue. User: ${(userExists as UserType).points} Queue: ${CacheStore.get("queuePoints", 100)}`);
                return false
            }
        }
    } else {
        let userAdded = await UserHandle.addUser(user, false);
        if (userAdded !== "INVALIDUSER") {
            return await canJoinQueue(user, override);
        }
        return false
    }
}


function getUsersInQueue(): string[] {
    return usersInQueue;
}

function startQueue(user?: string) {
    if (!ChatHandle.isConnected()) {
        return false
    }
    if (EventHandle.isEventActive("queue")) {
        ChatMessages.sendMessage(`A queue is already in progress. !join to join the queue`);
        return false;
    } else {
        EventHandle.addEvent("queue");
        if (user) {
            addToQueue(user);
        }
        ChatMessages.sendMessage(`${user || ApiHandle.getStreamerName()} has started the queue. !join to join the queue`);
        return true;
    }
}

function removeFromQueue(user: string): true | void {
    let index = usersInQueue.indexOf(user);
    if (index !== -1) {
        usersInQueue.splice(index, 1);
        alterUI(user, "remove");
        ChatMessages.sendMessage(`${user} has left the queue.`);
        return true;
    }
}

function progressQueue() {
    let user = usersInQueue.shift();
    if (user) {
        ChatMessages.sendMessage(`${user} has completed the queue.`);
        alterUI(user, "remove");
    }
    if (usersInQueue.length == 0) {
        endQueue();
    }
    return user;
}

function endQueue() {
    EventHandle.removeEvent("queue");
    usersInQueue = [];
    ChatMessages.sendMessage("The queue has been ended.");
    if (currentPage == "events") {
        try {
            resetQueueUI();
        } catch(e) {}
    }
}

function alterUI(user:string, action: "add" | "remove") {
    if (currentPage == "events") {
        try {
            addOrRemoveQueueUserUI(user, action);
        } catch(e) {}
    }
}

export { addToQueue, canJoinQueue, endQueue, getUsersInQueue, progressQueue, removeFromQueue, startQueue };