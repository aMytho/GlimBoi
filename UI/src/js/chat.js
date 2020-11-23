var ipcRenderer = require('electron').ipcRenderer;
function openWindow () {
    ipcRenderer.send('createChat', {type:'createNewWindow', user: "Mytho"});
}