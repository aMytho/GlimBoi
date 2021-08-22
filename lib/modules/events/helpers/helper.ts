// file helps events with various helper functions

async function compareUserPoints(user:string | UserType, points: number, addUser: boolean) {
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

// check if an array has a duplicated element
function hasDuplicate(arr: any[], remove: boolean) {
    if (remove) {
        return arr.filter((elem, index, self) => self.indexOf(elem) !== index).length > 0;
    } else {
        return (new Set(arr)).size !== arr.length;
    }
}


export {
    compareUserPoints,
    hasDuplicate
}