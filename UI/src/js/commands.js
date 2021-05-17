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
            iDisplayLength: 25
    	});
  	});
} // End of start function

/**
 * Checks if the new command is valid. This is the same as the edit command modal.
 * If any errors occur the function returns. After an property is checked the errors are reset (even if none occured)
 */
function checkNewCommand() {
  	console.log("Checking if command is valid.");
  	let commandName = $("#addCommandName").text().trim().toLowerCase();
  	let commandData = $("#addCommandData").text().trim();
  	let commandPoints = Number($("#addCommandPoints").text());
  	let commandUses = Number($("#addCommandUses").text());
  	let repeat = document.getElementById("commandRepeatableChoice").value
  	let commandRank = document.getElementById("rankChoiceAdd").value;
    let commandSound = document.getElementById("commandSoundSelect").value
    let commandMedia = document.getElementById("commandSelectMedia").value

  	commandName = commandName.replace(new RegExp("^[\!]+"), "").trim();
  	if (commandName.length == 0 || commandName == "!") {
    	errorMessageCommandModal("You must enter a command name!", "addCommandName")
    	return
  	} else {
    	CommandHandle.findCommand(commandName).then(data => {
      		if (data !== null) {
        		console.log("The command " + commandName + " already exists");
        		document.getElementById("addCommandName").classList.add("errorClass");
        		document.getElementById("errorMessageAdd").innerHTML = "This command already exists";
        		return
      		}
    	})
  	}
  	resetMessageCommandModal("addCommandName");

  	if (commandData.length >= 255) {
    	//max length is 255
    	errorMessageCommandModal("This message is too long.", "addCommandData");
    	return
  	} else if (commandData.length == 0) {
    	errorMessageCommandModal("You must type a message.", "addCommandData");
    	return
  	} else {
    	commandData = strip(commandData);
    	resetMessageCommandModal("addCommandData");
  	}

  	if (isNaN(commandPoints) == true) {
    	errorMessageCommandModal("Points must be a number", "addCommandPoints");
    	return
  	} else if (Math.sign(parseFloat(commandPoints)) == -1) {
    	errorMessageCommandModal("Cannot be negative", "addCommandPoints");
    	return
  	} else {
    	resetMessageCommandModal("addCommandPoints")
  	}

  	if (isNaN(commandUses) == true) {
    	errorMessageCommandModal("Uses must be a number", "addCommandUses");
    	return
  	} else if (Math.sign(parseFloat(commandUses)) == -1) {
    	errorMessageCommandModal("Cannot be negative", "addCommandUses");
    	return
  	} else {
    	resetMessageCommandModal("addCommandUses")
  	}

  	commandData = commandData.replace(new RegExp("^[\!]+"), "").trim();

  	if (repeat == "false") { repeat = false } else { repeat = true }

  	console.log(commandName, commandData, commandPoints, commandUses, commandRank, null, repeat, commandSound, commandMedia);
  	//Adds a command to the DB
  	CommandHandle.addCommand(commandName, commandData, commandUses, commandPoints, commandRank, null, repeat, commandSound, commandMedia);
  	//adds a row to the table with the new command info
  	addCommandTable(commandName, commandData, commandUses, commandPoints, commandRank)
  	$("#modalCart").modal("hide");

  	// Shows an error in the modal
  	function errorMessageCommandModal(message, errLocation) {
    	var addCommandName = document.getElementById(errLocation).parentElement;
    	var cmdErrorMessage = document.getElementById("errorMessageAdd")
    	addCommandName.classList.add("errorClass");
    	cmdErrorMessage.innerHTML = message;
    	console.log("Command is not valid.");
  	}

  	// resets the errors
  	function resetMessageCommandModal(toBeReset) {
    	try {
      		document.getElementById(toBeReset).parentElement.classList.remove("errorClass");
      		document.getElementById("errorMessageAdd").innerHTML = "";
    	} catch (error) {
      		console.log(error);
    	}
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

// Adds a command to the table.
function addCommandTable(commandName, commandData, commandUses, commandPoints, commandRank) {
  	table.row.add({ commandName: commandName, message: commandData, uses: commandUses, points: commandPoints, rank: commandRank })
  	table.draw(); //Show changes
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
  	$('#modalCart').on('hidden.bs.modal', function (e) {
    	console.log("Resetting command add modal.");
    	document.getElementById("commandAddModalBody").innerHTML = addCommandModal();
    	document.getElementById("errorMessageAdd").innerHTML = "";
  	}).on('show.bs.modal', function (e) {
    	$("#addCommandPoints").keypress(function (e) {
      		if (e.which === 13 || isNaN(String.fromCharCode(e.which))) e.preventDefault();
    	});
    	$("#addCommandUses").keypress(function (e) {
      		if (e.which === 13 || isNaN(String.fromCharCode(e.which))) e.preventDefault();
    	});

        let select = document.getElementById("rankChoiceAdd");
        let options = RankHandle.getCurrentRanks();
        for (let i = 0; i < options.length; i++) {
            let opt = options[i].rank;
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }

        let soundSelect = document.getElementById("commandSoundSelect");
        let soundOptions = OBSHandle.getSounds();
        for (let i = 0; i < soundOptions.length; i++) {
            let opt = soundOptions[i].name;
            soundSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }

        let mediaSelect = document.getElementById("commandSelectMedia");
        let imageOptions = OBSHandle.getImages();
        let videoOptions = OBSHandle.getVideos();
        let mediaOptions = imageOptions.concat(videoOptions);
        for (let i = 0; i < mediaOptions.length; i++) {
            let opt = mediaOptions[i].name;
            mediaSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
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