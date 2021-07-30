/**
 * For standard chat message functions
 */

/**
 * Filters a message to prepare it for sending. If it cannot be sent we send a message to chat notifying the stream.
 * @param {string} message The chat message to be sent to chat
 * @param {string} source Where the emssage is coming from. Either user or glimboi
 */
function filterMessage(message:string, source?: "user" | "glimboi") {
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
      		ChatMessages.glimboiMessage(message, false);
    	}
  	}
}


/**
 * Sends a message to chat. This function is called when a user presses send.
 * @param {string} data A message to be sent to chat
 */
function sendMessage(data:message) {
  	var msgArray:any = ["6","7","__absinthe__:control","doc"]; // array of data to send to glimesh
  	// adds the message to it.
  	msgArray.splice(4, 0, {"query":"mutation {createChatMessage(channelId:\""+chatID+"\",message:{message:\""+data+"\"}) {message }}","variables":{}});
  	var test = JSON.stringify(msgArray); // make it sendable (json)
  	try {
    	console.log(test)
    	let websocketConnetion = ChatHandle.getConnection();
        if (websocketConnetion.readyState !== 2 && websocketConnetion.readyState !== 3) {
            websocketConnetion.send(test);
        } else {
            throw "Socket error, probably not logged in yet"
        }
  	} catch(e) {
    	console.log(e);
    	errorMessage("Auth Error", "The bot must be authenticated for this feature to work. You must be in a chat to send a message.")
  	}
}

/**
 * Sends a message to chat as the bot. This is not from a user pressing send.
 * @param {string} data The message to be sent to chat
 */
function glimboiMessage(data: message, logError: boolean = false) {
    var msgArray: any = ["6", "7", "__absinthe__:control", "doc"];
    msgArray.splice(4, 0, { "query": "mutation {createChatMessage(channelId:\"" + chatID + "\", message:{message:\"" + data + "\"}) {message }}", "variables": {} });
    var test = JSON.stringify(msgArray);
    try {
        //console.log(test)
        ChatHandle.getConnection().send(test)
    } catch (e) {
        if (logError) {
            console.log(e);
            errorMessage("Message Error", "Message failed to send. You must be authenticated and be in a chat to send a message.")
        }
    }
}

/**
 * Logs the message in the UI. Send a message to the main process to log the file if enabled.
 * @param {string} user The user who said the message
 * @param {string} message The message
 * @param {string} avatar The avatar URL
 * @param {boolean} isReload Is this reloading all the messages for the chat page, or a new message?
 * @param {number} messageID The ID of the message from glimesh chat
 */
function logMessage(user:userName, message:message, avatar:avatar, isReload: boolean, messageID:number, state:messageState) {
    try {
        var adminClass = (user === ChatHandle.getBotName()) ? 'admin_chat' : '';

        $("#chatList").append(`
          <li class="left clearfix ${adminClass} ${state} w-100" name='${user}' title="${getMessageHoverTitle(state)}">
                <div contentLocation="1" class="chat-body1 clearfix testing" name='${user}' oncontextmenu="loadChatContextMenu(event)">
                    <span class="chat-img1 pull-left" name='${user}'>
                      <img src="${avatar}" alt="User Avatar" class="rounded-circle" name='${user}'>
                    </span>
                    <p name='${user}' messageID='${messageID}'><span id="chatUser" name='${user}' >${user}: </span> ${message}</p>
                    <!--<div class="whiteText pull-left">09:40PM</div> -->
                </div>
          </li>`
    );
        var scroll = document.getElementById("chatContainer")
        scroll!.scrollTo(0,document.getElementById("chatList").scrollHeight);

        if (ChatSettings.isLoggingEnabled() == true && isReload == false) {
          ipcRenderer.send("logMessage", {message: message, user: user}) // tell the main process to log this to a file.
        }
    } catch (e) {

    }
}

function getMessageHoverTitle(state:messageState) {
    switch (state) {
        case "ban": return "Message removed due to ban."
        case "deleted": return "Message deleted by manual deletion"
        case "none": return ""
        case "timeout": return "Message removed due to timeout."
        default:
            break;
    }
}

export { filterMessage, glimboiMessage, logMessage, sendMessage }