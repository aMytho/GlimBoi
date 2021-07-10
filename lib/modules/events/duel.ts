// file handles duels

// array containg the users who are in a duel. Each value has two users, a user and their opponent
var duelUsers = [];

// function to add user to duelUsers array
function addUser(user) {
    duelUsers.push(user);
}

// function to remove user from duelUsers array
function removeUser(user) {
    for (var i = 0; i < duelUsers.length; i++) {
        if (duelUsers[i] == user) {
            duelUsers.splice(i, 1);
            break;
        }
    }
}

// pick a random user from the array
function getRandomUser() {
    var random = Math.floor(Math.random() * duelUsers.length);
    return duelUsers[random];
}

// function to check if a user is in a duel
function isInDuel(user) {
    for (var i = 0; i < duelUsers.length; i++) {
        if (duelUsers[i] == user) {
            return true;
        }
    }
    return false;
}


export {}