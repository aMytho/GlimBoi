let ChatSettings:typeof import("../modules/chat/chatSettings");
let ChatStats: typeof import("../modules/chat/chatStats");
let ChatMessages: typeof import("../modules/chat/chatMessages") = require(appData[0] + "/modules/chat/chatMessages.js");
let ChatLogger:typeof import("../modules/chat/chatLogging");
let chatID; // the channel ID
let reconnectDelay, currentChannelToRejoin;
let needsReconnect = false;
let reconnectMessage = false;

var contentTarget;
var contentBody;
var contentMessageID;
var globalChatMessages: storedChatMessage[];
var currentChatConnected = null;
let hasSentGuildedWebhook = false;
let hasSentDiscordWebhook = false;
let hasSentTwittwerWebhook = false;
let hasSentMatrixWebhook = false;
let ChatGuildedModal: Modal, ChatDiscordModal: Modal, ChatTwitterModal: Modal, ChatMatrixModal: Modal;

ChatChannels.updatePath(appData[1]);

/**
 * Gets the bot username for autofilling recent channels
 */
async function getBot(): Promise<null | string> {
    try {
        let token = AuthHandle.getToken();
        if (token == undefined || token.length == 0) { // No token, no bot name
            return null
        } else { // We have a token so we can request the name from glimesh
            return await ApiHandle.getBotAccount();
        }
    } catch (e) {
        console.log(e);
        return null
    }
}

// Usr clicks on autojoin button for a channel
function autoJoinChatButtons(e:HTMLInputElement) {
    let listing = e.parentElement.parentElement.parentElement;
    let channel = listing.getAttribute('data-channel');
    let channelid = listing.getAttribute('data-channelid');

    console.log(`Setting autoJoin for ${channel} to ${e.checked}`);

    // Set the selected channel to be auto-join
    ChatChannels.setAutoJoinChannelByID(channelid, e.checked).then(channel => {
        if (channel == null) {
            return;
        } else {
            let channelListings = document.getElementsByClassName("channel-listing");
            for (let i = 0; i < channelListings.length; i++) {
                if (channelListings[i].getAttribute("data-channelid") != channelid) {
                    (channelListings[i].children[2].firstElementChild.firstElementChild as HTMLInputElement).checked = false;
                }
            }
        }
    });
}

function deleteButtonsChat(e:HTMLInputElement) {
    let listing = e.parentElement.parentElement; // The channel row
    let channel = listing.getAttribute('data-channel');
    let channelid = listing.getAttribute('data-channelid');
    e.setAttribute("disabled", "true") // Disable delete btn

    if (currentChatConnected === channel) {
        currentChatConnected = null;
        ChatHandle.disconnect();
        needsReconnect = false;
    }

    listing.remove();
    ChatChannels.removeRecentChannelByID(channelid); // Remove from DB
}

// Join a chat? Set a timeout to avoid a race condition between disconnect and joinChat
async function joinChatButtons(e: HTMLElement) {
    let channel = e.parentElement.parentElement.getAttribute("data-channel");
    console.log("Trying to join a channel");
    //Joins a chat
    await joinChat(channel);
    needsReconnect = true;
    if (ChatHandle.isConnected() === false) {
        // Clear the right-side text of what channel we're connect to & reload channels after deletion
        let channelNameTitle = document.getElementById("channelConnectedName");
        channelNameTitle.classList.remove("text-success");
        channelNameTitle.classList.add("text-danger");
        channelNameTitle.innerHTML = "Not Connected";
        ChatChannels.getAllRecentChannels().then(channels => displayChannels(channels));
    }
}

async function leaveChatButton(manual = false) {
    $('button[data-action=leave]').prop('disabled', true);
    $('button[data-action=join]').prop('disabled', false);
    // Always disconnect unless we're deleting
    currentChatConnected = null;
    ChatHandle.disconnect();
    let channels = await ChatChannels.getAllRecentChannels();
    displayChannels(channels);
    if (manual) {
        needsReconnect = false;
    }
}

/**
 * Join a chat after ensuring everything is kosher, and display the connection
 * @param {string} chat
 */
async function joinChat(chat: string, isReconnect?: boolean) {
    let chatToJoin = chat;
    let token = AuthHandle.getToken();
    let response = await ApiHandle.getChannelID(chatToJoin, true);
    if (response == null) {
        errorMessage("Auth Error.", "You need to complete authentication and request a token.");
    } else if (response == false) {// @ts-ignore
        errorMessage(response, "Please make sure that the channel exists. Check your spelling.");
    } else {
        //We have the ID, time to join the channel. At this point we assume the auth info is correct and we can finally get to their channel.
        currentChatConnected = chatToJoin;
        ChatHandle.checkAndJoinChat(token, response, isReconnect); // Joins the channel
        showToast(`Connected to ${chatToJoin}. Please disconnect when you are finished. Happy Streaming!`);
        currentChannelToRejoin = chat
        await addChannelAndDisplay(chatToJoin);
        let channelNameText = ""
        if (chatToJoin.toLowerCase() === 'glimboi') {
            channelNameText = 'GlimBoi (TEST)';
        } else {
            channelNameText = chatToJoin;
        }
        $('#channelConnectedName').text(channelNameText);
        $('#channelConnectedName').removeClass('text-danger').addClass('text-success ');
        $('#navChatStatus').text(channelNameText);
        $('#navChatStatus').removeClass('text-danger').addClass('text-success ');
    }
}

/**
 * Adds a new chat / channel only, does not connect
 */
$(document).on('click', '#triggerNewChatAdd', async function (event) {
    let chatToJoin = $('#newChatName').val();
    let token = AuthHandle.getToken();
    if (token == undefined || token.length == 0) {
        errorMessage("The auth process is not yet complete. Please complete it before trying to join a chat.",
        "Go to the home page of Glimboi and request a token.");
    } else {
        // Authenticate if we can and check the channel
        let response = await ApiHandle.getChannelID((chatToJoin as string));
        if (response == null) {
            errorMessage("Auth Error", "Please complete authentication and request a token.");
        } else if (response == false) {
            errorMessage("Channel Error",
            "Please make sure that the channel exists. Check your spelling. Enter the channel you want to JOIN, not your bot account.");
        } else {
            addChannelAndDisplay(chatToJoin).then(function () {
                $('#newChatName').val('');
            });
        }
    }
});

/**
 * Loads the chat window, autofills some data from the API and displays it
 */
function loadChatWindow() {
    // Load the recent chatmessages and display them
    globalChatMessages.forEach(msg => {
        ChatMessages.logMessage(msg[0], msg[1], msg[2], true, msg[3], msg[4], msg[5]);
    });

    try {
        getBot().then(botName => {
            let ts = Date.now();
            let defaultChannels: channel[] = [{
                channel: 'GlimBoi',
                timestamp: ts,
                autoJoin: false
            }];

            // If we have authentication, add the authenticated user to recent channels
            if (botName != null) {
                defaultChannels.push({
                    channel: botName,
                    timestamp: ts,
                    autoJoin: false
                });
            }

            ChatChannels.getAllRecentChannels().then(channels => {
                // No channels exist, add the defaults
                if (channels.length == 0) {
                    defaultChannels.forEach(chan => {
                        ChatChannels.addRecentChannel(chan.channel, chan.timestamp, chan.autoJoin);
                    });
                    channels = defaultChannels;
                }

                // Check for autojoin and join the channel if it's enabled
                channels.forEach(chan => {
                    if (chan.autoJoin === true && ChatHandle.isConnected() === false) {
                        joinChat(chan.channel);
                    }
                });

                displayChannels(channels);
            });
        });
    } catch (e) {
        console.log(e);
    }
    viewOrChangeChatSettings("view");

    // Enable clipboard for glimesh links
    $('#chatContainer').on("click", ".copyLink", function (e) {
        clipboard.writeText(e.target.innerText);
        showToast("The link has been copied to your clipboard.");
    });

    // Create chat modals
    ChatDiscordModal = new Modal(document.getElementById("discordWebhook"), {});
    ChatGuildedModal = new Modal(document.getElementById("guildedWebhook"), {});
    ChatTwitterModal = new Modal(document.getElementById("twitterWebhook"), {});
    ChatMatrixModal = new Modal(document.getElementById("matrixWebhook"), {});

    // Enabled the closing of chat modals
    document.getElementById("closeDiscordModal").addEventListener("click", () => ChatDiscordModal.hide());
    document.getElementById("closeDiscordModal2").addEventListener("click", () => ChatDiscordModal.hide());
    document.getElementById("closeGuildedModal").addEventListener("click", () => ChatGuildedModal.hide());
    document.getElementById("closeGuildedModal2").addEventListener("click", () => ChatGuildedModal.hide());
    document.getElementById("closeTwitterModal").addEventListener("click", () => ChatTwitterModal.hide());
    document.getElementById("closeTwitterModal2").addEventListener("click", () => ChatTwitterModal.hide());
    document.getElementById("closeMatrixModal").addEventListener("click", () => ChatMatrixModal.hide());
    document.getElementById("closeMatrixModal2").addEventListener("click", () => ChatMatrixModal.hide());
}

/**
 * Adds a channel to the DB, then reloads the visuals
 * @param {string} chatToJoin
 */
async function addChannelAndDisplay(chatToJoin) {
    try {
        let newChannel = await ChatChannels.addRecentChannel(chatToJoin);
        let channels = await ChatChannels.getAllRecentChannels();
        displayChannels(channels);
        return newChannel
    } catch (e) {
        console.log(e);
        return null
    }
}

/**
 * Displays all loaded channels into the recent channels / chats box, sorted by timestamp last connected
 * @param channels - Array of channels to display
 */
function displayChannels(channels: channel[]) {
    // Empty the list
    let chatConnections = document.getElementById("chatConnections");
    chatConnections.innerHTML = "";

    // Insert the containers
    let pinned = document.createElement("div");
    pinned.classList.add("pinned");
    let scroller = document.createElement("div");
    scroller.classList.add("scroller");
    chatConnections.appendChild(pinned);
    chatConnections.appendChild(scroller);

    // Sort channels by timestamp (last connected)
    channels.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : ((b.timestamp < a.timestamp) ? -1 : 0))

    // Add default elements
    channels.forEach(channel => {
        let d = new Date(channel.timestamp);
        let currentlyConnected = currentChatConnected === channel.channel;

        let channelNameDisplay = document.getElementById("channelConnectedName");
        if (currentChatConnected === null) {
            channelNameDisplay.innerText = "Not Connected";
            channelNameDisplay.classList.remove("text-green-500");
            channelNameDisplay.classList.add("text-red-500");

            let navChatStatus = document.getElementById("navChatStatus");
            navChatStatus.innerText = "Not Connected";
            navChatStatus.classList.remove("text-green-500");
            navChatStatus.classList.add("text-red-500");
        } else if (currentlyConnected) {
            channelNameDisplay.classList.remove("text-red-500");
            channelNameDisplay.classList.add("text-green-500");
            channelNameDisplay.innerText = currentChatConnected;
        }

        // Disable all leave buttons (except on the connected chat)
        // Enable all join buttons (except on the connected chat)
        let disableJoin = (currentChatConnected !== null) ? 'disabled' : '';
        let disableLeave = (currentChatConnected === null || !currentlyConnected) ? 'disabled' : '';
        let autoJoin = (channel.autoJoin) ? 'checked' : '';

        let channelNameText = channel.channel;
        let channelNameHTML = channel.channel;

        if (channel.channel.toLowerCase() === 'glimboi') {
            channelNameText = 'GlimBoi (TEST)';
            channelNameHTML = '<span class="text-yellow-300 text-xl font-bold"><b>GlimBoi (TEST)</b></span>';
        }

        $(currentlyConnected ? '#chatConnections .pinned' : '#chatConnections .scroller').append(`
            <div class="mx-0 channel-listing flow-root" data-channel="${channel.channel}" data-channelid="${channel._id}">
                <h4 class="float-left whiteText channelName p-0 mb-1 font-bold text-xl" title="Last Seen: ${d.toLocaleString()} | Channel: ${channelNameText}">${channelNameHTML}</h4>
                <div id="${channel._id}-autoJoin" role="tooltip" class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                    Automatically join this channel at startup
                </div>
                <div class="float-right d-flex mb-1" role="group">
                    <label class="switch" data-action="auto-join" data-tooltip-target="${channel._id}-autoJoin" data-tooltip-trigger="hover">
                        <input type="checkbox" ${autoJoin} onclick="autoJoinChatButtons(this)">
                        <span class="slider round"></span>
                    </label>
                    <button data-action="join" class="btn btn-success" ${disableJoin} onclick="joinChatButtons(this)">Join</button>
                    <button data-action="leave" class="btn btn-danger" ${disableLeave} onclick="leaveChatButton(true)">Leave</button>
                    <button title="Delete" data-action="delete" class="btn btn-danger btn-icon fas fa-trash" onclick="deleteButtonsChat(this)"></button>
                </div>
            </div>
        `);
    });
    loadFlowbite();
}

/**
 * Sends a message to chat as the bot. This is user input.
 * Resets when sent.
 * Not to be confused with ChatMessages.sendMessage
 */
function sendMessageInBox() {
    let msgValue = document.getElementById("messageArea")! as HTMLInputElement
    try {
        ChatMessages.sendMessage(msgValue.value, "user");
    } catch(e) {
        errorMessage("Chat Error", "You must be in a chat to send a message.")
    }
    msgValue.value = ""; // resets the message box
}

function loadChatContextMenu(e: { path: any; pageY: number; pageX: number; }) {
    let source = e.path
    for (let i = 0; i < source.length; i++) {
        try {
        if (source[i].getAttribute("contentLocation") !== null) {
            source = source[i]
            break
        }
        } catch(e) {}
    }

    contentTarget = source.children[1].children[0].innerText.slice(0, -2);
    contentBody = source.children[1].childNodes[1].data.trim()
    try {
        contentMessageID = Number(source.children[1].attributes[1].value)
    } catch(e) {
        contentMessageID = null
    }

    let top = e.pageY - 210;
    let left = e.pageX + 10;
    $("#context-menu").css({
        display: "block",
        top: top,
        left: left
    }).addClass("show");
    document.body.addEventListener("click", function () { $("#context-menu").removeClass("show").hide() }, { once: true })
}

function contextMenu(action: logEvent, duration: timeout) {
    if (!contentMessageID) {
        errorMessage("Message Error", "You cannot interact with that message.");
        return;
    }

    switch (action) {
        case "Add User":
            UserHandle.addUser(contentTarget.toLowerCase(), false).then(data => {
                if (data == "USEREXISTS") {
                    errorMessage("User Exists", "That user is already in the bot database.")
                } else if (data == "INVALIDUSER") {
                    errorMessage("User Error", "Ensure that you are authenticated and selected a real user.")
                }
            });
            break;
        case "Add Quote":
            UserHandle.addQuote(contentTarget.toLowerCase(), contentBody.trim()).then(data => {
                if (!data) {
                    errorMessage("Quote Error", "An error occured when creating the quote.")
                }
            });
            break;
        case "Short Timeout User":
        case "Long Timeout User":
            ModHandle.ModPowers.timeoutByUsername(contentTarget, duration).then(data => {
                if (data !== null && typeof data !== "object") {
                    LogHandle.logEvent({ event: "Short Timeout User", users: ["Glimboi", data] })
                }
            });
            break;
        case "Delete Message":
            ModHandle.ModPowers.deleteMessage(contentMessageID).then(data => {
                if (data !== null && typeof data !== "object") {
                    LogHandle.logEvent({ event: "Delete Message", users: ["Glimboi", data], data: { messageID: contentMessageID } })
                }
            });
            break;
        case "Ban User":
            ModHandle.ModPowers.banByUsername(contentTarget).then(data => {
                if (data !== null && typeof data !== "object") {
                    LogHandle.logEvent({ event: "Ban User", users: ["Glimboi", data] })
                }
            });
            break;
        case "UnBan User":
            ModHandle.ModPowers.unBanByUsername(contentTarget).then(data => {
                if (data !== null && typeof data !== "object") {
                    LogHandle.logEvent({ event: "UnBan User", users: ["Glimboi", data] })
                }
            });
            break;
        case "Follow User":
            ApiHandle.getUserID(contentTarget).then(data => {
                if (typeof data == "number") {
                    ApiHandle.followUser(data, false, false).then(result => {
                        if (result) {
                            LogHandle.logEvent({ event: "Follow User", users: ["Glimboi", contentTarget] })
                        }
                    })
                }
            })
            break;
        case "Unfollow User":
            ApiHandle.getUserID(contentTarget).then(data => {
                if (typeof data == "number") {
                    ApiHandle.followUser(data, true).then(result => {
                        if (result) {
                            LogHandle.logEvent({ event: "Unfollow User", users: ["Glimboi", contentTarget] })
                        }
                    })
                }
            })
            break;
    }

}

function reconnect() {
    console.log("We were disconnected from chat, attempting to rejoin in 5 seconds.");
    setTimeout(() => {
        let ReconnectModal = new Modal(document.getElementById("reconnectModal"), {});
        ReconnectModal.show();
        reconnectDelay = setTimeout(async () => {
            try {
                console.log("Rejoined chat. Hopefully..........")
                ReconnectModal.hide();
                joinChat(currentChannelToRejoin, true);
            } catch (e) {
                errorMessage("Failed to rejoin Glimesh chat", "Wait a few minutes and request another token.");
                ReconnectModal.hide();
            }
        }, 5000);
    }, 3000);
}

function adjustMessageStateUI(id:number, state:messageState) {
    if (currentPage == "chat") {
        let messages = document.getElementById("chatList")! as HTMLUListElement;
        for (let i = 0; i < messages.children.length; i++) {
            if (Number(messages.children[i].firstElementChild.children[1].getAttribute("messageID")) == id) {
                messages.children[i].classList.remove("none");
                messages.children[i].classList.add(state);
                break;
            }
        }
    }
}


function adjustMessageState(id:number, state:messageState) {
    for (let i = 0; i < globalChatMessages.length; i++) {
        if (globalChatMessages[i][3] == id) {
            console.log("We found a chat message");
            globalChatMessages[i][4] = state;
            adjustMessageStateUI(id, state);
            break
        }
    }
}

function adjustMessageStateByUsername(username:string, state:messageState) {
    for (let i = 0; i < globalChatMessages.length; i++) {
        if (globalChatMessages[i][0] == username) {
            console.log("We found a matching user message");
            globalChatMessages[i][4] = state;
            adjustMessageStateUI(globalChatMessages[i][3], state);
        }
    }
}

function askForWebhookConfirmation(webhook:webhookType) {
    if (webhook == "discord") {
        ChatDiscordModal.show();
        (document.getElementById("discordWebhookMessage") as HTMLInputElement).value = CacheStore.get("discordWebhookMessage", "$streamer just went live on https://glimesh.tv/$streamer");
    } else if (webhook == "guilded") {
        ChatGuildedModal.show();
        (document.getElementById("guildedWebhookMessage") as HTMLInputElement).value = CacheStore.get("guildedWebhookMessage", "$streamer just went live on https://glimesh.tv/$streamer");
    } else if (webhook == "twitter") {
        ChatTwitterModal.show();
        (document.getElementById("twitterWebhookMessage") as HTMLInputElement).value = CacheStore.get("twitterMessage", "$streamer just went live on https://glimesh.tv/$streamer?follow_host=false");
    } else if (webhook == "matrix") {
        ChatMatrixModal.show();
        (document.getElementById("matrixWebhookMessage") as HTMLInputElement).value = CacheStore.get("matrixMessage", "https://glimesh.tv/$streamer?follow_host=false");
    }
}


function viewOrChangeChatSettings(mode: "view" | "change") {
    if (mode == "view") {
        if (CacheStore.get("chatLogging", false)) {
            document.getElementById("loggingEnabled")!.toggleAttribute("checked");
        }
        (document.getElementById("healthReminder") as HTMLInputElement).value = String(CacheStore.get("chatHealth", 0));
    } else {
        CacheStore.setMultiple([
            {chatLogging: (document.getElementById("loggingEnabled") as HTMLInputElement)!.checked},
            {chatHealth: Number((document.getElementById("healthReminder") as HTMLInputElement).value)}
        ]);
    }
}