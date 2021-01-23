const { app, BrowserWindow, screen, ipcMain } = require('electron'); //electron modules
const log = require('electron-log');
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
const { autoUpdater } = require('electron-updater'); //handles updates


function logSettings(settings) {
if (settings.GlimBot.startLog == true) { //Runs at startup to show your config
    console.log(`Auth: ${settings.Auth.Oauth}`);
    console.log("Mods:")
    settings.Mods.ModList.forEach(element => {
        console.log('\x1b[36m', `${element.Name} `,'\x1b[0m');
        console.log('\x1b[38m', `GlimeshMod: ${element.GlimeshMod} `,'\x1b[0m');
    });
    console.log('\x1b[36m%s\x1b[0m', '______________________'); 
    if (settings.Points.enabled == true) {
        console.log("Points:");
        console.log(" Name: " + "\x1b[33m" + settings.Points.name + "\033[0m");
        console.log(" Starting Amount: " + "\x1b[33m" + settings.Points.StartingAmount + "\033[0m");
        console.log(" Points per 15 minutes: " + "\x1b[33m" + settings.Points.accumalation + "\033[0m");
        console.log("\x1b[33m" + "______________________" + "\033[0m");
    };
    if (settings.Games.enabled == true) {
        console.log("Games:");
        console.log(" Numbers: " + "\x1b[34m" + settings.Games.Numbers + "\033[0m");
        console.log(" BankHeist: " + "\x1b[34m" + settings.Games.BankHeist + "\033[0m");
        console.log(" Trivia: " + "\x1b[34m" + settings.Games.Trivia + "\033[0m");
        console.log("\x1b[34m" + "______________________" + "\033[0m");
    };
    if (settings.Commands.enabled == true) {
        console.log("Commands:");
        console.log(" Cooldown: " + "\x1b[35m" + settings.Commands.cooldown + "m" + "\033[0m");
        console.log(" Prefix: " + "\x1b[35m" + settings.Commands.Prefix + "\033[0m");
        console.log(" Chat Errors: " + "\x1b[35m" + settings.Commands.Error + "\033[0m");
        console.log("\x1b[35m" + "______________________" + "\033[0m");
    };
    console.log("GlimBoi:");
        console.log(" Chat Control: " + "\x1b[38m" + settings.GlimBot.chatControls + "\033[0m");
        console.log(" Current Version: " + "\x1b[38m" + autoUpdater.currentVersion + "\033[0m");
        console.log("\x1b[38m" + "______________________" + "\033[0m");
    console.log("Logging Completed!");
}
}

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
  console.log("The current version is recieved. " + app.getVersion());
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