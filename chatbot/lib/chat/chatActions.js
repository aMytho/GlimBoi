// This file handles chat function such as adding commands, adding users, etc

/**
 * Adds a user from Glimesh chat.
 * @param {string} user The user who will be added
 */
async function addUserChat(user, newUser) {
    let hasPermission = await RankHandle.rankController(user, "canAddUsers", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to do this action.")
    } else {
        let userAdded = await UserHandle.addUser(newUser, false)
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
    let hasPermission = await RankHandle.rankController(user, "canRemoveUsers", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        let exists = await UserHandle.findByUserName(newUser);
        if (exists == "ADDUSER") {
            ChatMessages.glimboiMessage("No user was found with that name in GlimBoi.")
        } else {
            let deletedUser = await UserHandle.removeUser(newUser);
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
    let hasPermission = await RankHandle.rankController(user, "canAddQuotes", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        console.log(creator, data.message);
        let trimMessage = 10 + creator.length + 2
        let quoteResult = await QuoteHandle.addquote(creator.toLowerCase(), data.message.substring(trimMessage))
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
    let hasPermission = await RankHandle.rankController(user, "canRemoveQuotes", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank or you are not a user in GlimBoi.")
    } else {
        console.log(creator, id);
        if (creator == "" || creator == " " || id == "" || id == " " || creator == undefined || id == undefined) {
            ChatHandle.glimboiMessage("A user and an ID must be included. ex. !quote del mytho 2")
        } else {
            let quoteResult = await UserHandle.removeQuoteByID(Number(id), creator.toLowerCase())
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
    let commandExists = await CommandHandle.findCommand(command);
    if (commandExists !== null) {
        let commandRemoved = await RankHandle.rankController(user, "canRemoveCommands", "string");
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
    let hasPermission = await RankHandle.rankController(user, "canAddCommands", "string");
    if (hasPermission == false || hasPermission == null) {
        ChatMessages.filterMessage("You do not have the sufficient rank or you are not a user in GlimBoi.", 'glimboi');
    } else {
        CommandHandle.addCommandFilter(command, commandData, type)
    }
}


/**
 * Returns a list of all commands to chat.
 */
function commandList() {
  	let cmdList = [];
  	CommandHandle.getAll().then((data) => {
    	for (let index = 0; index < data.length; index++) {
      		cmdList.push(data[index].commandName);
    	}
    	let cmdmsg = cmdList.toString();
    	ChatMessages.filterMessage(cmdmsg);
  	});
}

/**
 * Returns a users rank
 * @param {string} user The user who we need the rank for
 */
async function getRank(user) {
    let rank = await UserHandle.findByUserName(user);
    if (rank == "ADDUSER") {
        ChatMessages.filterMessage(`${user} has not been added to glimboi. Type !user new ${user}`, "glimboi");
    } else {
    ChatMessages.filterMessage(`${user} has the rank of ${rank.role}`, "glimboi");
    }
}

/**
 * Checks if a number is valid
 * @param {number} amount
 * @returns {boolean} True or false
 */
function checkAmount(amount) {
    if (isNaN(amount)) {
        return false
    } else {
        return true
    }
}

/**
 * Adds points if the rank has permission
 * @param {string} user The user who activated the command
 * @param {user} target The target user who will be affected
 * @param {number} count The amount of points to add
 */
async function addPointsChat(user, target, count) {
    if (target !== undefined) {
        target = target.toLowerCase();
        let hasPerms = await RankHandle.rankController(user, "canAddPoints", "string");
        if (hasPerms) {
            if (checkAmount(count) == true) {
                let targetExists = await UserHandle.findByUserName(target);
                if (targetExists !== "ADDUSER") {
                    UserHandle.addPoints(target, Math.round(Number(count)));
                    ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were added to " + target, "glimboi");
                } else {
                    let userAdded = await UserHandle.addUser(target, false);
                    if (userAdded !== "INVALIDUSER") {
                        ChatMessages.filterMessage(target + " has been added to glimboi.");
                        UserHandle.addPoints(target, Math.round(Number(count)));
                        ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were added to " + target, "glimboi");
                    } else {
                        ChatMessages.filterMessage(target + " was not found. Ensure the name is typed correctly.", "glimboi");
                    }
                }
            } else {
                ChatMessages.filterMessage(Math.round(Number(count)) + " is an invalid number.", "glimboi");
            }
        } else {
            ChatMessages.filterMessage(user + "'s rank cannot add points.", "glimboi");
        }
    } else {
        ChatMessages.filterMessage("The target was not included. !points add/inc/+ Mytho 100", "glimboi")
    }
}

/**
 * Removes points from a user
 * @param {string} user The user who is removing points
 * @param {string} target Who is about to lose points
 * @param {number} count How many points will be removed
 */
async function removePointsChat(user, target, count) {
    if (target !== undefined) {
        target = target.toLowerCase()
        let hasPerms = await RankHandle.rankController(user, "canRemovePoints", "string");
        if (hasPerms) {
            if (checkAmount(count) == true) {
                let targetExists = await UserHandle.findByUserName(target);
                if (targetExists !== "ADDUSER") {
                    if ((targetExists.points - Math.round(Number(count))) < 0) {
                        UserHandle.editUserPoints(target, 0);
                        ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were removed from " + target, "glimboi");
                    } else {
                        UserHandle.removePoints(target, Math.round(Number(count)));
                        ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were removed from " + target, "glimboi");
                    }
                } else {
                    let userAdded = await UserHandle.addUser(target, false);
                    if (userAdded !== "INVALIDUSER") {
                        if ((userAdded.points - Math.round(Number(count))) < 0) {
                            UserHandle.editUserPoints(target, 0);
                            ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were removed from " + target, "glimboi");
                        } else {
                            UserHandle.removePoints(target, Math.round(Number(count)));
                            ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were removed from " + target, "glimboi");
                        }
                    } else {
                        ChatMessages.filterMessage(target + " was not found. Ensure the name is typed correctly.", "glimboi");
                    }
                }
            } else {
                ChatMessages.filterMessage(Math.round(Number(count)) + " is an invalid number.", "glimboi");
            }
        } else {
            ChatMessages.filterMessage(user + "'s rank cannot remove points.", "glimboi");
        }
    } else {
        ChatMessages.filterMessage("The user was not included. !points sub/dec/- Mytho 100", "glimboi")
    }
}

/**
 * Sets a point amount to a user
 * @param {string} user The user who is editing points
 * @param {string} target The user who is getting a new point value
 * @param {number} count The amount of points that will be set
 */
async function editPointsChat(user, target, count) {
    if (target !== undefined) {
        target = target.toLowerCase()
        let hasPerms = await RankHandle.rankController(user, "canEditPoints", "string");
        if (hasPerms) {
            if (checkAmount(count) == true) {
                let targetExists = await UserHandle.findByUserName(target);
                if (targetExists !== "ADDUSER") {
                    UserHandle.editUserPoints(target, Math.round(Number(count)));
                    ChatMessages.filterMessage(target + " now has " + Math.round(Number(count)) + " " + settings.Points.name, "glimboi");
                } else {
                    let userAdded = await UserHandle.addUser(target, false);
                    if (userAdded !== "INVALIDUSER") {
                        ChatMessages.filterMessage(target + " has been added to glimboi.");
                        UserHandle.editUserPoints(target, Math.round(Number(count)));
                        ChatMessages.filterMessage(target + " now has " + Math.round(Number(count)) + " " + settings.Points.name, "glimboi");
                    } else {
                        ChatMessages.filterMessage(target + " was not found. Ensure the name is typed correctly.", "glimboi");
                    }
                }
            } else {
                ChatMessages.filterMessage(Math.round(Number(count)) + " is an invalid number.", "glimboi");
            }
        } else {
            ChatMessages.filterMessage(user + "'s rank cannot edit points.", "glimboi");
        }
    } else {
        ChatMessages.filterMessage("The user was not included. !points set/= Mytho 100", "glimboi")
    }
}

/**
 * Returns the amount of points a user has
 * @param {string} target The user who you are getting the points for
 */
async function getPointsChat(target) {
    if (target !== undefined) {
        target = target.toLowerCase();
        let targetExists = await UserHandle.findByUserName(target);
        if (targetExists !== "ADDUSER") {
            ChatMessages.filterMessage(target + " has " + targetExists.points + " " + settings.Points.name, "glimboi");
        } else {
            ChatMessages.filterMessage(target + " was not found. Ensure the name is typed correctly and the user exists in glimboi.", "glimboi");
        }
    } else {
        ChatMessages.filterMessage("The user was not specified. !points get Mytho", "glimboi")
    }
}

module.exports = {addCommand, addPointsChat, addQuoteChat, addUserChat, commandList, delQuoteChat, delUserChat, editPointsChat, getPointsChat, getRank, randomQuoteChat, removeCommand, removePointsChat}