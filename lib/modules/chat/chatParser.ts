
function handleGlimeshMessage(chatMessage: incomingGlimeshMessage ) {
    let userChat: userName = chatMessage.user.username
    let messageChat = chatMessage.message;
    let userID = Number(chatMessage.user.id);
    console.log(userChat + ": " + messageChat);
    EventHandle.getCurrentEvents().forEach(element => {
        EventHandle.handleEvent(element, userChat, messageChat)
    });
    ChatStats.addCurrentUser(userChat);
    if (messageChat.startsWith("!")) { //If it is a command of some sort...
        let message = messageChat.split(" ");
        switch (message[0]) {
            case "!commands": // Returns a list of all commands
                ChatActions.commandList();
                break;
            case "!command":
            case "!cmd":
                switch (message[1]) {
                    case "add":
                    case "new":
                        ChatActions.addCommand(userChat.toLowerCase(), message[2], messageChat, message[0])
                        break;
                    case "del":
                    case "remove":
                    case "delete":
                        ChatActions.removeCommand(userChat.toLowerCase(), message[2].toLowerCase())
                        break;
                    case "":
                    case "help":
                    case "info":
                        CommandHandle.info()
                    default:
                        break;
                }
                break;
            case "!quote":
                switch (message[1]) {
                    case "":
                    case " ":
                    case null:
                    case undefined: // Returns a random quote
                        ChatActions.randomQuoteChat()
                        break;
                    case "add":
                    case "new": // adds a new quote
                        ChatActions.addQuoteChat(userChat.toLowerCase(), chatMessage.message, message[2])
                        break;
                    case "remove": // removes a quote
                    case "delete": // removes a quote
                    case "del": // removes a quote
                        ChatActions.delQuoteChat(userChat.toLowerCase(), message[2], Number(message[3]));
                        break;
                    default:
                        break;
                }
                break;
            case "!points":
            case `!${CacheStore.get("pointsName", "Points", false)}`:
            case `!${CacheStore.get("pointsName", "Points", false).toLowerCase()}`:
                switch (message[1]) {
                    case "":
                    case " ":
                    case null:
                    case undefined:
                        ChatActions.getOwnPointsChat(userChat);
                        break;
                    case "top":
                        ChatActions.getTopPoints()
                        break;
                    case "add":
                    case "+":
                    case "inc": ChatActions.addPointsChat(userChat, message[2], message[3])
                        break;
                    case "sub":
                    case "-":
                    case "del": ChatActions.removePointsChat(userChat, message[2], message[3])
                        break;
                    case "set":
                    case "=": ChatActions.editPointsChat(userChat, message[2], message[3])
                        break;
                    case "get": ChatActions.getPointsChat(userChat, message[2])
                        break;
                    case "help": ChatMessages.filterMessage("Syntax: !points ACTION(add,sub,set,get) USER(who you are targeting) COUNT(a number)", "glimboi")
                        break;
                    default:
                        ChatActions.getTopPoints(Number(message[1]), true);
                        break;
                }
                break;
            case "!test": ChatMessages.glimboiMessage("Test complete. If you have a command called test this replaced it.");
                break;
            case "!raffle": ChatActions.checkAndStartRaffle(userChat);
                break;
            case "!poll": ChatActions.checkPoll(userChat, messageChat);
                break;
            case "!glimrealm": ChatActions.checkAndStartGlimrealm(userChat);
                break;
            case "!bankheist": ChatActions.checkAndStartBankheist(userChat.toLowerCase());
                break;
            case "!duel": ChatActions.checkAndStartDuel(userChat, message[1], Number(message[2]));
                break;
            case "!giveaway": ChatActions.checkAndStartGiveaway(userChat);
                break;
            case "!glimroyale": ChatActions.checkAndStartGlimroyale(userChat, Number(message[1]));
                break;
            case "!8ball":
                ChatActions.eightBall(userChat, messageChat);
                break;
            case "!gamble":
                ChatActions.gamble(userChat, messageChat)
            break;
            case "!user":
                switch (message[1]) {
                    case "new":
                    case "add": // adds a user
                        ChatActions.modifyUserFromChat(userChat.toLowerCase(), message[2], "canAddUsers", "add users");
                        break;
                    case "remove":
                    case "del":
                    case "delete": // removes a user
                        ChatActions.modifyUserFromChat(userChat.toLowerCase(), message[2], "canRemoveUsers", "remove users");
                        break;
                    default:
                        break;
                }
                break;
            case "!rank": ChatActions.getRank(userChat.toLowerCase());
                break;
            case "!song": ChatActions.getSong();
                break;
            case "!sr":
                if (message[1] !== undefined) {
                    switch (message[1].toLowerCase()) {
                        case "current":
                        case "now":
                            ChatActions.getSong();
                            break;
                        case "next":
                        case "n":
                            ChatActions.nextSong(userChat, "get")
                            break;
                        case "last":
                        case "l":
                            ChatActions.previousSong(userChat, "get")
                            break;
                        case "skip": ChatActions.nextSong(userChat, "set")
                            break;
                        case "previous": ChatActions.previousSong(userChat, "set");
                            break;
                        case "repeat":
                        case "loop":
                            ChatActions.replaySong(userChat)
                            break;
                        case "shuffle":
                        case "random":
                            ChatActions.toggleShuffle(userChat)
                            break;
                        case "toggle":
                            ChatActions.toggleShuffle(userChat)
                            break;
                        //case "queue":
                        //case "list":
                        //ChatMessages.glimboiMessage("Feature coming soon");
                        //break;
                        default: ChatMessages.glimboiMessage("Command not known. Try !sr next, last, skip, previous, repeat, shuffle, toggle");
                            break;
                    }
                } else {
                    ChatMessages.glimboiMessage("Command not known. Try !sr next, last, skip, previous, repeat, shuffle, toggle");
                }
                break;
            default: //its not a glimboi command, may be a streamer command. We need to check and send the output to chat.
                CommandHandle.CommandRunner.checkCommand(chatMessage);
                break;
        }
    }
    try {
        ChatMessages.logMessage(userChat, messageChat, chatMessage.user.avatarUrl, false, Number(chatMessage.id), "none");
        globalChatMessages.push([userChat, messageChat, chatMessage.user.avatarUrl, Number(chatMessage.id), "none"]);
        globalChatMessages = globalChatMessages.slice(Math.max(globalChatMessages.length - 20, 0));
        ModHandle.ModPowers.scanMessage(userChat, messageChat.toLowerCase(), Number(chatMessage.id), userID) // filter the message if needed
    } catch (e3) {
        console.log(e3);
    }
    // Add a user message counter if it isn't the bot
    if (userChat !== ChatHandle.getBotName()) {
        ChatStats.increaseUserMessageCounter();
    }
}


export { handleGlimeshMessage }