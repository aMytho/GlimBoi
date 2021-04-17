/**
 * For standard chat message functions
 */

/**
 * Filters a message to prepare it for sending. If it cannot be sent we send a message to chat notifying the stream.
 * @param {string} message The chat message to be sent to chat
 * @param {string} source Where the emssage is coming from. Either user or glimboi
 */
function filterMessage(message, source) {
  	if (source !== 'user' && message.startsWith('!')) {
    	console.log(`Tried to send the message ${message} but that might be an infinite loop, so we stopped`); // Typo - {$message}
    	sendMessage("Hi, we detected the potential for an infinite loop, and hopefully stopped it? Check your command response!");
    	return;
  	}
  	if (message.length == 0 ) {
    	console.log("Message was not long enough or no message was sent.");
    	ChatMessages.sendMessage("The message was not long enough or no message was sent.")
    	return
  	}
  	if (source == "user") {
    	if (message.length > 255) {
      		ChatMessages.sendMessage("The command/message was too long to send.");
    	} else {
      		message = message.replace(/[\t\r\n""]+/g, "");
      		ChatMessages.sendMessage(message);
    	}
  	} else {
    	if (message.length > 255) {
      		ChatMessages.glimboiMessage("The command/message was too long to send.");
    	} else {
      		message = message.replace(/[\t\r\n""]+/g, "");
      		ChatMessages.glimboiMessage(message);
    	}
  	}
}


/**
 * Sends a message to chat. This function is called when a user presses send.
 * @param {string} data A message to be sent to chat
 */
function sendMessage(data) {
  	var msgArray = ["6","7","__absinthe__:control","doc"]; // array of data to send to glimesh
  	// adds the message to it.
  	msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\""+chatID+"\",message:{message:\""+data+"\"}) {message }}","variables":{}});
  	var test = JSON.stringify(msgArray); // make it sendable (json)
  	try {
    	console.log(test)
    	ChatHandle.getConnection().send(test) // sends it to chat!
  	} catch(e) {
    	console.log(e);
    	errorMessage("Auth Error", "The bot must be authenticated for this feature to work. You must be in a chat to send a message.")
  	}
}

/**
 * Sends a message to chat as the bot. This is not from a user pressing send.
 * @param {string} data The message to be sent to chat
 */
function glimboiMessage(data) {
  	var msgArray = ["6","7","__absinthe__:control","doc"];
  	msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\"" + chatID +"\", message:{message:\""+data+"\"}) {message }}","variables":{}});
  	var test = JSON.stringify(msgArray);
  	try {
    	//console.log(test)
    	ChatHandle.getConnection().send(test)
  	} catch(e) {
    	console.log(e);
    	errorMessage("Message Error", "Message failed to send. You must be authenticated and be in a chat to send a message.")
  	}
}

/**
 * Logs the message in the UI. Send a message to the main process to log the file if enabled.
 * @param {string} user The user who said the message
 * @param {string} message The message
 * @param {string} avatar The avatar URL
 */
function logMessage(user, message, avatar) {
  	var adminClass = (user === ChatHandle.getBotName()) ? 'admin_chat' : '';

  	$("#chatList").append(`
    	<li class="left clearfix ${adminClass} w-100" name='${user}' oncontextmenu='loadChatContextMenu(event)'>
      		<div class="chat-body1 clearfix testing" name='${user}'>
      			<span class="chat-img1 pull-left" name='${user}'>
        			<img src="${avatar}" alt="User Avatar" class="rounded-circle" name='${user}'>
      			</span>
      			<p name='${user}'><span id="chatUser" name='${user}' >${user}: </span> ${message}</p>
      			<!--<div class="whiteText pull-left">09:40PM</div> -->
      		</div>
    	</li>`
  );
  	var scroll = document.getElementById("chatContainer")
  	scroll.scrollTo(0,document.getElementById("chatList").scrollHeight);

  	if (ChatSettings.isLoggingEnabled() == true) {
    	ipcRenderer.send("logMessage", {message: message, user: user}) // tell the main process to log this to a file.
  	}
}

module.exports = { filterMessage, glimboiMessage, logMessage, sendMessage };