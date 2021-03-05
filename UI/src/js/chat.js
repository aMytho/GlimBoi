var ChatHandle = require(appData[0] + "/chatbot/lib/chat.js"); // Chat Module
var ModHandle = require(appData[0] + "/chatbot/lib/moderator.js"); // handles moderator actions
var isDev = false; // We assume they are on a production release.
ChatHandle.updatePath(appData[1]);

var contextItem;
var globalChatMessages;
var botAccount;
var currentChatConnected = null;

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
* For the Join Chat modal, pulls the bots username from the API and autofills whichChannel
*/
function showJoinModal()
{
  $('#modalChat').modal('show'); // Do this first in case there are issues later on

  if (document.getElementById("whichChannel").value !== '') {
    return; // No point re-requesting if we already have it
  }

  try {
    if (botAccount === null) {
      getBot().then(botName => {
        botAccount = botName;
        if (botName.status !== 'AUTHNEEDED' && document.getElementById("whichChannel").value === '') {
          document.getElementById("whichChannel").value = botName;
        }
      });
    } else {
      if (botAccount.status !== 'AUTHNEEDED' && document.getElementById("whichChannel").value === '') {
        document.getElementById("whichChannel").value = botAccount;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

$(document).on('click', '#chatConnections button', function (event) {
  var action    = $(this).attr('data-action');
  var listing   = $(this).closest('.channel-listing');
  var channel   = listing.attr('data-channel');
  var channelid = listing.attr('data-channelid');

  $('button[data-action=leave]').prop('disabled', true);
  $('button[data-action=join]').prop('disabled', true);

  if (action === 'delete') {
    if (currentChatConnected === channel) {
      currentChatConnected = null;
      ChatHandle.disconnect(false);
    }

    $(this).prop('disabled', true); // Disable delete btn
    $(listing).remove();
    ChatHandle.removeRecentChannelByID(channelid); // Remove from DB
  } else if (ChatHandle.isConnected()) {
      currentChatConnected = null;
      ChatHandle.disconnect(false); // Always disconnect unless we're deleting
  }

  // Join a chat? Set a timeout to avoid a race condition between disconnect and joinChat
  if (action === 'join') {
    setTimeout(function () {
      joinChat(channel);
    }, 500);
  } else if (ChatHandle.isConnected() === false) {
    $('#channelConnectedName').removeClass('text-success').addClass('text-danger ');
    $('#channelConnectedName').text('Not Connected');
    ChatHandle.getAllRecentChannels().then(channels => displayChannels(channels));
  }

});


/**
 * Open a modal to allow the user to type which chat they will join.
 */
function joinChat(chat = null) {
  var chatToJoin = chat ?? document.getElementById("whichChannel").value;

  AuthHandle.getToken().then(data => {
    if (data == undefined || data.length == 0 ) {
      errorMessage("The auth process is not yet complete. Please complete it before trying to join a chat.", "Go to the home page of Glimboi and auth again.")
    } else {
      ApiHandle.updatePath(data); //Sends the API module our access token.
      ApiHandle.getChannelID(chatToJoin).then(response => {
        if (response == null) {
          errorMessage(response, "Please make sure that the channel exists. Check your spelling.")
        } else if (response.status == "AUTHNEEDED") {
          errorMessage(response.data, "You need to authenticate again.")
        } else {
          //We have the ID, time to join the channel. At this point we assume the auth info is correct and we can finally get to their channel.
          currentChatConnected = chatToJoin;
          ChatHandle.join(data, response); // Joins the channel
          successMessage("Chat connected!", "Please disconnect when you are finished. Happy Streaming!");
          // Now we need to import the filter.
          ModHandle.importFilter();

          addChannelAndDisplay(chatToJoin).then(function () {
            $('#channelConnectedName').text(chatToJoin);
            $('#channelConnectedName').removeClass('text-danger').addClass('text-success ');
          });
        }
      })
    }
  })
}

$(document).on('click', '#triggerNewChatAdd', function (event) {
  var chatToJoin = $('#newChatName').val();
  AuthHandle.getToken().then(data => {
    if (data == undefined || data.length == 0) {

    } else {
      // Authenticate if we can and check the channel
      ApiHandle.updatePath(data); //Sends the API module our access token.
      ApiHandle.getChannelID(chatToJoin).then(response => {
        if (response == null || response.data == 'Could not find resource') {
          errorMessage(response.data, "Please make sure that the channel exists. Check your spelling.")
        } else {
          addChannelAndDisplay(chatToJoin);
        }
      })
    }
  })
});

function loadChatWindow() {
  globalChatMessages.forEach(msg => {
    ChatHandle.logMessage(msg[0], msg[1], msg[2], false);
  });

  try {
    getBot().then(botName => {
      if (botName.status === 'AUTHNEEDED') return;
      botAccount = botName;

      ChatHandle.getAllRecentChannels().then(channels => {
        var ts = (new Date()).toLocaleTimeString();
        var defaultChannels = [{
          channel: 'Glimesh',
          timestamp: ts
        }, {
          channel: botAccount,
          timestamp: ts
        }];

        if (channels.length == 0) {
          defaultChannels.forEach(chan => {
            ChatHandle.addRecentChannel(chan.channel, chan.ts);
          });
          channels = defaultChannels;
        }

        $('#chatConnections').empty();
        displayChannels(channels);
      });
    });
  } catch (e) {
    console.log(e);
  }
}

async function addChannelAndDisplay(chatToJoin) {
  return new Promise(resolve => {
    try {
      ChatHandle.addRecentChannel(chatToJoin).then(newChannel => {
        ChatHandle.getAllRecentChannels().then(channels => {
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

function displayChannels(channels) {
  $('#chatConnections').empty();
  channels.forEach(channel => addChannelElement(channel));

  channels.forEach(channel => {
    var x = `#chatConnections [data-channel=${channel.channel}]`;
    $(`${x} [data-action=join]`).prop('disabled', (currentChatConnected !== null));
    $(`${x} [data-action=leave]`).prop('disabled', (currentChatConnected === null || currentChatConnected !== channel.channel));
  });
}

function addChannelElement(channel) {
  return $('#chatConnections').append(`
    <div class="mx-0 row mt-1 channel-listing" data-channel="${channel.channel}" data-channelid="${channel._id}">
      <h4 class="col whiteText channelName">${channel.channel}</h4>
      <div class="d-flex">
        <div><button data-action="join" class="mx-1 btn btn-success btn-block">Join</button></div>
        <div><button data-action="leave" class="mx-1 btn btn-danger btn-block" disabled>Leave</button></div>
        <div><button data-action="delete" class="mx-1 btn btn-danger btn-block btn-icon"><i class="fas fa-trash"></i></button></div>
      </div>
    </div>
  `);
}

/**
 * Sends a message to chat as the bot. This is user input.
 * Resets when sent.
 */
function sendMessage() {
  ChatHandle.filterMessage(document.getElementById("messageArea").value, "user");
  document.getElementById("messageArea").value = "" // resets the message box
}


/**
 * Checks for updates on launch. Also sets dev state to true/false. Shows restart button if update is ready.
 */
function checkForUpdate() {
  const version = document.getElementById('version');
  ipcRenderer.send('app_version');
  ipcRenderer.on('app_version', (event, arg) => {
    console.log("Recieved app_version with : " + arg.version)
    console.log("Removing all listeners for app_version.")
    version.innerText = 'Version ' + arg.version;
    if (arg.isDev == true) {
      isDev = true;
      console.log("Glimboi is in dev mode. We will not request the token.")
    } else {
      console.log("GlimBoi is in production mode. We will request an access token. ")
    }
    ipcRenderer.removeAllListeners('app_version');
  });
  const notification = document.getElementById('notification');
  const message = document.getElementById('message');
  const restartButton = document.getElementById('restart-button');

  ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    console.log("Update Avaible")
    message.innerText = 'A new update is available. Downloading now...';
    notification.classList.remove('hidden');
  });

  ipcRenderer.on('update_downloaded', () => {
    console.log("Update Downloaded")
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
    function closeNotification() {
      notification.classList.add('hidden');
    }
  })
  // test functions
  ipcRenderer.on("aaaaaaaaaaaaa", () => {
    console.log("it happened")
  })
  ipcRenderer.on("test", data => {
    console.log(data)
  })
}

function restartApp() {
  console.log("trying to restart the app for the update")
  ipcRenderer.send('restart_app');
}

function testingStuff(e) {
  contextItem = $(e.target).attr('name')
  console.log(contextItem)
  var top = e.pageY - 110;
  var left = e.pageX + 10;
  $("#context-menu").css({
    display: "block",
    top: top,
    left: left
  }).addClass("show");
  document.body.addEventListener("click", function() {$("#context-menu").removeClass("show").hide()},{once:true})
}

function contextMenu(action) {
  if (action == "ADDUSER") {
    UserHandle.addUser(contextItem.toLowerCase(), false).then(data => {

    })
  } else if (action == "ADDQUOTE") {

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
