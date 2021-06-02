//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
const CommandHandle = require(appData[0] + "/chatbot/lib/commands.js");
CommandHandle.updatePath(appData[1]);
let table; //The physical table for the UI
let commandToBeEdited; // A global var because I was too lazy to find another solution. Must have for editing.

//Loads the command table.
function loadCommandTable() {
    $(document).ready(function () {
        commandModalPrep() // ensures the modals have the proper filter enabled
        table = $("#example").DataTable({
            data: CommandHandle.getCurrentCommands(), // returns all the commands
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
                            actionString = actionString.concat(row.actions[i].action, ": ", row.actions[i][`${row.actions[i].info}`]);
                            if (row.actions.length -1 !== i) {
                                actionString = actionString.concat(", ")
                            }
                        }
                        return actionString
                    }
                  return data;
               }
            }],
            iDisplayLength: 25
        });
        $('#example tbody').on('click', 'tr', async function () {
            var data = table.row( this ).data();
            const CommandUI = require(`${appData[0]}/UI/src/js/commands/modalManager.js`);
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
async function validateSettings(mode) {
    // Declares and obtains all the command settings
    let commandName = document.getElementById(`${mode}CommandName`).value.trim().toLowerCase();
    let commandPoints = Number(document.getElementById(`${mode}CommandPoints`).value);
    let commandUses = Number(document.getElementById(`${mode}CommandUses`).value);
    let commandCooldown = Number(document.getElementById(`${mode}CommandCooldown`).value)
    let commandRank = document.getElementById(`${mode}CommandRank`).value;
    let commandRepeat = document.getElementById(`${mode}CommandRepeat`).value;

    // First we check the command name.
    commandName = commandName.replace(new RegExp("^[!]+"), "").trim(); // Removes the ! if it exists
    // Make sure they actually entered something
    if (commandName.length == 0 || commandName == "!") {
        errorMessageCommandModal("You must enter a command name", document.getElementById(`${mode}CommandName`), mode);
        return;
    } // Check to see if they are adding a command that already exists.
    await CommandHandle.findCommand(commandName).then((data) => {
        if (data !== null && mode !== "edit") {
            console.log("The command " + commandName + " already exists");
            errorMessageCommandModal("The command name already exists", document.getElementById(`${mode}CommandName`), mode)
            return;
        }
    });

    resetMessageCommandModal(document.getElementById(`${mode}CommandName`), mode);

    // Next we check the command points
    if (isNaN(commandPoints) == true) { // Make sure it is a number
        errorMessageCommandModal("Points must be a number", document.getElementById(`${mode}CommandPoints`), mode);
        return
    } else if (Math.sign(parseFloat(commandPoints)) == -1) { // Make sure it is positive
        errorMessageCommandModal("Points cannot be negative", document.getElementById(`${mode}CommandPoints`), mode);
        return
    }
    commandPoints = Math.round(commandPoints); // Rounds the number
    resetMessageCommandModal(document.getElementById(`${mode}CommandPoints`), mode);

    // And now we check command uses
    if (isNaN(commandUses) == true) { // Make sure it is a number
        errorMessageCommandModal("Uses must be a number", document.getElementById(`${mode}CommandUses`), mode);
        return
    } else if (Math.sign(parseFloat(commandUses)) == -1) { // Make sure it is positive
        errorMessageCommandModal("Cannot be negative", document.getElementById(`${mode}CommandUses`), mode);
        return
    }
    commandUses = Math.round(commandUses); // Rounds the number
    resetMessageCommandModal(document.getElementById(`${mode}CommandUses`), mode);

    // We also test cooldowns
    if (isNaN(commandCooldown) == true) { // Make sure it is a number
        errorMessageCommandModal("Cooldown must be a number", document.getElementById(`${mode}CommandCooldown`), mode);
        return
    } else if (Math.sign(parseFloat(commandCooldown)) == -1) { // Make sure it is positive
        errorMessageCommandModal("Cannot be negative", document.getElementById(`${mode}CommandCooldown`), mode);
        return
    }
    resetMessageCommandModal(document.getElementById(`${mode}CommandCooldown`), mode);

    //The rank is a safe value, we don't need to check it.
    //Now we set the repeat switch.
    if (commandRepeat == "false") { commandRepeat = false } else { commandRepeat = true };

    // Now we can assume the command is fully safe to add to the db.
    return {commandName: commandName, points: commandPoints, uses: commandUses, cooldown: commandCooldown, rank: commandRank, repeat: commandRepeat};
}


function validateActions(mode) {
    let actionsHTML = document.getElementById(`${mode}CommandList`).children;
    let actionsToBeCreated = []
    if (actionsHTML.length !== 0) {
        for (let i = 0; i < actionsHTML.length; i++) {
            let actionValue = determineActionAndCheck(actionsHTML[i], mode)
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

function determineActionAndCheck(action, mode) {
    console.log(action)
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

            break;
        case "Audio":
            try {
                let possibleAudio = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                // TODO, make warning system. Currently the below situation is valid but we should at least warn them or something
                if (possibleAudio == "None") {
                    throw "No audio selection was made."
                }
                if (OBSHandle.getMediaByName(possibleAudio) !== null) {
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
        case "ImageGif":
            try {
                let possibleImageGif = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                // TODO, make warning system. Currently the below situation is valid but we should at least warn them or something
                if (possibleImageGif == "None") {
                    throw "No Image or Gif selection was made."
                }
                if (OBSHandle.getMediaByName(possibleImageGif) !== null) {
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
        case "Video":
            try {
                let possibleVideo = action.children[1].firstElementChild.firstElementChild.firstElementChild.value
                if (possibleVideo == "None") {
                    throw "No Video selection was made."
                }
                if (OBSHandle.getMediaByName(possibleVideo) !== null) {
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
                    throw "You must enter a chat message"
                } else if (isNaN(possibleWait) == true) { // Make sure it is a number
                    throw "Wait must be a number."
                } else if (Math.sign(parseFloat(possibleWait)) == -1) { // Make sure it is positive
                    throw "Wait must be a positive number."
                }
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
  	var commandToBeRemoved = $("#commandRemoveInput").val().toLowerCase()
  	commandToBeRemoved = commandToBeRemoved.replace(new RegExp("^[\!]+"), "").trim();

  	try {
    	CommandHandle.findCommand(commandToBeRemoved).then(data => {
      		if (data !== null) {
        		console.log("The command " + commandToBeRemoved + " will now be removed from the table");
        		removeCommandFromTable(commandToBeRemoved)
        		CommandHandle.removeCommand(commandToBeRemoved);
      		} else {
        		var removeCommandMessageError = document.getElementById("removeCommandMessage")
        		removeCommandMessageError.innerHTML = "This command does not exist.";
        		setTimeout(() => {
          			removeCommandMessageError.innerHTML = ""
        		}, 4000);
      		}
    	})
  	} catch (e) {
    	console.log(e);
    	var removeCommandMessageError = document.getElementById("removeCommandMessage")
    	removeCommandMessageError.innerHTML = "This command does not exist.";
    	setTimeout(() => {
      		removeCommandMessageError.innerHTML = ""
    	}, 4000);
  	}
}

//edits commands
function checkEditCommand() {
  	commandToBeEdited = $("#commandEditInput").val().toLowerCase();
  	var editErrorMessage = document.getElementById("editCommandMessage")
  	commandToBeEdited = commandToBeEdited.replace(new RegExp("^[\!]+"), "").trim();

  	//Make sure the command exists.
  	try {
    	CommandHandle.findCommand(commandToBeEdited).then(data => {
      		if (data !== null) {
        		console.log("Editing " + commandToBeEdited);
        		//We replace the html of the modal with new html
        		document.getElementById("editModal").innerHTML = editCommandModal(data, RankHandle.getCurrentRanks());
        		editErrorMessage.innerHTML = "";
        		$("#editCommandPoints").keypress(function (e) {
          			if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
        		});
        		$("#editCommandUses").keypress(function (e) {
          			if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
        		});
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
 * Same as the add modal with the exception of the command name.
 * @returns
 */
function editCommand() {
  	console.log("Checking if command is valid.");
  	let commandData = $("#editCommandData").text().trim().toLowerCase();
  	let commandPoints = Number($("#editCommandPoints").text());
  	let commandUses = Number($("#editCommandUses").text());
  	let commandRank = document.getElementById("rankChoiceEdit").value;
  	let repeat = document.getElementById("commandRepeatableChoiceEdit").value
    let commandSound = document.getElementById("commandEditSound").value
    let commandMedia = document.getElementById("commandMediaSelect").value

  	commandData = commandData.replace(new RegExp("^[\!]+"), "").trim();

  	if (commandData.length >= 255) {
    	//max length is 255.
    	errorMessageCommandModal("The message is too long", "editCommandData");
    	return
  	} else if (commandData.length == 0) {
    	errorMessageCommandModal("You must type a message", "editCommandData");
    	return
  	} else {
    	commandData = strip(commandData);
    	resetMessageCommandModal("editCommandData")
  	}

  	if (isNaN(commandPoints) == true) {
    	errorMessageCommandModal("Points must be a number", "editCommandPoints");
    	return
  	} else if (Math.sign(parseFloat(commandPoints)) == -1) {
    	errorMessageCommandModal("Points cannot be negative", "editCommandPoints");
    	return
  	} else {
    	resetMessageCommandModal("editCommandPoints")
  	}

  	if (isNaN(commandUses) == true) {
    	errorMessageCommandModal("Uses must be a number", "editCommandUses");
    	return
  	} else if (Math.sign(parseFloat(commandUses)) == -1) {
    	errorMessageCommandModal("Uses cannot be negative", "editCommandUses");
    	return
  	} else {
    	resetMessageCommandModal("editCommandUses")
  	}

  	if (repeat == "false") { repeat = false } else { repeat = true }

  	console.log(commandData, commandPoints, commandUses, commandRank, repeat, commandSound, commandMedia);

  	// Adds it to the db and table
  	CommandHandle.editCommand(commandToBeEdited, commandData, commandUses, commandPoints, commandRank, null, repeat, commandSound, commandMedia); //Edit the DB
  	CommandHandle.findCommand(commandToBeEdited).then(data => {
    	if (data !== null) {
      		var filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
        	.rows()
        	.indexes()
        	.filter(function (value, index) {
          		return table.row(value).data().commandName == commandToBeEdited;
        	});
      		table.rows(filteredData).remove();
      		table.row.add({ commandName: commandToBeEdited, message: commandData, uses: commandUses, points: commandPoints, rank: commandRank });
      		table.draw();
      		$("#modalEditCommand").modal("hide");
      		document.getElementById("editModal").innerHTML = editCommandModalEntry()
    	}
  	})

  	// Shows an error in the modal
  	function errorMessageCommandModal(message, errLocation) {
    	var editCommandName = document.getElementById(errLocation).parentElement;
    	var cmdErrorMessageEdit = document.getElementById("errorMessageEdit")
    	editCommandName.classList.add("errorClass");
    	cmdErrorMessageEdit.innerHTML = message;
    	console.log("Command is not valid.");
  	}

  	// Resets the errors
  	function resetMessageCommandModal(toBeReset) {
    	try {
      		document.getElementById(toBeReset).parentElement.classList.remove("errorClass");
      		document.getElementById("errorMessageEdit").innerHTML = "";
    	} catch (error) {
      		console.log(error);
    	}
  	}
}

function editReset() {
  	document.getElementById("editModal").innerHTML = editCommandReset()
}

/**
 * Removes any HTML/CSS that is invisible to the user.
 * @param {string} html All the command data
 */
function strip(html) {
  	let doc = new DOMParser().parseFromString(html, 'text/html');
  	return doc.body.textContent || "";
}

/**
 * Runs on cmd page load. Adds filters and other things for the modals
 */
function commandModalPrep() {
    const CommandUI = require(`${appData[0]}/UI/src/js/commands/modalManager.js`)
  	$('#modalCart').on('show.bs.modal', function (e) {
        console.log("Preparing add command modal");
        if (e.relatedTarget) {
            CommandUI.loadModalAdd();
        }
  	});
  	$('#modalEditCommand').on('hidden.bs.modal', function (e) {
    	console.log("Resetting edit add modal.");
    	document.getElementById("editModal").innerHTML = editCommandReset();
    	document.getElementById("errorMessageEdit").innerHTML = "";
  	});
  	$('#modalDelete').on('hidden.bs.modal', function (e) {
    	console.log("Resetting command remove modal.");
    	document.getElementById("removeModal").innerHTML = removeCommandReset();
    	document.getElementById("errorMessageDelete").innerHTML = "";
  	});
}

// Adds a command to the table.
function addCommandTable({commandName, uses, points, rank, actions}) {
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions })
    table.draw(); //Show changes
}

function editCommandTable({commandName, actions, uses, points, rank}) {
    var filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
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
        var filteredData = table
            .rows()
            .indexes()
            .filter(function (value, index) {
                return table.row(value).data().commandName == command;
            });
        table.rows(filteredData).remove().draw();
    } catch (e) { }
}

// Highlights the part that has the error
function errorMessageCommandModal(message, errLocation, mode) {
    try {
        var cmdErrorMessage = document.createElement("li");
        cmdErrorMessage.innerHTML = message;
        document.getElementById(`${mode}CommandErrors`).appendChild(cmdErrorMessage);
        var partWithError = errLocation.parentElement;
        partWithError.classList.add("errorClass");
        console.log("Command is not valid.");
    } catch (e) {
        console.log("error displaying source of error, probably fine")
    }
}

// Resets the error list
function resetMessageCommandModal(toBeReset, mode) {
    try {
        toBeReset.parentElement.classList.remove("errorClass");
        document.getElementById(`${mode}CommandErrors`).innerHTML = "";
    } catch (error) {
        console.log(error);
    }
}