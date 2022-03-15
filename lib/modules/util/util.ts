
/**
 * Checks if a rank exists and returns if it does
 * @param rank The rank to search for
 */
async function validateRank(rank:string): Promise<RankType | false> {
    let rankExists = await RankHandle.getRankPerms(rank);
    return rankExists || false
}

/**
 * Checks to see if both ranks exist and if the user(rank1) has a higher rank tier than rank2
 * @param rank1 The rank of the user
 * @param rank2 The rank to check against
 * @param message The message to send if the user does not have the correct rank
 */
async function compareRanks(rank1:string, rank2:string, message?:string): Promise<boolean> {
    let [rank1Exists, rank2Exists] = await Promise.all([validateRank(rank1), validateRank(rank2)]);
    if (!rank1Exists || !rank2Exists) {
        ChatMessages.filterMessage(message, "glimboi");
        return false
    }
    let passedRankTest = rank1Exists.rankTier > rank2Exists.rankTier;
    if (!passedRankTest) {
        ChatMessages.filterMessage(message, "glimboi");
    }
    return passedRankTest
}

/**
 * Checks if a group of users exists and optionally add them.
 * @param users The users to check
 * @param add Whether to add the user if they are not in the list
 */
async function checkUsers(users: string[], add: boolean): Promise<boolean | UserType[]> {
    let userDoesntExist = false;
    let usersData:UserType[] = [];
    for await (const user of users) {
        let userExists = await UserHandle.findByUserName(user);
        if (userExists == "ADDUSER") {
            if (add) {
                let userAdded = await UserHandle.addUser(user, false);
                if (userAdded == "INVALIDUSER") {
                    userDoesntExist = true;
                    break;
                } else {
                    usersData.push(userAdded as UserType);
                }
            } else {
                userDoesntExist = true;
            }
        } else {
            usersData.push(userExists);
        }
    }
    return userDoesntExist || usersData;
}


async function compareUserPoints(user:string | UserType, points: number, addUser: boolean): Promise<boolean> {
    if (typeof user === 'string') {
        if (addUser) {
            user = await UserHandle.addUser(user, false, user);
            if (typeof user === 'string') {
                return false;
            } else {
                return await compareUserPoints(user, points, false);
            }
        }
        return false
    } else {
        return user.points >= points
    }
}

function isEventEnabled(event: eventName, message?:string): boolean {
    let status = EventHandle.isEventEnabled(event);
    if (!status) {
        ChatMessages.filterMessage(message, "glimboi");
    }
    return status;
}

export { validateRank, compareRanks, checkUsers, compareUserPoints, isEventEnabled}