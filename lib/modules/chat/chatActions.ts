// This file handles chat function such as adding commands, adding users, etc

/**
 * Adds a user from Glimesh chat.
 * @param {string} user The user who is adding the new user
 * @param {string} newUser The user who will be added
 */
async function addUserChat(user:userName, newUser:userName) {
    let hasPermission = await RankHandle.rankController(user, "canAddUsers", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to do this action.")
    } else {
        let userAdded = await UserHandle.addUser(newUser, false, user)
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
 * @param {string} user The user that is removing another user
 * @param {string} delUser The user that is being removed
 */
async function delUserChat(user:userName, delUser:userName) {
    let hasPermission = await RankHandle.rankController(user, "canRemoveUsers", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to delete users.");
    } else if (hasPermission == null) {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { delUserChat((newUser as UserType).userName, delUser) }
    } else {
        let exists = await UserHandle.findByUserName(delUser);
        if (exists == "ADDUSER") {
            ChatMessages.glimboiMessage("No user was found with that name in GlimBoi.")
        } else {
            let deletedUser = await UserHandle.removeUser(delUser, false);
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
 * @param {string} user Who recorded the quote
 * @param {string} creator Who said the quote
 */
async function addQuoteChat(user:userName, data, creator:userName) {
    let hasPermission = await RankHandle.rankController(user, "canAddQuotes", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to add quotes.")
    } else if (hasPermission == null) {
        let newUser = await UserHandle.addUser(user, false, creator);
        if (newUser !== "INVALIDUSER") { addQuoteChat((newUser as UserType).userName, data, creator)}
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
 * @param {String} user The user who is removing the quote
 * @param {string} creator The creator of the quote
 * @param {Number} id The ID of the quote.
 */
async function delQuoteChat(user:userName, creator:userName, id:quoteID) {
    let hasPermission = await RankHandle.rankController(user, "canRemoveQuotes", "string");
    if (hasPermission == false) {
        ChatMessages.glimboiMessage("You do not have the sufficient rank to delete quotes.");
    } else if (hasPermission == null) {
        let newUser = await UserHandle.addUser(user, false, creator);
        if (newUser !== "INVALIDUSER") { delQuoteChat((newUser as UserType).userName, creator, id)}
    } else {
        console.log(creator, id);// @ts-ignore
        if (creator == "" || creator == " " || id == "" || id == " " || creator == undefined || id == undefined) {
            ChatMessages.glimboiMessage("A user and an ID must be included. ex. !quote del mytho 2")
        } else {
            let quoteResult = await UserHandle.removeQuoteByID(Number(id), creator.toLowerCase())
            if (quoteResult == "NOQUOTEFOUND") {
                ChatMessages.glimboiMessage("No quote was found with that ID.")
            } else {
                ChatMessages.glimboiMessage("Quote removed.")
            }
        }
    }
}

/**
 * Removes a command if it exists and the use has sufficient permissions.
 * @param {string} user The user who is removing the command
 * @param {string} command The command that will be removed
 */
async function removeCommand(user:userName, command:commandName) {
    if (command.startsWith("!")) {
        command = command.substring(1)
    }
    let commandExists = await CommandHandle.findCommand(command);
    if (commandExists !== null) {
        let commandRemoved = await RankHandle.rankController(user, "canRemoveCommands", "string");
        if (commandRemoved == false) {
            ChatMessages.filterMessage("You do not have the sufficient rank to delete commands.", 'glimboi');
        } else if (commandRemoved == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { removeCommand((newUser as UserType).userName, command)}
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
async function addCommand(user:userName, command:commandName, commandData:string, type: "!command" | "!cmd") {
    let hasPermission = await RankHandle.rankController(user, "canAddCommands", "string");
    if (hasPermission == false) {
        ChatMessages.filterMessage("You do not have the sufficient rank to add commands.", 'glimboi');
    } else if (hasPermission == null) {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { addCommand((newUser as UserType).userName, command, commandData, type)}
    } else {
        CommandHandle.addCommandFilter(command, commandData, type)
    }
}


/**
 * Returns a list of all commands to chat.
 */
function commandList() {
  	let cmdList:string[] = [];
  	CommandHandle.getAll().then((data) => {
    	for (let index = 0; index < data.length; index++) {
      		cmdList.push(data[index].commandName);
    	}
    	let cmdmsg = cmdList.toString();
        if (cmdmsg.length == 0) {
            cmdmsg = "This streamer does not yet have any custom commands."
        } else if (cmdmsg.length > 255) {
            cmdmsg = "This streamer has so many commands we can't post them all to chat!"
        }
    	ChatMessages.filterMessage(cmdmsg);
  	});
}

/**
 * Returns a users rank
 * @param {string} user The user who we need the rank for
 */
async function getRank(user:userName) {
    let rank = await UserHandle.findByUserName(user);
    if (rank == "ADDUSER") {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { getRank((newUser as UserType).userName) }
    } else {
    ChatMessages.filterMessage(`${user} has the rank of ${rank.role}`, "glimboi");
    }
}

/**
 * Checks if a number is valid
 * @param {number} amount
 * @returns {boolean} True or false
 */
function checkAmount(amount:number | any): boolean {
    if (isNaN(amount)) {
        return false
    } else {
        return true
    }
}

/**
 * Adds points if the rank has permission
 * @param {string} user The user who is adding points
 * @param {user} target The target user who will be affected
 * @param {number} count The amount of points to add
 */
async function addPointsChat(user:userName, target:userName, count) {
    if (target !== undefined) {
        target = target.toLowerCase();
        let hasPerms = await RankHandle.rankController(user, "canAddPoints", "string");
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot add points.", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { addPointsChat((newUser as UserType).userName, target, count) }
        } else {
            if (checkAmount(count) == true) {
                let targetExists = await UserHandle.findByUserName(target);
                if (targetExists !== "ADDUSER") {
                    UserHandle.addPoints(target, Math.round(Number(count)));
                    ChatMessages.filterMessage(Math.round(Number(count)) + " " + settings.Points.name + " were added to " + target, "glimboi");
                } else {
                    let userAdded = await UserHandle.addUser(target, false, user);
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
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot remove points.", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { removePointsChat((newUser as UserType).userName, target, count) }
        } else {
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
                    let userAdded = await UserHandle.addUser(target, false, user);
                    if (userAdded !== "INVALIDUSER") {
                        if (((userAdded as UserType).points - Math.round(Number(count))) < 0) {
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
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot edit points.", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { editPointsChat((newUser as UserType).userName, target, count) }
        } else {
            if (checkAmount(count) == true) {
                let targetExists = await UserHandle.findByUserName(target);
                if (targetExists !== "ADDUSER") {
                    UserHandle.editUserPoints(target, Math.round(Number(count)));
                    ChatMessages.filterMessage(target + " now has " + Math.round(Number(count)) + " " + settings.Points.name, "glimboi");
                } else {
                    let userAdded = await UserHandle.addUser(target, false, user);
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
        }
    } else {
        ChatMessages.filterMessage("The user was not included. !points set/= Mytho 100", "glimboi")
    }
}

/**
 * Returns the amount of points a user has (other than self)
 * @param {string} user The user who is requesting points
 * @param {string} target The user who you are getting the points for
 */
async function getPointsChat(user, target) {
    if (target !== undefined) {
        target = target.toLowerCase();
        let targetExists = await UserHandle.findByUserName(target);
        if (targetExists !== "ADDUSER") {
            ChatMessages.filterMessage(target + " has " + targetExists.points + " " + settings.Points.name, "glimboi");
        } else {
            let newUser = await UserHandle.addUser(target, false, user);
            if (newUser !== "INVALIDUSER") { getPointsChat((newUser as UserType).userName, target) } else {
                ChatMessages.filterMessage(target + " was not found. Ensure the name is typed correctly and the user exists in glimboi.", "glimboi");
            }
        }
    } else {
        ChatMessages.filterMessage("The user was not specified. ex. !points get Mytho", "glimboi")
    }
}

/**
 * Returns the amount of points a user has
 * @param {string} user Who we are gettign the points for
 */
 async function getOwnPointsChat(user) {
    if (user !== undefined) {
        user = user.toLowerCase();
        let userExists = await UserHandle.findByUserName(user);
        if (userExists !== "ADDUSER") {
            ChatMessages.filterMessage(userExists.userName + " has " + userExists.points + " " + settings.Points.name, "glimboi");
        } else {
            let newUser = await UserHandle.addUser(user, false, user)
            if (newUser !== "INVALIDUSER") {
                ChatMessages.filterMessage((newUser as UserType).userName + " has " + (newUser as UserType).points + " " + settings.Points.name, "glimboi");
            } else {
                ChatMessages.filterMessage(user + " was not found.", "glimboi");
            }
        }
    } else {
        ChatMessages.filterMessage("The user was not specified. ex. !points get Mytho", "glimboi")
    }
}

/**
 * Returns the user with the most points or a specified position.
 * @param {string} requestedPosition The position you are searching for in the leaderboard
 * @param {boolean} leaderBoard Are they searching for a specific position?
 */
async function getTopPoints(requestedPosition?: number, leaderBoard?: any) {
    let topPoints = await UserHandle.getTopPoints();
    if (leaderBoard) {
        if (!isNaN(requestedPosition)) {
            if (topPoints.length > 0) {
                let pointsPosition = Number(requestedPosition)
                console.log(pointsPosition)
                if (pointsPosition <= 0) {
                    ChatMessages.filterMessage("That number is not valid.")
                } else if (topPoints[pointsPosition - 1] !== undefined) {
                    pointsPosition = pointsPosition - 1
                    ChatMessages.filterMessage("Number " + (pointsPosition + 1) + " is " + topPoints[pointsPosition].userName + " with " + topPoints[pointsPosition].points)
                } else {
                    ChatMessages.filterMessage("There is not a user with that position.")
                }
            } else {
                ChatMessages.filterMessage("There are not enough users to use the leaderboad function.", "glimboi")
            }
        } else {
            ChatMessages.filterMessage("Add a number to query a position. ex. !points 5 would return the user with the 5th most points. You can also use !points get USER", "glimboi")
        }
    } else {
        if (topPoints.length > 0) {
            ChatMessages.filterMessage("The top user is " + topPoints[0].userName, "glimboi");
        } else {
            ChatMessages.filterMessage("There are not enough users to use the leaderboad function.", "glimboi");
        }
    }
}

/**
 * Sends the current song to chat.
 */
function getSong() {
    if (musicPlaylist[currentSongIndex] && musicPlaylist[currentSongIndex].artists) {
        ChatMessages.filterMessage(`Now playing ${musicPlaylist[currentSongIndex].name} by ${musicPlaylist[currentSongIndex].artists}`, "glimboi")
    } else if (musicPlaylist[currentSongIndex]) {
        ChatMessages.filterMessage(`Now playing ${musicPlaylist[currentSongIndex].name}`, "glimboi")
    } else {
        ChatMessages.filterMessage(`No song is currently playing.`, "glimboi")
    }
}
/**
 * Gets or sets the next song.
 * @param {string} user The user who asked for or set the next song
 * @param {string} action Whether we are getting or setting the next song
 */
async function nextSong(user, action) {
    if (action == "set") {
        let hasPerms = await RankHandle.rankController(user, "canControlMusic", "string");
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot control the music player", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { nextSong((newUser as UserType).userName, action) }
        } else {
            if (musicPlaylist[currentSongIndex]) {
                nextOrPrevious("foward");
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        }
    } else {
        if (musicPlaylist[currentSongIndex]) {
            if (currentSongIndex + 1 >= musicPlaylist.length) {
                ChatMessages.filterMessage("Next up is " + musicPlaylist[0].name, "glimboi");
            } else {
                ChatMessages.filterMessage("Next up is " + musicPlaylist[currentSongIndex + 1].name, "glimboi")
            }
        } else {
            ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
        }
    }
}

/**
 * Sets or gets the previous song
 * @param {string} user The user who is requesting or setting the song
 * @param {string} action Are we setttng or getting the song?
 */
async function previousSong(user, action) {
    if (action == "set") {
        let hasPerms = await RankHandle.rankController(user, "canControlMusic", "string");
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot control the music player", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { previousSong((newUser as UserType).userName, action) }
        } else {
            if (musicPlaylist[currentSongIndex]) {
                nextOrPrevious("backward");
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        }
    } else {
        if (musicPlaylist[currentSongIndex]) {
            if (currentSongIndex - 1 < 0) {
                ChatMessages.filterMessage("Last song was " + musicPlaylist[0].name, "glimboi");
            } else {
                ChatMessages.filterMessage("Last song was" + musicPlaylist[currentSongIndex - 1].name, "glimboi")
            }
        } else {
            ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
        }
    }
}

/**
 * Enables or Disbles repeat.
 * @param {string} user The user who is wanting to replay a song
 */
async function replaySong(user:userName) {
    let hasPerms = await RankHandle.rankController(user, "canControlMusic", "string");
        if (hasPerms == false) {
            ChatMessages.filterMessage(user + "'s rank cannot control the music player", "glimboi");
        } else if (hasPerms == null) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") { replaySong((newUser as UserType).userName) }
        } else {
            if (musicPlaylist[currentSongIndex]) {
                toggleShuffleRepeat(document.getElementById("repeatButton"), !repeatEnabled, "Repeat" );
                ChatMessages.filterMessage("Repeat Toggled", "glimboi")
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        }
}

/**
 * Enables or Diables shuffle.
 * @param {string} user The user who is wanting to shuffle the playlist
 */
async function toggleShuffle(user:userName) {
    let hasPerms = await RankHandle.rankController(user, "canControlMusic", "string");
    if (hasPerms == false) {
        ChatMessages.filterMessage(user + "'s rank cannot control the music player", "glimboi");
    } else if (hasPerms == null) {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { toggleShuffle((newUser as UserType).userName) }
    } else {
        if (musicPlaylist[currentSongIndex]) {
            toggleShuffleRepeat(document.getElementById("shuffleButton"), !shuffleEnabled, "Shuffle" )
            ChatMessages.filterMessage("Shuffle Toggled", "glimboi")
        } else {
            ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
        }
    }
}

/**
 * Plays or pauses the music
 * @param {string} user The user who is wanting to play or pause.
 */
 async function playPause(user:userName, action) {
    let hasPerms = await RankHandle.rankController(user, "canControlMusic", "string");
    if (hasPerms == false) {
        ChatMessages.filterMessage(user + "'s rank cannot control the music player", "glimboi");
    } else if (hasPerms == null) {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { playPause((newUser as UserType).userName, action) }
    } else {
        if (musicPlaylist[currentSongIndex]) {
            toggleMusic()
        } else {
            ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
        }
    }
}

/**
 * Not yet used, don't try it
 * @param user
 * @param target
 * @param duration
 * @param id
 */
async function timeoutUser(user:userName, target:userName, duration:timeout, id:number) {
    let hasPerms = await RankHandle.rankController(user, "canTimeoutUsers", "string");
    if (hasPerms == false) {
        ChatMessages.filterMessage(user + " 's rank cannot timeout users.", "glimboi")
    } else if (hasPerms == null) {
        let newUser = await UserHandle.addUser(user, false, user);
        if (newUser !== "INVALIDUSER") { timeoutUser((newUser as UserType).userName, target, duration, id) }
    } else {
        let canBeTimedOut = await RankHandle.rankController(target, "modImmunity", "string");
        if (canBeTimedOut == true) {
            ChatMessages.filterMessage(target + " cannot be timed out.", "glimboi")
        } else if (canBeTimedOut == null) {
            let newTargetUser = await UserHandle.addUser(target, false, user);
            if (newTargetUser !== "INVALIDUSER") { timeoutUser(user, target, duration, id) }
        } else {
            ModHandle.timeoutByUserID(id, duration);
        }
    }
}

export {addCommand, addPointsChat, addQuoteChat, addUserChat, commandList, delQuoteChat, delUserChat, editPointsChat, getOwnPointsChat, getPointsChat, getRank, getSong, getTopPoints, nextSong, playPause, previousSong, randomQuoteChat, removeCommand, removePointsChat, replaySong, timeoutUser, toggleShuffle}