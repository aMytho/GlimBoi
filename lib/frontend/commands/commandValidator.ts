// handles validation of commands

/**
 * Makes sure that all the settings are valid for the command and displays errors if they are not
 * @param {string} mode Add or Edit
 */
 async function validateSettings(mode: "add" | "edit"):Promise<any> {
    // Declares and obtains all the command settings
    let commandName = (document.getElementById(`${mode}CommandName`) as HTMLInputElement).value.trim().toLowerCase();
    let commandPoints = parseFloat((document.getElementById(`${mode}CommandPoints`) as HTMLInputElement).value);
    let commandUses = parseFloat((document.getElementById(`${mode}CommandUses`) as HTMLInputElement).value);
    let commandCooldown = parseFloat((document.getElementById(`${mode}CommandCooldown`) as HTMLInputElement).value)
    let commandRank = (document.getElementById(`${mode}CommandRank`) as HTMLSelectElement).value;
    let commandRepeat = (document.getElementById(`${mode}CommandRepeat`) as HTMLSelectElement).value;
    let commandDelete = (document.getElementById(`${mode}CommandDelete`) as HTMLSelectElement).value;
    let commandDisabled = (document.getElementById(`${mode}CommandDisabled`) as HTMLSelectElement).value;

    // First we check the command name.
    commandName = commandName.replace(new RegExp("^[!]+"), "").trim(); // Removes the ! if it exists
    // Make sure they actually entered something
    if (commandName.length == 0 || commandName == "!") {
        errorMessageCommandModal("You must enter a command name", document.getElementById(`${mode}CommandName`), mode);
        return;
    } // Check to see if they are adding a command that already exists.
    let commandExists = await CommandHandle.findCommand(commandName);
    if (commandExists !== null && mode !== "edit") {
        console.log("The command " + commandName + " already exists");
        errorMessageCommandModal("The command name already exists", document.getElementById(`${mode}CommandName`), mode)
        return;
    }


    resetMessageCommandModal(document.getElementById(`${mode}CommandName`), mode);

    // Next we check the command points
    if (isNaN(commandPoints) == true) { // Make sure it is a number
        errorMessageCommandModal("Points must be a number", document.getElementById(`${mode}CommandPoints`), mode);
        return
    } else if (Math.sign(commandPoints) == -1) { // Make sure it is positive
        errorMessageCommandModal("Points cannot be negative", document.getElementById(`${mode}CommandPoints`), mode);
        return
    }
    commandPoints = Math.round(commandPoints); // Rounds the number
    resetMessageCommandModal(document.getElementById(`${mode}CommandPoints`), mode);

    // And now we check command uses
    if (isNaN(commandUses) == true) { // Make sure it is a number
        errorMessageCommandModal("Uses must be a number", document.getElementById(`${mode}CommandUses`), mode);
        return
    } else if (Math.sign(commandUses) == -1) { // Make sure it is positive
        errorMessageCommandModal("Cannot be negative", document.getElementById(`${mode}CommandUses`), mode);
        return
    }
    commandUses = Math.round(commandUses); // Rounds the number
    resetMessageCommandModal(document.getElementById(`${mode}CommandUses`), mode);

    // We also test cooldowns
    if (isNaN(commandCooldown) == true) { // Make sure it is a number
        errorMessageCommandModal("Cooldown must be a number", document.getElementById(`${mode}CommandCooldown`), mode);
        return
    } else if (Math.sign(commandCooldown) == -1) { // Make sure it is positive
        errorMessageCommandModal("Cannot be negative", document.getElementById(`${mode}CommandCooldown`), mode);
        return
    }
    resetMessageCommandModal(document.getElementById(`${mode}CommandCooldown`), mode);

    //The rank is a safe value, we don't need to check it.
    //Now we set the repeat switch.
    // @ts-ignore
    if (commandRepeat == "false") { commandRepeat = false } else { commandRepeat = true };
    // @ts-ignore
    if (commandDelete == "false") { commandDelete = false } else { commandDelete = true };

    // Finally we check the disable switch
    // @ts-ignore
    if (commandDisabled == "false") { commandDisabled = false } else { commandDisabled = true };

    // Now we can assume the command is fully safe to add to the db.
    return {commandName: commandName, points: commandPoints, uses: commandUses, cooldown: commandCooldown,
        rank: commandRank, repeat: commandRepeat, shouldDelete: commandDelete, disabled: commandDisabled};
}

/**
 * Makes sure the actions are valid
 * @param {string} mode "add" or "edit" Which mode we are using
 * @returns
 */
async function validateActions(mode) {
    let actionsHTML = document.getElementById(`${mode}CommandList`).children;
    let actionsToBeCreated = []
    if (actionsHTML.length !== 0) {
        for (let i = 0; i < actionsHTML.length; i++) {
            let actionValue = await determineActionAndCheck(actionsHTML[i], mode)
            if (!actionValue) {
                return false
            } else {
                actionsToBeCreated.push(actionValue);
            }
        }
        return actionsToBeCreated
    } else {
        console.log("No actions were created");
        errorMessageCommandModal("No actions were created", null, mode)
        return false
    }
}

/**
 * Makes sure the action is alright
 * @param {HTMLElement} action The action we are checking
 * @param {string} mode Which mode we are in
 * @returns
 */
async function determineActionAndCheck(action, mode:actionMode) {
    switch (action.firstElementChild.firstElementChild.innerText) {
        case "Chat Message":
            try {
                let possibleMessage = strip(action.children[1].firstElementChild.firstElementChild.innerText.trim())
                if (possibleMessage.length == 0) {
                    throw "You must enter a chat message"
                } else if (possibleMessage.length > 255) {
                    throw "The chat message is too long. Must less than 256 characters"
                } else if (possibleMessage.length <= 255) {
                    resetMessageCommandModal(action.firstElementChild, mode)
                    return { type: "ChatMessage", message: possibleMessage }
                }
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode)
                return false
            }
        case "API Request (GET)":
            try {
                let url = strip(action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText.trim())
                if (url.length == 0) {
                    throw "You must enter a URL"
                }
                let requestType = action.children[1].firstElementChild.children[1].firstElementChild.value
                let varsToMake = []
                if (requestType == "text") {
                    let possibleTextVar = strip(action.children[1].children[1].firstElementChild.firstElementChild.innerText.trim());
                    if (possibleTextVar.length == 0) {
                        throw "You must enter a variable to pull the request info from."
                    }
                    varsToMake.push({variable: possibleTextVar, data: null});
                } else {
                    let jsonList = action.children[1].children[1].children[2].firstElementChild.firstElementChild.children
                    for (let i = 0; i < jsonList.length; i++) {
                        if (i == 0) {
                            continue
                        }
                        if (strip(jsonList[i].children[1].firstElementChild.innerText.trim()).length <= 0) {
                            throw "A JSON Key is not filled in."
                        }
                        if (strip(jsonList[i].children[2].firstElementChild.innerText.trim()).length <= 0) {
                            throw "A variable name is not filled in."
                        }
                        varsToMake.push({variable: strip(jsonList[i].children[2].firstElementChild.innerText.trim()), data: strip(jsonList[i].children[1].firstElementChild.innerText.trim())})
                    }
                }
                let headersToMake = [];
                let headerList = action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children
                    for (let i = 0; i < headerList.length; i++) {
                        if (i == 0) {
                            continue
                        }
                        let header = strip(headerList[i].children[1].firstElementChild.innerText.trim());
                        let value = strip(headerList[i].children[2].firstElementChild.innerText.trim());
                        if (header && !value) {
                            throw "A value is not filled in."
                        } else if (!header && value) {
                            throw "A header is not filled in."
                        }
                        if (header.length == 0 && value.length == 0) {
                            continue
                        }
                        headersToMake.push([header, value])
                    }
                resetMessageCommandModal(action.firstElementChild, mode);
                return {type: "ApiRequestGet", url: url, headers: headersToMake, returns: varsToMake}
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode)
                return false
            }
        case "Audio":
            try {
                let possibleAudio = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                // TODO, make warning system. Currently the below situation is valid but we should at least warn them or something
                if (possibleAudio == "None") {
                    throw "No audio selection was made."
                }
                if (await MediaHandle.getMediaByName(possibleAudio) !== null) {
                    resetMessageCommandModal(action.firstElementChild, mode)
                    return { type: "Audio", source: possibleAudio };
                } else {
                    throw "The media selected was not found. Ensure it is located in the overlay tab."
                }
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Ban":
            try {
                let possibleBan = action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText.trim()
                if (possibleBan.length == 0) {
                    throw "No target for ban was provided. Enter a name or a variable (ie. $user, $target)"
                }
                return { type: "Ban", target: possibleBan };
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Follow":
            try {
                let followOrUnfollow = action.children[1].children[0].firstElementChild.firstElementChild.value;
                let liveNotifications = action.children[1].children[0].firstElementChild.firstElementChild.value;
                let possibleFollower = action.children[1].children[2].firstElementChild.firstElementChild.innerText.trim();
                liveNotifications = liveNotifications == "enabled" ? true : false;
                followOrUnfollow = followOrUnfollow == "follow" ? true : false;
                if (possibleFollower.length == 0) {
                    throw "No target for follow was provided. Enter a name or a variable (ie. $user, $target)"
                }
                return {type: "Follow", follow: followOrUnfollow, target: possibleFollower, liveNotifications: liveNotifications}
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode)
                return false
            }
        case "ImageGif":
            try {
                let possibleImageGif = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                // TODO, make warning system. Currently the below situation is valid but we should at least warn them or something
                if (possibleImageGif == "None") {
                    throw "No Image or Gif selection was made."
                }
                if (await MediaHandle.getMediaByName(possibleImageGif) !== null) {
                    resetMessageCommandModal(action.firstElementChild, mode)
                    return { type: "ImageGif", source: possibleImageGif };
                } else {
                    throw "The media selected was not found. Ensure it is located in the overlay tab."
                }
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "ObsWebSocket":
            try {
                const obsValaditor: typeof import("../commands/obs/validator") = require(appData[0] + "/frontend/commands/obs/validator.js");
                let obsData = await obsValaditor.checkObsCommand(action.children[1].children[1].id, action.children[1].children[1]);
                return obsData
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Points":
            try {
                let user = strip(action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText);
                let points = strip(action.children[1].children[1].firstElementChild.firstElementChild.innerText);
                if (user.trim().length == 0) {
                    throw "No user was provided. Enter a name or a variable (ie. $user, $target)"
                }
                if (points.trim().length == 0) {
                    throw "No points were provided. Enter a number or a variable (ie. $user, $target)"
                } else if (isNaN(Number(points))) {
                    throw "The points provided is not a number."
                }
                return {type: "Points", target: user.trim(), points: Number(points)}
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Read File":
        try {
            let possibleFile;
            if (mode == "add") {
                possibleFile = action.children[1].firstElementChild.firstElementChild.firstElementChild;
                if (possibleFile.files && possibleFile.files[0]) {
                    resetMessageCommandModal(action.firstElementChild, mode);
                    possibleFile = possibleFile.files[0].path;
                } else {
                    throw "No file was selected."
                }
            } else {
                possibleFile = action.children[1].firstElementChild.firstElementChild.firstElementChild;
                if (possibleFile.files && possibleFile.files[0]) {
                    resetMessageCommandModal(action.firstElementChild, mode);
                    possibleFile = possibleFile.files[0].path;
                } else {
                    possibleFile = strip(action.children[1].firstElementChild.firstElementChild.lastElementChild.innerText.trim());
                    resetMessageCommandModal(action.firstElementChild, mode);
                }
            }
            let possibleVariable = action.children[1].children[1].firstElementChild.firstElementChild.innerText.trim() as string;
            if (!possibleVariable.startsWith("$")) {
                possibleVariable = "$" + possibleVariable;
            }
            if (possibleVariable.length == 0 || possibleVariable == "$") {
                throw "No variable was provided."
            }
            return {type: "ReadFile", file: possibleFile, returns: [{variable: possibleVariable, data: null }]}
        } catch(e) {
            console.log(e);
            errorMessageCommandModal(e, action.firstElementChild, mode);
            return false
        }
        case "Timeout":
            try {
                console.log(action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText)
                let possibleTimeout = action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText.trim()
                if (possibleTimeout.length == 0) {
                    throw "No target for timeout was provided. Enter a name or a variable (ie. $user, $target)"
                }
                let possibleDuration = action.children[1].children[1].firstElementChild.firstElementChild.value
                return {type: "Timeout", target: possibleTimeout, duration: possibleDuration};
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Tweet":
            try {
                let twitterMessage = action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText;
                if (twitterMessage.length == 0) {
                    throw "No message was provided."
                }
                return {type: "Twitter", tweetMessage: strip(twitterMessage)};
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Video":
            try {
                let possibleVideo = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                if (possibleVideo == "None") {
                    throw "No Video selection was made."
                }
                if (await MediaHandle.getMediaByName(possibleVideo) !== null) {
                    resetMessageCommandModal(action.firstElementChild, mode)
                    return { type: "Video", source: possibleVideo };
                } else {
                    throw "The media selected was not found. Ensure it is located in the overlay tab."
                }
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Wait":
            try {
                let possibleWait = strip(action.children[1].firstElementChild.firstElementChild.innerText.trim())
                if (possibleWait.length == 0) {
                    throw "You must enter a duration." // @ts-ignore
                } else if (isNaN(possibleWait) == true) { // Make sure it is a number
                    throw "Wait must be a number."
                } else if (Math.sign(parseFloat(possibleWait)) == -1) { // Make sure it is positive
                    throw "Wait must be a positive number."
                }
                resetMessageCommandModal(action.firstElementChild, mode)
                return {type: "Wait", wait: possibleWait}
            } catch(e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        case "Write File":
            let possibleFile;
            try {
                if (mode == "add") {
                    possibleFile = action.children[1].firstElementChild.firstElementChild.firstElementChild;
                    if (possibleFile.files && possibleFile.files[0]) {
                        resetMessageCommandModal(action.firstElementChild, mode);
                        possibleFile = possibleFile.files[0];
                    } else {
                        throw "No file was selected."
                    }
                } else {
                    possibleFile = action.children[1].firstElementChild.firstElementChild.firstElementChild;
                    if (possibleFile.files && possibleFile.files[0]) {
                        resetMessageCommandModal(action.firstElementChild, mode);
                        possibleFile = possibleFile.files[0].path;
                    } else {
                        possibleFile = strip(action.children[1].firstElementChild.firstElementChild.lastElementChild.innerText.trim());
                        resetMessageCommandModal(action.firstElementChild, mode);
                    }
                }

                let possibleData = strip(action.children[1].children[1].firstElementChild.firstElementChild.innerText);
                if (possibleData.length == 0) {
                    throw "No data was entered."
                }

                resetMessageCommandModal(action.firstElementChild, mode)
                return { type: "WriteFile", file: possibleFile, data: possibleData }
            } catch (e) {
                console.log(e);
                errorMessageCommandModal(e, action.firstElementChild, mode);
                return false
            }
        default:
            break;
    }
}



// Highlights the part that has the error
function errorMessageCommandModal(message:string, errLocation:HTMLElement, mode:"add" | "edit") {
    try {
        let cmdErrorMessage = document.createElement("li");
        cmdErrorMessage.innerHTML = message;
        document.getElementById(`${mode}CommandErrors`)!.appendChild(cmdErrorMessage);
        let partWithError = errLocation.parentElement;
        partWithError!.classList.add("errorClass");
        console.log("Command is not valid.");
    } catch (e) {
        console.log("error displaying source of error, probably fine")
    }
}

// Resets the error list
function resetMessageCommandModal(toBeReset:HTMLElement, mode: "add" | "edit") {
    try {
        toBeReset.parentElement!.classList.remove("errorClass");
        document.getElementById(`${mode}CommandErrors`)!.innerHTML = "";
    } catch (error) {
        console.log(error);
    }
}

export {validateActions, validateSettings}