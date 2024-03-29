// Holds functions for actions


/**
 * The list of all the Glimboi variables and user created ones (while active)
 */
let listofvariables: (string | CustomUserVaribles)[] = [
    "$target", // The word after the command. ex !so Mytho (Mytho would be the target)
    "$user", //The user who activated the command.
    "$time", // The current time.
    "$watchtime", // How much watch time a user has.
    "$rank", // The user's rank.
    "$cmdcount", // The amount of times a command has been used.
    "$game", // The subcategory the streamer is in
    "$advice", // Random advice. View API.js
    "$dadjoke", // Random dad joke. View API.js
    "$discord", // discord invite URL
    "$guilded", // guilded invite URL
    "$instagram", // instagram URL
    "$youtube", // youtube channel URL
    "$twitter", // twitter profile URL
    "$catfact", // Random cat fact
    "$dogfact", // Random dog fact
    "$uptime", // How long the user has been streaming.
    "$message"
 // Custom variables
]

/**
 * Searches and replaces variables with their values
 * @param {object} data A bunch of revalant data
 * @param {string} data.message message
 */
async function searchForVariables(data: {message:string, activation?:string, user?:string}) {
    for (let i = 0; i < listofvariables.length; i++) {// @ts-ignore
        let varIndex = data.message.indexOf(listofvariables[i].name || listofvariables[i])
        if (varIndex !== -1) {
            let replacement = await replaceVariable({variable: listofvariables[i], activation: data.activation, user: data.user}); // @ts-ignore
            data.message = data.message.replaceAll(listofvariables[i].name || listofvariables[i], replacement);
        }
    }
    return data.message
}

/**
 *
 * @param variable The command variable ex $user, $dadjoke, $target,etc
 * @param activation What activated the command. so mytho and everything after it
 * @param user The user who activated the command
 */
async function replaceVariable({ variable, activation, user }) {
    //Checks the variablelist and replaces it with its new value.
    switch (variable) {
        case "$target": //The first word after the command
            return activation.split(" ")[1];
        case "$user": //The user who said the message.
            return user.username;
        case "$time": //Current time
            return new Date().toTimeString();
        case "$watchtime":
            let watchTime = await UserHandle.findByUserName(user.username);
            if (watchTime == "ADDUSER") {
                let newUser = await UserHandle.addUser(user.username, false);
                if (typeof newUser == "object") {
                    return newUser.watchTime;
                } else {
                    return "No user found."
                }
            } else {
                return watchTime.watchTime
            }
        case "$rank":
            let userExists = await UserHandle.findByUserName(user.username);
            if (typeof userExists == "object") {
                return userExists.role;
            } else {
                let newUser = await UserHandle.addUser(user.username, false);
                if (typeof newUser == "object") {
                    return newUser.role;
                } else {
                    return "$NOTFOUND"
                }
            }
        case "$cmdcount":
            let count = await CommandHandle.findCommand(activation.split(" ")[0])
            return count.uses
        case "$game":
            let game = await ApiHandle.getSubCategory(ApiHandle.getStreamerName());
            console.log(game);
            return game
        case "$advice":
            let AdviceModule:typeof import("../API/webhooks/advice") = require(`${appData[0]}/modules/API/webhooks/advice.js`);
            return await AdviceModule.getAdvice();
        case "$dadjoke":
            let JokeModule:typeof import("../API/webhooks/dadJoke") = require(`${appData[0]}/modules/API/webhooks/dadJoke.js`);
            return await JokeModule.getDadJoke();
        case "$discord":
            let discord = await ApiHandle.getSocials("socialDiscord", ApiHandle.getStreamerName()).catch(reason => discord = 'Discord Error');
            return "https://discord.gg/" + discord
        case "$guilded":
            let guilded = await ApiHandle.getSocials("socialGuilded", ApiHandle.getStreamerName()).catch(reason => guilded = 'Guilded Error');
            return "https://guilded.gg/" + guilded
        case "$instagram":
            let instagram = await ApiHandle.getSocials("socialInstagram", ApiHandle.getStreamerName()).catch(reason => instagram = 'Instagram Error');
            return "https://instagram.com/" + instagram
        case "$youtube":
            let youtube = await ApiHandle.getSocials("socialYoutube", ApiHandle.getStreamerName()).catch(reason => youtube = 'Youtube Error');
            return "https://youtube.com/" + youtube
        case "$twitter":
            let twitter = await ApiHandle.getSocials("twitter", ApiHandle.getStreamerName()).catch(reason => twitter = 'Twitter Error');
            return "https://twitter.com/" + twitter
        case "$catfact":
            let CatModule:typeof import("../API/webhooks/animal") = require(`${appData[0]}/modules/API/webhooks/animal.js`);
            let catFact = await CatModule.randomAnimalFact("cat");
            return catFact;
        case "$dogfact":
            let DogModule:typeof import("../API/webhooks/animal") = require(`${appData[0]}/modules/API/webhooks/animal.js`);
            let dogFact = await DogModule.randomAnimalFact("dog");
            return dogFact;
        case "$uptime":
            let uptime = await ApiHandle.getStats();
            if (uptime) {
                return uptime.streamTimeSeconds / 60;
            }
            return NaN
        case "$message":
            if (activation.split(" ").length > 1) {
                activation = activation.substr(activation.indexOf(" ") + 1);
                return activation
            } else {
                return null
            }
        default: return replaceCustomVariable(variable);
    }
}

/**
 * Replaces a custom variable with its data
 * @param {CustomUserVaribles} variable The variable to replace
 * @returns
 */
function replaceCustomVariable(variable: CustomUserVaribles) {
    for (let i = 0; i < listofvariables.length; i++) {// @ts-ignore
        if (variable.name == listofvariables[i].name) {// @ts-ignore
            return listofvariables[i].data
        }
    }
}

/**
 * Adds a custom variable
 * @param variable {CustomUserVaribles}
 */
function addVariable(variable: CustomUserVaribles) {
    listofvariables.push(variable)
}

/**
 * Returns all of the glimboi and command variables (if active)
 * @returns
 */
function getv() {
    return listofvariables
}

/**
 * Removes the custom varaibles added froma command
 * @param variables
 */
function removeVariables(variables:string[] = []) {
    for (let i = 0; i < listofvariables.length; i++) {// @ts-ignore
        if (listofvariables[i].name !== undefined) {
            variables.forEach(element => {// @ts-ignore
                if (element == listofvariables[i].name) {
                    listofvariables.splice(i, 1);
                }
            });
        }
    }
}

export {addVariable, removeVariables, searchForVariables, getv}