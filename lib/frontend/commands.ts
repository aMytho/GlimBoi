//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
CommandHandle.updatePath(appData[1]);
let table; //The physical table for the UI

//Loads the command table.
function loadCommandTable() {
    $(document).ready(async function () {
        commandModalPrep() // ensures the modals have the proper filter enabled
        table = $("#example").DataTable({
            data: await CommandHandle.getAll(), // returns all the commands
            columns: [
                {
                    title: "Commands",
                    data: "commandName",
                },
                {
                    title: "Data",
                    data: "message",
                },
                {
                    title: "Uses",
                    data: "uses",
                },
                {
                    title: "Points",
                    data: "points",
                },
                {
                    title: "Rank",
                    data: "rank",
                },
            ],
            columnDefs: [ {
              targets: 1,
                data: "message",
                render: function(data, type, row, meta){
                    if (data == undefined || data == null) {
                        let actionString = ""
                        for (let i = 0; i < row.actions.length; i++) {
                            if (i==3) {
                                actionString = actionString + "..."
                                break
                            }
                            actionString = actionString.concat(row.actions[i].action, ": ", row.actions[i][`${row.actions[i].info[0].length > 1 && row.actions[i].info[0] || row.actions[i].info}`]);
                            if (row.actions.length -1 !== i) {
                                actionString = actionString.concat(", ")
                            }
                        }
                        return actionString
                    }
                  return data;
               }
            }],
            pageLength: 25
        });
        $('#example tbody').on('click', 'tr', async function () {
            let data = table.row( this ).data();
            const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
            let commandClicked = await CommandHandle.findCommand(data.commandName);
            $('#modalCart').modal("show");
            CommandUI.loadModalEdit(commandClicked);
        } );
    });
}

/**
 * Makes sure that all the settings are valid for the command and displays errors if they are not
 * @param {string} mode Add or Edit
 */
async function validateSettings(mode):Promise<any> {
    // Declares and obtains all the command settings
    let commandName = (document.getElementById(`${mode}CommandName`) as HTMLInputElement).value.trim().toLowerCase();
    let commandPoints = parseFloat((document.getElementById(`${mode}CommandPoints`) as HTMLInputElement).value);
    let commandUses = parseFloat((document.getElementById(`${mode}CommandUses`) as HTMLInputElement).value);
    let commandCooldown = parseFloat((document.getElementById(`${mode}CommandCooldown`) as HTMLInputElement).value)
    let commandRank = (document.getElementById(`${mode}CommandRank`) as HTMLInputElement).value;
    let commandRepeat = (document.getElementById(`${mode}CommandRepeat`) as HTMLInputElement).value;

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

    // Now we can assume the command is fully safe to add to the db.
    return {commandName: commandName, points: commandPoints, uses: commandUses, cooldown: commandCooldown, rank: commandRank, repeat: commandRepeat};
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
                console.log(action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText)
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
        default:
            break;
    }
}

//removes commands
function checkRemoveCommand() {
  	let commandToBeRemoved = ($("#commandRemoveInput").val() as string).toLowerCase()
  	commandToBeRemoved = commandToBeRemoved.replace(new RegExp("^[\!]+"), "").trim();
    let removeCommandMessageError = document.getElementById("removeCommandMessage")

  	try {
    	CommandHandle.findCommand(commandToBeRemoved).then(data => {
      		if (data !== null) {
        		console.log("The command " + commandToBeRemoved + " will now be removed from the table");
                removeCommandMessageError.innerHTML = "Command Removed";
        		removeCommandFromTable(commandToBeRemoved)
        		CommandHandle.removeCommand(commandToBeRemoved);
      		} else {
        		removeCommandMessageError.innerHTML = "This command does not exist.";
        		setTimeout(() => {
          			removeCommandMessageError.innerHTML = ""
        		}, 4000);
      		}
    	})
  	} catch (e) {
    	console.log(e);
    	removeCommandMessageError.innerHTML = "This command does not exist.";
    	setTimeout(() => {
      		removeCommandMessageError.innerHTML = ""
    	}, 4000);
  	}
}

//edits commands
function checkEditCommand() {
    let commandToBeEdited = ($("#commandEditInput").val() as string).toLowerCase();
    let editErrorMessage = document.getElementById("editCommandMessage")
    commandToBeEdited = commandToBeEdited.replace(new RegExp("^[\!]+"), "").trim();

    //Make sure the command exists.
    try {
        CommandHandle.findCommand(commandToBeEdited).then(data => {
            if (data !== null) {
                console.log("Editing " + commandToBeEdited);
                const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
                $('#modalEditCommand').modal("hide");
                $('#modalCart').modal("show");
                CommandUI.loadModalEdit(data);
            } else {
                editErrorMessage.innerHTML = "This command does not exist.";
                setTimeout(() => {
                    editErrorMessage.innerHTML = "";
                }, 4000);
            }
        })
    } catch (e) {
        console.log(e);
        editErrorMessage.innerHTML = "This command does not exist.";
        setTimeout(() => {
            editErrorMessage.innerHTML = ""
        }, 4000);
    }
}

/**
 * Removes any HTML/CSS that is invisible to the user.
 * @param {string} html All the command data
 */
function strip(html:string) {
  	let doc = new DOMParser().parseFromString(html, 'text/html');
  	return doc.body.textContent || "";
}

function moveAction(element:HTMLElement, direction: "up" | "down") {
    if (direction == "up") {
        if (element.previousElementSibling) {
            element.parentNode!.insertBefore(element, element.previousElementSibling)
        }
    } else {
        if (element.nextElementSibling) {
            element.parentNode!.insertBefore(element.nextElementSibling, element)
        }
    }
}

/**
 * Runs on cmd page load. Adds filters and other things for the modals
 */
function commandModalPrep() {
    const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`)
  	$('#modalCart').on('show.bs.modal', function (e) {// @ts-ignore
        if (e.relatedTarget) {
            CommandUI.loadModalAdd();
        }
  	});
  	$('#modalEditCommand').on('hidden.bs.modal', function (e) {
    	document.getElementById("editModal").innerHTML = editCommandReset();
    	document.getElementById("errorMessageEdit").innerHTML = "";
  	});
  	$('#modalDelete').on('hidden.bs.modal', function (e) {
    	document.getElementById("removeModal").innerHTML = removeCommandReset();
    	document.getElementById("errorMessageDelete").innerHTML = "";
  	});
}

//@ts-ignore
function addCommandTable({commandName, uses, points, rank, actions}) {
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions })
    table.draw(); //Show changes
}

function editCommandTable({commandName, actions, uses, points, rank}) {
    let filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
        .rows()
        .indexes()
        .filter(function (value, index) {
            return table.row(value).data().commandName == commandName;
        });
    table.rows(filteredData).remove();
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions});
    table.draw();
}

// Removes a command from the table
function removeCommandFromTable(command) {
    try {
        let filteredData = table
            .rows()
            .indexes()
            .filter(function (value, index) {
                return table.row(value).data().commandName == command;
            });
        table.rows(filteredData).remove().draw();
    } catch (e) {}
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