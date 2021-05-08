var isDev = false; // We assume they are on a production release.
var ChatSettings;
var ChatActions;
var ChatStats;
var ChatMessages;
var chatID = "" // the channel ID
var reconnectDelay, currentChannelToRejoin;

var contentTarget;
var contentBody;
var globalChatMessages;
var currentChatConnected = null;

const ChatHandle = require(appData[0] + "/chatbot/lib/chat.js"); // Chat Module
const ChatChannels = require(appData[0] + "/chatbot/lib/chat/chatChannels.js");
const ModHandle = require(appData[0] + "/chatbot/lib/moderator.js"); // handles moderator actions

ChatChannels.updatePath(appData[1]);

/**
 * Gets the bot username for autofilling recent channels
 */
async function getBot() {
  	return new Promise(resolve => {
    	try {
      		AuthHandle.getToken().then(data => {
        		if (data == undefined || data.length == 0 ) {
          			resolve(null);
        		} else {
          			ApiHandle.updatePath(data); //Sends the API module our access token.
          			ApiHandle.getBotAccount().then(data => {
            			resolve(data);
          			});
        		}
      		});
    	} catch (e) {
      		console.log(e);
      		resolve(null);
    	}
  	})
}

/**
 * The main starting logic for joining and leaving and deleting recent chats / channels
 *
 * 3 actions trigger this. Delete, Join, Leave
 *
 * Delete:
 *  - Deletes the element from the page and the database
 *  - If the user is connected to the deleted channel, they get disconnected
 *
 * Join:
 *  - Joins the selected channel, once ensuring data / auth is correct
 *  - Leaves any channel if the socket is open (was before everything was disabled, now it's still there for bug prevention)
 *
 * Leave:
 *  - Leaves the current connected chat
 *
 * Auto Join:
 *  - Updates the DB and tells it to auto-join when there are no connections on load
 */
$(document).on('click', '#chatConnections button', function (event) {
  	var action    = $(this).attr('data-action');
  	var listing   = $(this).closest('.channel-listing');
  	var channel   = listing.attr('data-channel');
  	var channelid = listing.attr('data-channelid');

  	if (action === 'auto-join') {
    	$('button[data-action=auto-join]').prop('disabled', true);

    	var enabled = ($(this).attr('data-enabled') == "false"); // Invert current setting
    	console.log(`Setting autoJoin for ${channel} to ${enabled}`);

    	// Set the selected channel to be auto-join
    	ChatChannels.setAutoJoinChannelByID(channelid, enabled).then(channel => {
      		$('button[data-action=auto-join]').prop('disabled', false);

      		// Done, so reset the classes
      		$('[data-action=auto-join]').removeClass('btn-success').addClass('btn-outline-warning');
      		$('[data-action=auto-join]').attr('data-enabled', false);

      		if (channel === null) return;
      		if (channel.autoJoin) {
        		$(this).removeClass('btn-outline-warning').addClass('btn-success');
        		$(this).attr('data-enabled', channel.autoJoin);
      		}
    	});

    	return;
  	}

  	$('button[data-action=leave]').prop('disabled', true);
  	$('button[data-action=join]').prop('disabled', true);

  	if (action === 'delete') {
    	$(this).prop('disabled', true); // Disable delete btn
    	if (currentChatConnected === channel) {
      		currentChatConnected = null;
      		ChatHandle.disconnect(false);
    	}

    	$(listing).remove();
    	ChatHandle.removeRecentChannelByID(channelid); // Remove from DB
  	} else if (ChatHandle.isConnected()) {
    	// Always disconnect unless we're deleting
    	currentChatConnected = null;
    	ChatHandle.disconnect(false);
  	}

  	// Join a chat? Set a timeout to avoid a race condition between disconnect and joinChat
  	// We cannot async / promise the disconnect on the websocket
  	if (action === 'join') {
    	setTimeout(function () {
      		joinChat(channel);
    	}, 500);
  	} if (ChatHandle.isConnected() === false) {
    	// Clear the right-side text of what channel we're connect to & reload channels after deletion
    	$('#channelConnectedName').removeClass('text-success').addClass('text-danger');
    	$('#channelConnectedName').text('Not Connected');
    	ChatChannels.getAllRecentChannels().then(channels => displayChannels(channels));
  	}
});

/**
 * Join a chat after ensuring everything is kosher, and display the connection
 * @param {string} chat
 */
function joinChat(chat, isReconnect) {
  	var chatToJoin = chat;

  	AuthHandle.getToken().then(data => {
    	if (data == undefined || data.length == 0 ) {
      		errorMessage("The auth process is not yet complete. Please complete it before trying to join a chat.", "Go to the home page of Glimboi and auth again.")
    	} else {
      		ApiHandle.updatePath(data); //Sends the API module our access token.
      		ApiHandle.getChannelID(chatToJoin).then(response => {
        		if (response == null) {
          			errorMessage(response, "Please make sure that the channel exists. Check your spelling.")
        		} else if (response.status == "AUTHNEEDED") {
          			errorMessage(response.data, "You need to request a token.")
        		} else {
          			//We have the ID, time to join the channel. At this point we assume the auth info is correct and we can finally get to their channel.
          			currentChatConnected = chatToJoin;
          			ChatHandle.join(data, response, isReconnect); // Joins the channel
          			successMessage("Chat connected!", "Please disconnect when you are finished. Happy Streaming!");
          			// Now we need to import the filter.
          			ModHandle.importFilter();
                    currentChannelToRejoin = chat
          			addChannelAndDisplay(chatToJoin).then(function () {
            			if (chatToJoin.toLowerCase() === 'glimboi') {
              				var channelNameText = 'GlimBoi (TEST)';
            			}
            			$('#channelConnectedName').text(channelNameText);
            			$('#channelConnectedName').removeClass('text-danger').addClass('text-success ');
          			});
        		}
      		})
    	}
  	})
}

/**
 * Adds a new chat / channel only, does not connect
 */
$(document).on('click', '#triggerNewChatAdd', function (event) {
  	var chatToJoin = $('#newChatName').val();
  	AuthHandle.getToken().then(data => {
    	if (data == undefined || data.length == 0) {
      		errorMessage("The auth process is not yet complete. Please complete it before trying to join a chat.", "Go to the home page of Glimboi and request a token.")
    	} else {
      		// Authenticate if we can and check the channel
      		ApiHandle.updatePath(data); //Sends the API module our access token.
      		ApiHandle.getChannelID(chatToJoin).then(response => {
        		if (response == null || response.data == 'Could not find resource') {
          			errorMessage(response.data, "Please make sure that the channel exists. Check your spelling.")
        		} else {
          			addChannelAndDisplay(chatToJoin).then(function () {
            			$('#newChatModal').modal('hide')
            			$('#newChatName').val('');
          			});
        		}
      		})
    	}
  	})
});

/**
 * Loads the chat window, autofills some data from the API and displays it
 */
function loadChatWindow() {
  	globalChatMessages.forEach(msg => {
    	ChatMessages.logMessage(msg[0], msg[1], msg[2], false);
  	});

  	try {
    	getBot().then(botName => {
      		var ts = (Date.now());
      		var defaultChannels = [{
        		channel: 'GlimBoi',
        		timestamp: ts,
        		autoJoin: false
      		}];

      		// If we have authentication, add our name to recent channels
      		if (botName !== null) {
        		defaultChannels.push({
          			channel: botName,
          			timestamp: ts,
          			autoJoin: false
        		});
      		}

      		ChatChannels.getAllRecentChannels().then(channels => {
        		if (channels.length == 0) {
          			defaultChannels.forEach(chan => {
            			ChatChannels.addRecentChannel(chan.channel, chan.ts, chan.autoJoin);
          			});
          			channels = defaultChannels;
        		}

        		$('#chatConnections').empty();
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
}

/**
 * Adds a channel to the DB, then reloads the visuals
 *
 * @param {string} chatToJoin
 */
async function addChannelAndDisplay(chatToJoin) {
  	return new Promise(resolve => {
    	try {
      		ChatChannels.addRecentChannel(chatToJoin).then(newChannel => {
        		ChatChannels.getAllRecentChannels().then(channels => {
          			displayChannels(channels);
          			resolve(newChannel);
        		});
      		});
    	} catch (e) {
      		console.log(e);
      		resolve(null);
    	}
  	});
}

/**
 * Displays all loaded channels into the recent channels / chats box, sorted by timestamp last connected
 *
 * @param {array[object]} channels
 */
function displayChannels(channels) {
  	$('#chatConnections').empty(); // clear
  	$('#chatConnections').append(`<div class="pinned"></div>`);
  	$('#chatConnections').append(`<div class="scroller"></div>`);

  	// Sort channels by timestamp
  	channels.sort((a,b) => (a.timestamp < b.timestamp) ? 1 : ((b.timestamp < a.timestamp) ? -1 : 0))

  	// Add default elements
  	channels.forEach(channel => {
    	var d = new Date(channel.timestamp);
    	var currentlyConnected = currentChatConnected === channel.channel;

    	if (currentChatConnected === null) {
      		$('#channelConnectedName').removeClass('text-success').addClass('text-danger');
      		$('#channelConnectedName').text('Not Connected');
    	} else if (currentlyConnected) {
      		$('#channelConnectedName').removeClass('text-danger').addClass('text-success');
      		$('#channelConnectedName').text(currentChatConnected);
    	}

    	// Disable all leave buttons (except on the connected chat)
    	// Enable all join buttons (except on the connected chat)
    	var disableJoin = (currentChatConnected !== null) ? 'disabled' : '';
    	var disableLeave = (currentChatConnected === null || !currentlyConnected) ? 'disabled' : '';
    	var joinClasses = (channel.autoJoin) ? 'btn-success' : 'btn-outline-warning';

    	var channelNameText = channel.channel;
    	var channelNameHTML = channel.channel;

    	if (channel.channel.toLowerCase() === 'glimboi') {
      		channelNameText = 'GlimBoi (TEST)';
      		channelNameHTML = '<span class="text-warning"><b>GlimBoi (TEST)</b></span>';
    	}

    	$(currentlyConnected ? '#chatConnections .pinned' : '#chatConnections .scroller').append(`
      		<div class="mx-0 row channel-listing" data-channel="${channel.channel}" data-channelid="${channel._id}">
        		<h4 class="col whiteText channelName p-0 mb-1" title="Last Seen: ${d.toLocaleString()} | Channel: ${channelNameText}">${channelNameHTML}</h4>
        		<div class="d-flex btn-group mb-1" role="group">
          			<button title="Auto Join" data-enabled="${channel.autoJoin}" data-action="auto-join" class="btn ${joinClasses} btn-icon"><i class="fas fa-sync-alt"></i></button>
          			<button data-action="join" class="btn btn-success" ${disableJoin}>Join</button>
          			<button data-action="leave" class="btn btn-danger" ${disableLeave}>Leave</button>
          			<button title="Delete" data-action="delete" class="btn btn-danger btn-icon"><i class="fas fa-trash"></i></button>
        		</div>
      		</div>
    	`);
  	});
}

/**
 * Sends a message to chat as the bot. This is user input.
 * Resets when sent.
 *
 * Not to be confused with ChatMessages.sendMessage
 */
function sendMessageInBox() {
  	ChatMessages.filterMessage(document.getElementById("messageArea").value, "user");
  	document.getElementById("messageArea").value = "" // resets the message box
}

function loadChatContextMenu(e) {
    let source = e.path
    for (let i = 0; i < source.length; i++) {
        try {
        if (source[i].getAttribute("contentLocation") !== null) {
            source = source[i]
            break
        }
        } catch(e) {}
    }
    console.log(source)

    contentTarget = source.children[1].children[0].innerText.slice(0, -2);
    contentBody = source.children[1].childNodes[1].data.trim()
    console.log(contentTarget, contentBody)

    var top = e.pageY - 110;
    var left = e.pageX + 10;
    $("#context-menu").css({
        display: "block",
        top: top,
        left: left
    }).addClass("show");
    document.body.addEventListener("click", function () { $("#context-menu").removeClass("show").hide() }, { once: true })
}

function contextMenu(action) {
  	if (action == "ADDUSER") {
    	UserHandle.addUser(contentTarget.toLowerCase(), false).then(data => {
            if (data == "USEREXISTS") {
                actionError({type: "userAdd", error: "USEREXISTS"})
            } else if (data == "INVALIDUSER") {
                actionError({type: "userAdd", error: "INVALIDUSER"})
            } else {
                addAction({type: "userAdd", target: contentTarget, data: contentBody })
            }
    	})
  	} else if (action == "ADDQUOTE") {
        QuoteHandle.addquote(contentTarget.toLowerCase(), contentBody.trim()).then(data => {
            if (data == "QUOTEFINISHED") {
                addAction({type: "quote", target: contentTarget, data: contentBody})
            } else {
                actionError({type: "quote", target: contentTarget, data: contentBody})
            }
        })
  	} else {

  	}
}

/**
 * Edits the action modal to show the correct info.
 * @param {string} action The type of moderator action
 */
function actionBuilder(action) {
  	console.log(action)
  	document.getElementById("actionType").innerText = action
  	switch (action) {
    	case "Short Timeout":
      		document.getElementById("targetActionButton").onclick = function() {
        		ModHandle.timeoutByUsername("short", document.getElementById('whichUser').value, "GUI")
      		}
      	break;
    	case "Long Timeout":
      		document.getElementById("targetActionButton").onclick = function() {
        		ModHandle.timeoutByUsername("long", document.getElementById('whichUser').value, "GUI")
      		}
      	break;
    	case "Ban":
      		document.getElementById("targetActionButton").onclick = function() {
        		ModHandle.banByUsername(document.getElementById('whichUser').value, "GUI")
      		}
      	break;
    	case "UnBan":
      		document.getElementById("targetActionButton").onclick = function() {
        		ModHandle.unBanByUsername(document.getElementById('whichUser').value, "GUI")
      		}
      	break;

    	default:
      	break;
  	}
}


function addAction(action) {
    addActionHTML(action);
    console.log(action)
}

function reconnect() {
    console.log("We were disconnected from chat, attempting to rejoin in 10 seconds.");
    setTimeout(() => {
        $('#modalError').modal('hide');
        $('#reconnectModal').modal('toggle');
        reconnectDelay = setTimeout(() => {
            try {
                AuthHandle.readAuth().then(data => {
                    AuthHandle.requestToken(data[0].clientID, data[0].secret, false).then(data2 => {
                        if (data2 == "ALLGOOD") {
                            joinChat(currentChannelToRejoin, true);
                            console.log("Rejoined chat. Hopefully..........")
                            $('#reconnectModal').modal('hide');
                        } else {
                            console.log("We failed to rejoin chat because there was an ERROR with REQUESTING A TOKEN. VIP, SHOW THIS TO MYTHO");
                            errorMessage("Failed to rejoin chat. Error occured because Glimboi could not request a token.", "Wait a few mintues and then request a new token. Then rejoin chat.")
                        }

                    })
                })
            } catch(e) {
                errorMessage("Failed to rejoin Glimesh chat", "Wait a few minutes and request another token.");
                $('#reconnectModal').modal('hide');
            }
        }, 10000);
    }, 3000);
}