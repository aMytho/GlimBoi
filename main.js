const { app, BrowserWindow, screen, ipcMain } = require('electron'); //electron modules
const log = require('electron-log');
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
const { autoUpdater } = require('electron-updater'); //handles updates
var isDev = require("electron-is-dev")

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
  console.log("The current version is recieved. " + app.getVersion());
  if (isDev) {
    console.log("isdev") 
  } else {
    console.log("Not dev")
    autoUpdater.logger = log
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    console.log(autoUpdater.currentVersion);
    autoUpdater.checkForUpdates()
  }
});

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
  console.log("avaible update!")
});
autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
  console.log("downloaded the update!")
});
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

//console.log(autoUpdater.fullChangelog);

var win; // The main window


function createWindow () { //make Win a window
  const {width,height} = screen.getPrimaryDisplay().workAreaSize
   win = new BrowserWindow({
    width: width,
    height: height,
    backgroundColor: "#060818",
    webPreferences: {
      nodeIntegration: true,
    },
    icon: "UI/Icons/icon.ico",
    frame: false
  })
  win.loadFile(app.getAppPath() + '/UI/index.html');
  win.setIcon('UI/Icons/icon.png');
}
app.whenReady().then(createWindow)

// send info to the renderer so it can use glimboi modules. This MUST come first and it needs to be very fast.
ipcMain.on("appDataRequest", (event) => {
  event.returnValue = [app.getAppPath(), app.getPath("userData")]
})

ipcMain.on("pleaseClose", (event) => {
  win.close();
  console.log("Recieved close request, closing.")
})

ipcMain.on("pleaseMaximize", (event) => {
  win.maximize();
  console.log("Maximizing window")
})

ipcMain.on("pleaseMinimize", (event) => {
  win.minimize();
  console.log("Minimizing Window")
})

ipcMain.on("pleaseRefresh", (event) => {
  win.reload();
  console.log("Reloading Window")
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  } else {
    console.log("Closed")
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})



var loggingFile;

ipcMain.on("startLogging", event => {
  var { dialog } = require("electron");
  var fs = require("fs") //handles Files (writing and reading)
  dialog.showSaveDialog(win, {title: "Save chat:", defaultPath: app.getPath("logs"), buttonLabel: "Create", properties: ['showOverwriteConfirmation', 'promptToCreate ', ], filters: [{name: "Chat Logs", extensions: ["txt"]}]}).then(data => {
    console.log(data)
    if (data == undefined || data.canceled == true) {
      console.log("They did not select a file.");
      event.reply("noLogSelected", "No file was selected.")
    } else {
      loggingFile = fs.createWriteStream(data.filePath)
      event.reply("startedLogging", "Logging has begun");
      console.log("Started logging chat messages.")
    }
  })
})

ipcMain.on("logMessage", (event, arg) => {
  try {
  loggingFile.write(`
  ${arg.user}: ${arg.message}`, "utf-8")
  } catch(e) {
    console.log(e);
  }
})
  
ipcMain.on("logEnd", event => {
  try {loggingFile.end(); console.log("Finishes chat logs.");} catch(e) {console.log(e); event.reply("endedLog", e)}
  event.reply("endedLog", "The log has been ended.")
})

