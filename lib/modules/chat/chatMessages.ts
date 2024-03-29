
/**
 * Filters a message to prepare it for sending. If it cannot be sent we send a message to chat notifying the stream.
 * @param {string} message The chat message to be sent to chat
 * @param {string} source Where the emssage is coming from. Either user or glimboi
 */
function filterMessage(message: string): string {
    // Length checks
    if (message.length > 255) {
        console.log(`Message too long. Message: ${message}`);
        return "The command/message was too long to send.";
    } else if (message.length === 0) {
        console.log(`Message too short. Message: ${message}`);
        return "The command/message was too short to send.";
    }

    return message.replace(/[\t\r\n""]+/g, "");
}


/**
 * Sends a message to chat. This function is called when a user presses send.
 * @param {string} data A message to be sent to chat
 */
async function sendMessage(data: string, source: "user" | "glimboi" = "glimboi") {
    try {
        let websocketConnetion = ChatHandle.getConnection();
        if (websocketConnetion.readyState !== 2 && websocketConnetion.readyState !== 3) {
            // Filter the message so its safe to send
            let message = filterMessage(data);

            await ApiHandle.sendMessage(message);
        } else {
            throw "Socket error, probably not logged in yet"
        }
    } catch (e) {
        console.log(e);
        errorMessage("Auth Error", "The bot must be authenticated for this feature to work. You must be in a chat to send a message.")
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
async function logMessage(user: string, message: string, avatar: avatar, isReload: boolean, messageID: number, state: messageState, messageTokens, rankColor?: string) {
    let tokens = getTokens(messageTokens);
    try {
        let color = "#1C4965";
        if (rankColor) {
            color = rankColor;
        } else {
            let userData = await UserHandle.findByUserName(user);
            if (userData != "ADDUSER") {
                let userRank = await RankHandle.getRankPerms(userData.role);
                if (userRank) {
                    color = userRank.color;
                }
            }
        }

        let htmlOfTokens = ``;
        tokens.forEach(token => {
            htmlOfTokens += token.outerHTML;
        });

        let div = document.createElement("div");
        div.className = `p-2 flex flex-row gap-3 items-center`;
        div.innerHTML = `
            <img src="${avatar}" alt="User Avatar" class="h-10 w-10 rounded-lg" style="border-radius: 50%;">
                <p name='${user}' messageID='${messageID}' class="py-4 px-2 flex flex-row gap-2 rounded-xl" style="background: ${color} none repeat scroll 0 0">${user}: ${htmlOfTokens}</p>
              `
        document.getElementById("chatContainer").appendChild(div);
        let scroll = document.getElementById("chatContainer");
        scroll!.scrollTo(0, scroll.scrollHeight);
        // log to file
        if (!isReload) {
            ChatLogger.logMessageToFile(user, message);
        }
    } catch (e) {}
}

async function logMany(messages: Partial<storedChatMessage>[]) {
    let usersToRequest = messages.map(message => message[0].toLowerCase());
    console.log(usersToRequest);
    let users = await UserHandle.findManyUsers(usersToRequest);
    let ranks = await RankHandle.getManyRankPerms(users.map(user => user.role));
    messages.forEach(message => {
        let user = users.filter(user => user.userName === message[0].toLowerCase())[0];
        let rank = ranks.filter(rank => rank.rank === user.role)[0];
        let rankColor = rank ? rank.color : "#1C4965";
        logMessage(message[0], message[1], message[2], true, message[3], message[4], message[5], rankColor);
    });
}

function getMessageHoverTitle(state: messageState) {
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
            img.className = "h-10 w-10"
            tokens[index] = img;
        } else if (token.url) {
            let a = document.createElement("a");
            a.href = "#"
            a.innerText = token.text;
            a.title = "Copy the link in a browser to view its contents";
            a.classList.add("copyLink");
            a.style.color = "#007bff";
            tokens[index] = a;
        } else if (token.text) {
            let p = document.createElement("span") as HTMLSpanElement;
            p.innerText = token.text;
            tokens[index] = p;
        }
    })
    return tokens
}

export { getTokens, logMany, logMessage, sendMessage }