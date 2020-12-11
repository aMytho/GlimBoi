var ipcRenderer = require('electron').ipcRenderer;
var ChatHandle = require(app.getAppPath() + "/chatbot/lib/chat.js")
ChatHandle.updatePath(app.getPath("userData"))

function openWindow () {
    ipcRenderer.send('createChat', { user: document.getElementById("userChatSearch").value});
}
