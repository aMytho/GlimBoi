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
    	sendMessage("The message was not long enough or no message was sent.")
    	return
  	}
  	if (source == "user") {
    	if (message.length > 255) {
      		sendMessage("The command/message was too long to send.");
    	} else {
      		message = message.replace(/[\t\r\n""]+/g, "");
      		sendMessage(message);
    	}
  	} else {
    	if (message.length > 255) {
      		glimboiMessage("The command/message was too long to send.");
    	} else {
      		message = message.replace(/[\t\r\n""]+/g, "");
      		glimboiMessage(message, false);
    	}
  	}
}


/**
 * Sends a message to chat. This function is called when a user presses send.
 * @param {string} data A message to be sent to chat
 */
function sendMessage(data:message) {
  	try {
    	let websocketConnetion = ChatHandle.getConnection();
        if (websocketConnetion.readyState !== 2 && websocketConnetion.readyState !== 3) {
            ApiHandle.sendMessage(data);
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
    try {
        ApiHandle.sendMessage(data);
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
function logMessage(user:userName, message:message, avatar:avatar, isReload: boolean, messageID:number, state:messageState, messageTokens) {
    let tokens = getTokens(messageTokens);
    try {
        let adminClass = (user === ChatHandle.getBotName()) ? 'admin_chat' : '';
        let htmlOfTokens = ``;
        tokens.forEach(token => {
            htmlOfTokens += token.outerHTML;
        });
        $("#chatList").append(`
          <li class="left clearfix ${adminClass} ${state} w-100" name='${user}' title="${getMessageHoverTitle(state)}">
                <div contentLocation="1" class="chat-body1 clearfix testing" name='${user}' oncontextmenu="loadChatContextMenu(event)">
                    <span class="chat-img1 pull-left" name='${user}'>
                      <img src="${avatar}" alt="User Avatar" class="rounded-circle" name='${user}'>
                    </span>
                    <p name='${user}' messageID='${messageID}'><span id="chatUser" name='${user}' >${user}: </span> ${htmlOfTokens} </p>
                </div>
          </li>`
          );

        let scroll = document.getElementById("chatContainer")
        scroll!.scrollTo(0,document.getElementById("chatList").scrollHeight);
        // log to file
        if (!isReload) {
            ChatLogger.logMessageToFile(user, message);
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

function getTokens(tokens: any[]) {
    tokens.map((token, index, tokens) => {
        if (token.src) {
            let img = document.createElement("img");
            img.src = token.src;
            img.className = "mustBe40"
            tokens[index] = img;
        } else if (token.url) {
            let a = document.createElement("a");
            a.href = "#"
            a.innerText = token.text;
            a.title = "Copy the link in a browser to view its contents"
            tokens[index] = a;
        } else if (token.text) {
            let p = document.createElement("span") as HTMLSpanElement;
            p.innerText = token.text;
            tokens[index] = p;
        }
    })
    return tokens
}

export { filterMessage, getTokens, glimboiMessage, logMessage, sendMessage }