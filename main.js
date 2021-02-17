const { app, autoUpdater, BrowserWindow, ipcMain, screen, } = require('electron'); //electron modules
const log = require('electron-log');
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
var isDev = require("electron-is-dev");
var APP_VERSION = 1
var AUTO_UPDATE_URL;

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

/*
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

autoUpdater.logger = log
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;
console.log(autoUpdater.currentVersion);
autoUpdater.checkForUpdates()
*/

ipcMain.on('app_version', (event) => {
  var version = app.getVersion()
  event.sender.send('app_version', { version: version });
  console.log("The current version is recieved. " + version);
  if (isDev) {
    console.log("isdev")
  } else {
    APP_VERSION = version
    AUTO_UPDATE_URL = 'https://api.update.rocks/update/github.com/aMytho/GlimBoi/stable/' + process.platform + '/' + APP_VERSION
    init()
  }
});

function init () {
  if (process.platform === 'linux') {
    console.log('Auto updates not available on linux')
  } else {
    console.log(AUTO_UPDATE_URL)
    initDarwinWin32()
  }
}

function initDarwinWin32 () {
  autoUpdater.on(
    'error',
    (err) => console.log(`Update error: ${err.message}`))

  autoUpdater.on(
    'checking-for-update',
    () => console.log('Checking for update'))

  autoUpdater.on(
    'update-available',
    () => console.log('Update available'))

  autoUpdater.on(
    'update-not-available',
    () => console.log('No update available'))

  // Ask the user if update is available
  autoUpdater.on(
    'update-downloaded',
    (event, releaseNotes, releaseName) => {
      var {dialog} = require("electron")
      console.log('Update downloaded')
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Update', 'Cancel'],
        defaultId: 0,
        message: `Version ${releaseName} is available, do you want to install it now?`,
        title: 'Update available'
      }, response => {
        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
    }
  )

  autoUpdater.setFeedURL(AUTO_UPDATE_URL)
  autoUpdater.checkForUpdates()
}