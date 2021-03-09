// This file handles chat function such as adding commands, adding users, etc

/**
 * Adds a user from Glimesh chat.
 * @param {string} user The user who will be added
 */
function addUserChat(user) {
  UserHandle.addUser(user, false).then(data => {
    if (data == "USEREXISTS") {
      ChatMessages.glimboiMessage("That user is already added to GlimBoi.")
    } else if (data == "INVALIDUSER") {
      ChatMessages.glimboiMessage("That user does not exist on Glimesh.")
    } else {
      ChatMessages.glimboiMessage("User addded to GlimBoi!")
    }
  })
}

/**
 * Removes a user from chat
 * @param {string} user User to be removed
 */
function delUserChat(user) {
  var exists = UserHandle.findByUserName(user);
  exists.then(data => {
    if (data == "ADDUSER") {
      ChatMessages.glimboiMessage("No user was found with that name in GlimBoi.")
    } else {
      UserHandle.removeUser(user).then(deletedUser => { //removes the user from the db. Shows us afterwords
        removeUserFromTable(deletedUser);
        ChatMessages.glimboiMessage("User removed!")
      })
    }
  })
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
function addQuoteChat(data, user) {
  console.log(user, data.message);
  var trimMessage = 10 + user.length + 2
  QuoteHandle.addquote(user.toLowerCase(), data.message.substring(trimMessage)).then(data => {
    if (data == "QUOTEFINISHED") {
      ChatMessages.glimboiMessage(`Quote added.`)
    } else {
      ChatMessages.glimboiMessage(`That user does not exist.`)
    }
  })
}

/**
 * Removes a quote by username and ID. The paramaters are converted just to be safe.
 * @param {String} user The user who said the quote
 * @param {Number} id The ID of the quote.
 */
function delQuoteChat(user, id) {
  ChatHandle.glimboiMessage("This action will be supported in a future update. Until then you can delete quotes from the users page.");
  return
  // The below code will be in place after the rank system exists/
    console.log(user, id);
    if (user == "" || user == " " || id == "" || id == " " || user == undefined || id == undefined) {
      ChatHandle.glimboiMessage("A user and an ID must be included. ex. !quote del mytho 2")
    } else {
      UserHandle.removeQuoteByID(Number(id), user.toLowerCase()).then(data => {
        if (data == "NOQUOTEFOUND") {
            ChatHandle.glimboiMessage("No quote was found with that ID.")
        } else {
            ChatHandle.glimboiMessage("Quote removed.")
        }
      })
    }
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

module.exports = {addQuoteChat, addUserChat, commandList, delQuoteChat, delUserChat, randomQuoteChat}