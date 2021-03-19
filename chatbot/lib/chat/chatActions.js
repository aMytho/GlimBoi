// This file handles chat function such as adding commands, adding users, etc

/**
 * Adds a user from Glimesh chat.
 * @param {string} user The user who will be added
 */
async function addUserChat(user, newUser) {
    var hasPermission = await RankHandle.rankController(user, "canAddUsers", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to do this action.")
    } else {
        var userAdded = await UserHandle.addUser(newUser, false)
        if (userAdded == "USEREXISTS") {
            ChatMessages.glimboiMessage("That user is already added to GlimBoi.")
        } else if (userAdded == "INVALIDUSER") {
            ChatMessages.glimboiMessage("That user does not exist on Glimesh.")
        } else {
            ChatMessages.glimboiMessage("User addded to GlimBoi!")
        }
    }
}

/**
 * Removes a user from chat
 * @param {string} user User to be removed
 */
async function delUserChat(user, newUser) {
    var hasPermission = await RankHandle.rankController(user, "canRemoveUsers", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        var exists = await UserHandle.findByUserName(newUser);
        if (exists == "ADDUSER") {
            ChatMessages.glimboiMessage("No user was found with that name in GlimBoi.")
        } else {
            var deletedUser = await UserHandle.removeUser(newUser);
            ChatMessages.glimboiMessage("User removed!");
            removeUserFromTable(deletedUser);
        }
    }
}

/**
 * Returns a random quote and sends it to chat.
 */
function randomQuoteChat() {
  	QuoteHandle.randomQuote().then(data => {
    	if (data == null) {
      		ChatMessages.glimboiMessage(`No quotes exist.`)
    	} else {
      		ChatMessages.filterMessage(`@${data.user} - ${data.data}`, "glimboi")
    	}
  	})
}

/**
 * Adds a quote from chat.
 * @param {object} data Message and other data
 * @param {string} user Who said the quote
 */
async function addQuoteChat(user, data, creator) {
    var hasPermission = await RankHandle.rankController(user, "canAddQuotes", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        console.log(creator, data.message);
        var trimMessage = 10 + creator.length + 2
        var quoteResult = await QuoteHandle.addquote(creator.toLowerCase(), data.message.substring(trimMessage))
        if (quoteResult == "QUOTEFINISHED") {
            ChatMessages.glimboiMessage(`Quote added.`)
        } else {
            ChatMessages.glimboiMessage(`That user does not exist.`)
        }
    }
}

/**
 * Removes a quote by username and ID. The paramaters are converted just to be safe.
 * @param {String} user The user who said the quote
 * @param {Number} id The ID of the quote.
 */
async function delQuoteChat(user, creator, id) {
    var hasPermission = await RankHandle.rankController(user, "canRemoveQuotes", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        console.log(creator, id);
        if (creator == "" || creator == " " || id == "" || id == " " || creator == undefined || id == undefined) {
            ChatHandle.glimboiMessage("A user and an ID must be included. ex. !quote del mytho 2")
        } else {
            var quoteResult = await UserHandle.removeQuoteByID(Number(id), creator.toLowerCase())
            if (quoteResult == "NOQUOTEFOUND") {
                ChatHandle.glimboiMessage("No quote was found with that ID.")
            } else {
                ChatHandle.glimboiMessage("Quote removed.")
            }
        }
    }
}

/**
 * Removes a command if it exists and the use has sufficient permissions.
 * @param {string} user The user who is removing the command
 * @param {string} command The command that will be removed
 */
async function removeCommand(user, command) {
    if (command.startsWith("!")) {
        command = command.substring(1)
    }
    var commandExists = await CommandHandle.findCommand(command);
    if (commandExists !== null) {
        var commandRemoved = await RankHandle.rankController(user, "canRemoveCommands", "string");
        if (commandRemoved == false || commandRemoved == null) {
            ChatMessages.filterMessage("You do not have the sufficient rank or you are not a user in GlimBoi.", 'glimboi');
        } else {
            CommandHandle.removeCommand(command);
            ChatMessages.filterMessage("Command Removed", 'glimboi');
            removeCommandFromTable(command);
        }
    } else {
        ChatMessages.filterMessage("That command does not exist!", 'glimboi');
    }
}


/**
 * Checks if the user has the sufficient rank to add a command and if so sends it to the filter.
 * @param {string} user The user who is adding the command
 * @param {string} command The command name
 * @param {string} commandData The command data
 * @param {string} type !command or !cmd
 */
async function addCommand(user, command, commandData, type) {
    var hasPermission = await RankHandle.rankController(user, "canAddCommands", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.filterMessage("You do not have the sufficient rank or you are not a user in GlimBoi.", 'glimboi');
    } else {
        CommandHandle.addCommandFilter(command, null, commandData, type)
    }
}


/**
 * Returns a list of all commands to chat.
 */
function commandList() {
  	var cmdList = [];
  	CommandHandle.getAll().then((data) => {
    	for (let index = 0; index < data.length; index++) {
      		cmdList.push(data[index].commandName);
    	}
    	var cmdmsg = cmdList.toString();
    	ChatMessages.filterMessage(cmdmsg);
  	});
}

/**
 * Returns a users rank
 * @param {string} user The user who we need the rank for
 */
async function getRank(user) {
    var rank = await UserHandle.findByUserName(user);
    if (rank == "ADDUSER") {
        ChatMessages.filterMessage(`${user} has not been added to glimboi. Type !user new ${user}`, "glimboi");
    } else {
    ChatMessages.filterMessage(`${user} has the rank of ${rank.role}`, "glimboi");
    }
}

module.exports = {addCommand, addQuoteChat, addUserChat, commandList, delQuoteChat, delUserChat, getRank, randomQuoteChat, removeCommand}