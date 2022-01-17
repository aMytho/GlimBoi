// This file handles chat function such as adding commands, adding users, etc

/**
 * Modifies a user from chat
 * @param {string} user The user who is modifying another user
 * @param {string} target The user who is being modified
 * @param {rankProperties} attemptedAction The rank permission in the db required to modify users
 * @param {string} friendlyAction A user friendly term to describe what the user is trying to do
 */
async function modifyUserFromChat(user: string, target: string, attemptedAction: rankProperties, friendlyAction: string) {
    if (await permissionCheck(user, attemptedAction, friendlyAction)) {
        if (attemptedAction == "canAddUsers") {
            let targetUser = await checkTarget(target, true);
            if (!targetUser.alreadyExists && targetUser.user) {
                ChatMessages.glimboiMessage("User addded to GlimBoi!");
                addUserTable(targetUser.user);
            } else {
                ChatMessages.glimboiMessage("User already exists!");
            }
        } else if (attemptedAction == "canRemoveUsers") {
            let userExists = await UserHandle.findByUserName(target);
            if (userExists == "ADDUSER") {
                ChatMessages.glimboiMessage("That user is not added to GlimBoi.");
            } else {
                let userRemoved = await UserHandle.removeUser(target, false, user);
                ChatMessages.filterMessage(`${userRemoved} removed from GlimBoi.`, "glimboi");
                removeUserFromTable(userRemoved);
            }
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
async function addQuoteChat(user: string, data, creator: string) {
    if (await permissionCheck(user, "canAddQuotes", "add quotes")) {
        console.log(creator, data.message);
        let trimMessage = 10 + creator.length + 2;
        let quoteResult = await QuoteHandle.addquote(creator.toLowerCase(), data.message.substring(trimMessage), user.toLowerCase());
        if (quoteResult == "QUOTEFINISHED") {
            ChatMessages.glimboiMessage(`Quote added.`);
        } else {
            ChatMessages.glimboiMessage(`That user does not exist.`);
        }
    }
}

/**
 * Removes a quote by username and ID. The paramaters are converted just to be safe.
 * @param {String} user The user who is removing the quote
 * @param {string} creator The creator of the quote
 * @param {Number} id The ID of the quote.
 */
async function delQuoteChat(user: string, creator: string, id: number) {
    if (await permissionCheck(user, "canRemoveQuotes", "remove quotes")) {
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
async function removeCommand(user: string, command: commandName) {
    if (await permissionCheck(user, "canRemoveCommands", "remove commands")) {
        if (command.startsWith("!")) {
            command = command.substring(1)
        }
        let commandExists = await CommandHandle.findCommand(command);
        if (commandExists !== null) {
            CommandHandle.removeCommand(command);
            ChatMessages.filterMessage("Command Removed", 'glimboi');
            removeCommandFromTable(command);
        } else {
            ChatMessages.filterMessage("That command does not exist", 'glimboi');
        }
    }
}


/**
 * Checks if the user has the sufficient rank to add a command and if so sends it to the filter.
 * @param {string} user The user who is adding the command
 * @param {string} command The command name
 * @param {string} commandData The command data
 * @param {string} type !command or !cmd
 */
async function addCommand(user: string, command: commandName, commandData: string, type: "!command" | "!cmd") {
    if (await permissionCheck(user, "canAddCommands", "add commands")) {
        command = command.toLowerCase()
        if (command == null || command == undefined || command == "" || command == " ") {
            ChatMessages.filterMessage("The command name was not valid. The syntax should look something like this: !cmd add !NAME RESPONSE . This may vary depending on the syntax used.", "glimboi");
            return
        }
        if (type == "!command") {
            commandData = commandData.substring(12 + command.length + 2);
            console.log(commandData);
        } else {
            commandData = commandData.substring(8 + command.length + 2);
            console.log(commandData);
        }
        commandData = commandData.trim()
        if (commandData == null || commandData == undefined || commandData == "" || commandData == " ") {
            ChatMessages.filterMessage("The command data was not valid. The syntax should look something like this: !cmd add !NAME RESPONSE . This may vary depending on the syntax used. ");
            return
        }
        command = command.replace(new RegExp("^[\!]+"), "").trim();
        console.log(command, commandData);
        let commandExists = await CommandHandle.findCommand(command);
        if (commandExists !== null) {
            console.log(command + " already exists.");
            ChatMessages.filterMessage(command + " already exists", "glimboi");
        } else {
            let newCMD = CommandHandle.addCommand({ commandName: command, uses: 0, points: 0, cooldown: 0,
                rank: "Everyone", repeat: false, shouldDelete: false, disabled: false,
                actions: [new CommandHandle.ChatAction.ChatMessage({ message: commandData })]
            });
            ChatMessages.filterMessage(command + " added!", "glimboi");
            try {
                addCommandTable({ commandName: command, uses: 0, points: 0, rank: "Everyone", actions: newCMD.actions })
            } catch (e) {}
        }
    }
}


/**
 * Returns a list of all commands to chat.
 */
async function commandList() {
    let cmdList: string[] = [];
    let cmds = await CommandHandle.getAll();
    for (let index = 0; index < cmds.length; index++) {
        cmdList.push(cmds[index].commandName);
    }
    let cmdmsg = cmdList.toString();
    if (cmdmsg.length == 0) {
        cmdmsg = "This streamer does not yet have any custom commands."
    } else if (cmdmsg.length > 255) {
        cmdmsg = "This streamer has so many commands we can't post them all to chat!"
    }
    ChatMessages.filterMessage(cmdmsg);
}

/**
 * Returns a users rank
 * @param {string} user The user who we need the rank for
 */
async function getRank(user: string) {
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
    return !isNaN(amount);
}

/**
 * Adds points if the rank has permission
 * @param {string} user The user who is adding points
 * @param {user} target The target user who will be affected
 * @param {number} count The amount of points to add
 */
async function addPointsChat(user: string, target: string, count:string | number | undefined) {
    if (await permissionCheck(user, "canAddPoints", "add points")) {
        if (!targetCheck(target, "The target was not included. !points add Mytho 100")) return;
        if (checkAmount(count) == true) {
            count = Math.round(Number(count));
            let targetExists = await UserHandle.findByUserName(target);
            if (targetExists !== "ADDUSER") {
                UserHandle.addPoints(target, count);
                ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were added to ${target}`, "glimboi");
            } else {
                let userAdded = await UserHandle.addUser(target, false, user);
                if (userAdded !== "INVALIDUSER") {
                    ChatMessages.filterMessage(`${target} has been added to glimboi.`, "glimboi");
                    UserHandle.addPoints(target, count);
                    ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were added to ${target}`, "glimboi");
                } else {
                    ChatMessages.filterMessage(`${target} was not found. Ensure the name is typed correctly.`, "glimboi");
                }
            }
        } else {
            ChatMessages.filterMessage(`${count} is an invalid number.`, "glimboi");
        }
    }
}

/**
 * Removes points from a user
 * @param {string} user The user who is removing points
 * @param {string} target Who is about to lose points
 * @param {number} count How many points will be removed
 */
async function removePointsChat(user: string, target: string, count: number | string | undefined) {
    if (await permissionCheck(user, "canRemovePoints", "remove points")) {
        if (!targetCheck(target, "The user was not included. !points sub Mytho 100")) return;
        if (checkAmount(count) == true) {
            count = Math.round(Number(count));
            let targetExists = await UserHandle.findByUserName(target);
            if (targetExists !== "ADDUSER") {
                if ((targetExists.points - count) < 0) {
                    UserHandle.editUserPoints(target, 0);
                    ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were removed from ${target}`, "glimboi");
                } else {
                    UserHandle.removePoints(target, count);
                    ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were removed from ${target}`, "glimboi");
                }
            } else {
                let userAdded = await UserHandle.addUser(target, false, user);
                if (userAdded !== "INVALIDUSER") {
                    if (((userAdded as UserType).points - count) < 0) {
                        UserHandle.editUserPoints(target, 0);
                        ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were removed from ${target}`, "glimboi");
                    } else {
                        UserHandle.removePoints(target, count);
                        ChatMessages.filterMessage(`${count} ${CacheStore.get("pointsName", "Points")} were removed from ${target}`, "glimboi");
                    }
                } else {
                    ChatMessages.filterMessage(`${target} was not found. Ensure the name is typed correctly.`, "glimboi");
                }
            }
        } else {
            ChatMessages.filterMessage(`${count} is an invalid number.`, "glimboi");
        }
    }
}

/**
 * Sets a point amount to a user
 * @param {string} user The user who is editing points
 * @param {string} target The user who is getting a new point value
 * @param {number} count The amount of points that will be set
 */
async function editPointsChat(user:string, target:string, count:number | string | undefined) {
    if (await permissionCheck(user, "canEditPoints", "edit points")) {
        if (!targetCheck(target, "The user was not included. !points set Mytho 100")) return;
        if (checkAmount(count) == true) {
            count = Math.round(Number(count));
            let targetExists = await UserHandle.findByUserName(target);
            if (targetExists !== "ADDUSER") {
                UserHandle.editUserPoints(target, count);
                ChatMessages.filterMessage(`${target} now has ${count} ${CacheStore.get("pointsName", "Points")}`, "glimboi");
            } else {
                let userAdded = await UserHandle.addUser(target, false, user);
                if (userAdded !== "INVALIDUSER") {
                    ChatMessages.filterMessage(`${target} has been added to glimboi.`);
                    UserHandle.editUserPoints(target, count);
                    ChatMessages.filterMessage(`${target} now has ${count} ${CacheStore.get("pointsName", "Points")}`, "glimboi");
                } else {
                    ChatMessages.filterMessage(`${target} was not found. Ensure the name is typed correctly.`, "glimboi");
                }
            }
        } else {
            ChatMessages.filterMessage(`${count} is an invalid number.`, "glimboi");
        }
    }
}

/**
 * Returns the amount of points a user has (other than self)
 * @param {string} user The user who is requesting points
 * @param {string} target The user who you are getting the points for
 */
async function getPointsChat(user: string, target: string) {
    if (!targetCheck(user, "The user was not specified. ex. !points get Mytho")) return;
    let targetExists = await UserHandle.findByUserName(target);
    if (targetExists !== "ADDUSER") {
        ChatMessages.filterMessage(`${target} has ${targetExists.points} ${CacheStore.get("pointsName", "Points")}`, "glimboi");
    } else {
        let newUser = await UserHandle.addUser(target, false, user);
        if (newUser !== "INVALIDUSER") { getPointsChat((newUser as UserType).userName, target) } else {
            ChatMessages.filterMessage(`${target} was not found. Ensure the name is typed correctly and the user exists in glimboi.`, "glimboi");
        }
    }
}

/**
 * Returns the amount of points a user has
 * @param {string} user Who we are gettign the points for
 */
async function getOwnPointsChat(user: string) {
    if (!targetCheck(user, "The user was not specified. ex. !points get Mytho")) return;
    let userExists = await UserHandle.findByUserName(user);
    if (userExists !== "ADDUSER") {
        ChatMessages.filterMessage(`${userExists.userName} has ${userExists.points} ${CacheStore.get("pointsName", "Points")}`, "glimboi");
    } else {
        let newUser = await UserHandle.addUser(user, false, user)
        if (newUser !== "INVALIDUSER") {
            ChatMessages.filterMessage(`${(newUser as UserType).userName} has ${(newUser as UserType).points} ${CacheStore.get("pointsName", "Points")}`, "glimboi");
        } else {
            ChatMessages.filterMessage(`${user} was not found.`, "glimboi");
        }
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
                    ChatMessages.filterMessage(`Number ${pointsPosition + 1} is ${topPoints[pointsPosition].userName} with ${topPoints[pointsPosition].points}`)
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
            ChatMessages.filterMessage(`The top user is ${topPoints[0].userName}`, "glimboi");
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
async function nextSong(user:string, action) {
    if (await permissionCheck(user, "canControlMusic", "control the music player")) {
        if (action == "set") {
            if (musicPlaylist[currentSongIndex]) {
                nextOrPrevious("foward");
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        } else {
            if (musicPlaylist[currentSongIndex]) {
                if (currentSongIndex + 1 >= musicPlaylist.length) {
                    ChatMessages.filterMessage(`Next up is ${musicPlaylist[0].name}`, "glimboi");
                } else {
                    ChatMessages.filterMessage(`Next up is ${musicPlaylist[currentSongIndex + 1].name}`, "glimboi")
                }
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        }
    }
}

/**
 * Sets or gets the previous song
 * @param {string} user The user who is requesting or setting the song
 * @param {string} action Are we setttng or getting the song?
 */
async function previousSong(user: string, action: string) {
    if (await permissionCheck(user, "canControlMusic", "control the music player")) {
        if (action == "set") {
            if (musicPlaylist[currentSongIndex]) {
                nextOrPrevious("backward");
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        } else {
            if (musicPlaylist[currentSongIndex]) {
                if (currentSongIndex - 1 < 0) {
                    ChatMessages.filterMessage(`Last song was ${musicPlaylist[0].name}`, "glimboi");
                } else {
                    ChatMessages.filterMessage(`Last song was ${musicPlaylist[currentSongIndex - 1].name}`, "glimboi")
                }
            } else {
                ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
            }
        }
    }
}

/**
 * Enables or Disbles repeat.
 * @param {string} user The user who is wanting to replay a song
 */
async function replaySong(user: string) {
    if (await permissionCheck(user, "canControlMusic", "control the music player")) {
        if (musicPlaylist[currentSongIndex]) {
            toggleShuffleRepeat(document.getElementById("repeatButton"), !repeatEnabled, "Repeat");
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
async function toggleShuffle(user: string) {
    if (await permissionCheck(user, "canControlMusic", "control the music player")) {
        if (musicPlaylist[currentSongIndex]) {
            toggleShuffleRepeat(document.getElementById("shuffleButton"), !shuffleEnabled, "Shuffle")
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
async function playPause(user: string, action) {
    if (await permissionCheck(user, "canControlMusic", "control the music player")) {
        if (musicPlaylist[currentSongIndex]) {
            toggleMusic()
        } else {
            ChatMessages.filterMessage("No songs are in the queue.", "glimboi")
        }
    }
}

/**
 * Check that a giveaway can be started and checks the rank of a user. If passed, starts the giveaway.
 * @param {string} user The user who is wanting to start a giveaway.
 */
async function checkAndStartGiveaway(user: string) {
    if (EventHandle.isEventEnabled("giveaway")) {
        if (await permissionCheck(user, "canStartEvents", "start giveaways")) {
            EventHandle.giveaway.startGiveaway(true, user);
        }
    } else {
        ChatMessages.filterMessage("Giveaway is not enabled.", "glimboi");
    }
}

/**
 * Checks if a raffle can be started and if so starts it
 * @param {string} user The user who is wanting to start a raffle.
 */
async function checkAndStartRaffle(user: string) {
    if (EventHandle.isEventEnabled("raffle")) {
        if (await permissionCheck(user, "canStartEvents", "start raffles")) {
            EventHandle.raffle.startRaffle(user, true);
        }
    } else {
        ChatMessages.filterMessage("Raffle is not enabled.", "glimboi");
    }
}

/**
 * Checks if Glimrealm can be started and if so starts it
 * @param {string} user The user who is wanting to start Glimrealm.
 */
async function checkAndStartGlimrealm(user: string) {
    if (EventHandle.isEventEnabled("glimrealm")) {
        if (await permissionCheck(user, "canStartEvents", "start glimrealm")) {
            EventHandle.glimRealm.openGlimRealm(false);
        }
    } else {
        ChatMessages.filterMessage("Glimrealm is not enabled.", "glimboi");
    }
}

/**
 * Checks if a bankheist can be started and if so starts it
 * @param {string} user The user who is wanting to start a bankheist.
 */
async function checkAndStartBankheist(user: string) {
    if (EventHandle.isEventEnabled("bankheist")) {
        if (await permissionCheck(user, "canStartEvents", "start bankheist")) {
            EventHandle.bankHeist.startBankHeist(user, false);
        }
    } else {
        ChatMessages.filterMessage("Bankheist is not enabled.", "glimboi");
    }
}

/**
 * Checks if duel can be started and if so starts it
 * @param {string} user The user who is wanting to start a duel.
 */
async function checkAndStartDuel(user: string, opponent: string, wager: number) {
    if (EventHandle.isEventEnabled("duel")) {
        if (await permissionCheck(user, "canStartEvents", "start duel")) {
            EventHandle.duel.challengeUser(user, opponent, Number(wager));
        }
    } else {
        ChatMessages.filterMessage("Duel is not enabled.", "glimboi");
    }
}

/**
 * Checks if Glimroyale can be started and if so starts it
 */
async function checkAndStartGlimroyale(user: string, wager: number) {
    wager = Number(wager);
    if (EventHandle.isEventEnabled("glimroyale")) {
        if (await permissionCheck(user, "canStartEvents", "start glimroyale")) {
            if (typeof wager == "number" && isNaN(wager) == false) {
                let glimroyaleUser = await UserHandle.findByUserName(user);
                if (glimroyaleUser !== "ADDUSER" && glimroyaleUser.points >= wager) {
                    EventHandle.glimroyale.startGlimRoyale(user, wager);
                } else {
                    ChatMessages.filterMessage("You do not have enough currency to start Glimrealm.", "glimboi");
                }
            } else {
                ChatMessages.filterMessage("Wager must be a number.", "glimboi");
            }
        }
    } else {
        ChatMessages.filterMessage("Glimroyale is not enabled.", "glimboi");
    }
}


async function checkPoll(user: string, message: string | undefined) {
    if (EventHandle.isEventEnabled("poll")) {
        if (await permissionCheck(user, "canStartEvents", "start polls")) {
            console.log(user, message);
            if (message && message.length > 0) {
                let hasQuestion = message.indexOf("?") !== -1;
                if (hasQuestion) {
                    let questionEnd = message.indexOf("?");
                    let question = message.substring(6, questionEnd);
                    let messageWithoutQuestion = message.substring(questionEnd + 1);
                    let hasOptions = messageWithoutQuestion.indexOf("|") !== -1;
                    if (hasOptions) {
                        let possibleAnswers = messageWithoutQuestion.split('|');
                        console.log(possibleAnswers);
                        for (let index = 0; index < possibleAnswers.length; index++) {
                            possibleAnswers[index] = possibleAnswers[index].trim();
                        }
                        console.log(possibleAnswers, messageWithoutQuestion);
                        EventHandle.poll.startPoll(question, possibleAnswers, user);
                    } else {
                        ChatMessages.filterMessage("You need to specify an option. !poll question? option1 | option2 | etc", "glimboi");
                    }
                } else {
                    ChatMessages.filterMessage("Please ask a question. !poll question? option1 | option2 | etc ", "glimboi");
                }
            } else {
                ChatMessages.filterMessage("Incorrect syntax. Try !poll question? option1 | option2 | etc. Make sure to end the question with?", "glimboi");
            }
        }
    } else {
        ChatMessages.filterMessage("Poll is not enabled.", "glimboi");
    }
}

/**
 * Asks the 8ball for an answer.
 * @param user The username of the user
 * @param message The message which should contain the command and question
 * @returns
 */
async function eightBall(user:string, message: string) {
    if (CacheStore.get("eightBallEnabled", true, true)) {
        if (message.trim().length <= 6) {
            return ChatMessages.filterMessage("You must specify a question to get a response. !8ball question?", "glimboi");
        }
        let possibleResponses = [
            `@${user}, It is Certain.`,
            `@${user}, It is decidedly so.`,
            `@${user}, Without a doubt.`,
            `@${user}, Yes, definitely.`,
            `@${user}, You may rely on it.`,
            `@${user}, As I see it, yes.`,
            `@${user}, Most likely.`,
            `@${user}, Outlook good.`,
            `@${user}, Yes.`,
            `@${user}, Signs point to yes.`,
            `@${user}, Reply hazy, try again.`,
            `@${user}, Ask again later.`,
            `@${user}, Better not tell you now.`,
            `@${user}, Cannot predict now.`,
            `@${user}, Concentrate and ask again.`,
            `@${user}, Don't count on it.`,
            `@${user}, My reply is no.`,
            `@${user}, My sources say no.`,
            `@${user}, Outlook not so good.`,
            `@${user}, Very doubtful.`,
        ];
        let responseNumber = Math.round(Math.random() * possibleResponses.length);
        ChatMessages.filterMessage(possibleResponses[responseNumber], "glimboi");
    } else {
        ChatMessages.filterMessage(`@${user}, 8ball is not enabled.`, "glimboi");
    }
}


function gamble(user: string, message) {
    if (CacheStore.get("gambleEnabled", true, true)) {
        let splitMessage: string[] = message.split(" ");
        let amount: number = parseInt(splitMessage[1]);
        if (isNaN(amount) || amount <= 0) {
            ChatMessages.filterMessage(`${user}, Please respond with a number indicating your response. ex. !gamble 1`, "glimboi");
        } else {
            EventHandle.gamble.gamble(user, amount);
        }
    } else {
        ChatMessages.filterMessage(`${user}, Gamble is not enabled`, "glimboi");
    }
}

/**
 * Sends a message to the user that they do not have permission to perform the action.
 * @param {string} user The user who wanted to perform the action.
 * @param {string} attemptedAction The action they attempted to perform.
 */
function invalidPerms(user:string, attemptedAction:string) {
    ChatMessages.filterMessage(`${user} does not have permission to ${attemptedAction}.`, "glimboi");
}

/**
 * Checks to see if a target exists. If not sends a message to chat about it
 * @param target
 * @param message
 * @returns
 */
function targetCheck(target: any, message = "No target specified."): boolean {
    if (target && target.length > 0) {
        return true;
    } else {
        ChatMessages.filterMessage(message, "glimboi");
        return false;
    }
}


/**
 * Checks if the user has permission to do an action.
 * @param {string} user The user who is wanting to do an action.
 * @param {string} action The action the user is trying to do.
 * @param {string} friendlyAction The user freindy version of the action.
 */
async function permissionCheck(user:string, action: rankProperties, friendlyAction: string): Promise<boolean> {
    user = user.toLowerCase();
    let hasPerms = await RankHandle.rankController(user, action, "string"); // get the rank check result
    if (hasPerms == false) { // They don't have permission
        invalidPerms(user, friendlyAction);
        return false
    } else if (hasPerms == null) { // They don't exist yet
        let newUser = await UserHandle.addUser(user, false, user); // Add them as a user and rerun this check
        if (newUser !== "INVALIDUSER") {
            return await permissionCheck((newUser as UserType).userName, action, friendlyAction);
        } else {
            return false; // The user doesn't exist, this shouldn't happen. false is returned to prevent an infinite loop
        }
    } else {
        return true; // The user has permission
    }
}

async function checkTarget(user:string, addUser: boolean): Promise<{alreadyExists: boolean, user: UserType | null | false}> {
    let userExists = await UserHandle.findByUserName(user);
    if (userExists == "ADDUSER") {
        if (addUser) {
            let newUser = await UserHandle.addUser(user, false, user);
            if (newUser !== "INVALIDUSER") {
                return {alreadyExists: false, user: newUser as UserType}
            } else {
                ChatMessages.filterMessage(`${user} does not exist on Glimesh.`, "glimboi");
                return {alreadyExists: false, user: null}
            }
        } else {
            ChatMessages.filterMessage(`${user} has not been added to Glimboi.`, "glimboi");
            return {alreadyExists: false, user: false}
        }
    } else {
        return {alreadyExists: true, user: userExists}
    }
}

export {
    addCommand, addPointsChat, addQuoteChat, commandList, checkAndStartBankheist, checkAndStartDuel, checkAndStartGiveaway,
    checkAndStartGlimrealm, checkAndStartGlimroyale, checkAndStartRaffle, checkPoll, delQuoteChat,
    editPointsChat, eightBall, gamble, getOwnPointsChat, getPointsChat, getRank, getSong, getTopPoints, modifyUserFromChat, nextSong, playPause,
    previousSong, randomQuoteChat, removeCommand, removePointsChat, replaySong, toggleShuffle
}