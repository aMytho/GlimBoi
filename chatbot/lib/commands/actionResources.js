// Holds functions for actions

let listofvariables = [
    "$target", // The word after the command. ex !so Mytho (Mytho would be the target)
    "$user", //The user who activated the command.
    "$time", // The current time.
    "$watchtime", // unused.
    "$cmdcount", // The amount of times a command has been used.
    "$game", // unused
    "$advice", // Random advice. View API.js
    "$dadjoke", // Random dad joke. View API.js
    "$discord", // discord invite URL
    "$guilded", // guilded invite URL
    "$instagram", // instagram URL
    "$youtube", // youtube channel URL
    "$twitter", // twitter profile URL
    "$catfact", // Random cat fact
    "$dogfact" // Random dog fact
];

/**
 * Searches and replaces variables with their values
 * @param {object} data A bunch of revalant data
 * @param {string} data.message message
 */
async function searchForVariables(data) {
    for (let i = 0; i < listofvariables.length; i++) {
        let varIndex = data.message.indexOf(listofvariables[i].name || listofvariables[i])
        if (varIndex !== -1) {
            let replacement = await replaceVariable({variable: listofvariables[i], activation: data.activation, user: data.user});
            data.message = data.message.replaceAll(listofvariables[i].name || listofvariables[i], replacement);
        }
    }
    return data.message
}

/**
 *
 * @param {string} variable The command variable ex $user, $dadjoke, $target,etc
 * @param {string} activation What activated the command
 * @param {string} user The user who activated the command
 */
 async function replaceVariable({variable, activation, user}) {
    //Checks the variablelist and replaces it with its new value.
    switch (variable) {
      case "$target": //The first word after the command
            return activation.split(" ")[1];
        break;
      case "$user": //The user who said the message.
           return user.username;
        break;
      case "$time": //Current time
            return new Date().toTimeString();
        break;
      case "$watchtime":
            let watchTime = await UserHandle.findByUserName(user.username)
            if (watchTime == "ADDUSER") {
                let newUser = await UserHandle.addUser(user.username, false);
                if (newUser !== "INVALIDUSER") {
                  return newUser.watchTime;
                } else {
                    return "No user found."
                }
            } else {
                return watchTime.watchTime
            }
        break;
      case "$cmdcount":
            let count = await findCommand(arguements[0])
            return count.uses
        break;
      case "$game":
            //user = await ApiHandle.getUserID(user.username)
            //variableList[5] = user
            return null
        break;
      case "$advice":
            let advice = await ApiHandle.getAdvice().catch(reason => advice = 'Advice Error');
            return advice
        break;
      case "$dadjoke":
            let joke = await ApiHandle.getDadJoke().catch(reason => joke = 'Joke Error');
            return joke
        break;
      case "$discord":
            let discord = await ApiHandle.getSocials("socialDiscord", ApiHandle.getStreamerName()).catch(reason => discord = 'Discord Error');
            return "https://discord.gg/" + discord
        break;
      case "$guilded":
            let guilded = await ApiHandle.getSocials("socialGuilded", ApiHandle.getStreamerName()).catch(reason => guilded = 'Guilded Error');
            return "https://guilded.gg/" + guilded
        break;
      case "$instagram":
            let instagram = await ApiHandle.getSocials("socialInstagram", ApiHandle.getStreamerName()).catch(reason => instagram = 'Instagram Error');
            return "https://instagram.com/" + instagram
        break;
      case "$youtube":
            let youtube = await ApiHandle.getSocials("socialYoutube", ApiHandle.getStreamerName()).catch(reason => youtube = 'Youtube Error');
            return "https://youtube.com/" + youtube
        break;
      case "$twitter":
            let twitter = await ApiHandle.getSocials("twitter", ApiHandle.getStreamerName()).catch(reason => twitter = 'Twitter Error');
            return "https://twitter.com/" + twitter
        break;
      case "$catfact":
          let catFact = await ApiHandle.randomAnimalFact("cat");
          return catFact
      break;
      case "$dogfact":
          let dogFact = await ApiHandle.randomAnimalFact("dog");
          return dogFact
      break;
      default: return replaceCustomVariable(variable);
        break;
    }
}

function replaceCustomVariable(variable) {
    for (let i = 0; i < listofvariables.length; i++) {
        if (variable.name == listofvariables[i].name) {
            return listofvariables[i].data
        }
    }
}


function addVariable(variable) {
    listofvariables.push(variable)
}

function getv () {
    return listofvariables
}

function removeVariables(variables = []) {
    for (let i = 0; i < listofvariables.length; i++) {
        if (listofvariables[i].name !== undefined) {
            variables.forEach(element => {
                console.log(element, listofvariables[i])
                if (element == listofvariables[i].name) {
                    listofvariables.splice(i, 1);
                }
            });
        }
    }
}

/**
 * Requests data from an API
 * @param {string} url The API URL
 * @param {array} headers An array of headers to send with the request
 * @param {string} mode "GET" or "POST"
 * @param {string} request POST data if any
 * @param {array} path The path to follow down the JSON tree if any
 * @returns {string} The response from the API
 */
async function ApiRequest({ url, headers, mode, request, path, pathType }) {
    if (!headers || headers == []) {
        headers = {}
    }
    try {
        if (mode == "GET") {
            let response = await fetch(url, { method: "GET", headers: headers }).catch(function (e) {
                console.log(e);
            });
            if (pathType == "text") {
                response = await response.text();
                addVariable({ name: path[0].variable, data: response });
                return
            }
            response = await response.json();
            for (let i = 0; i < path.length; i++) {
                function findVal(object, key) {
                    var value;
                    Object.keys(object).some(function (k) {
                        if (k === key) {
                            value = object[k];
                            return true;
                        }
                        if (object[k] && typeof object[k] === 'object') {
                            value = findVal(object[k], key);
                            return value !== undefined;
                        }
                    });
                    return value;
                }
                addVariable({ name: path[i].variable, data: findVal(response, path[i].data)});
            }
        }
    } catch(e) {
        console.log(e);
        console.log( url, headers, mode, request, path, pathType );
    }
}

module.exports = {addVariable, ApiRequest, removeVariables, searchForVariables, getv}