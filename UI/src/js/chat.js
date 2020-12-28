var {ipcRenderer} = require('electron')
var ChatHandle = require(app.getAppPath() + "/chatbot/lib/chat.js")
ChatHandle.updatePath(app.getPath("userData"))

function openWindow () {
    ipcRenderer.send('createChat', { user: document.getElementById("userChatSearch").value});
}

function checkForUpdate() {
    const version = document.getElementById('version');
    console.log(ipcRenderer)
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      console.log("Recieved app_version with : " + arg.version)
      ipcRenderer.removeAllListeners('app_version');
      console.log("Removed all listeners for app_version.")
      version.innerText = 'Version ' + arg.version;
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
}});
  function restartApp() {
    console.log("trying to restart the app for the update")
  ipcRenderer.send('restart_app');
}
  ipcRenderer.on("aaaaaaaaaaaaa", () => {
  console.log("it happened")
})
  ipcRenderer.on("test", data => {
    console.log(data)
  })
}