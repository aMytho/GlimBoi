const { app, BrowserWindow, screen, ipcMain } = require('electron'); //electron modules
const log = require('electron-log');
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
const { autoUpdater } = require('electron-updater'); //handles updates
autoUpdater.autoDownload = true;
autoUpdater.checkForUpdates()
autoUpdater.allowPrerelease = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = log
console.log(autoUpdater.currentVersion);
var fs = require("fs") //handles Files (writing and reading)
var request = require("request");//Handles sending requests to the api.
var CommandHandle = require(__dirname + "/chatbot/lib/commands.js") //handles commands
console.log("Main js path is " + app.getAppPath())
let botSettingsRaw = fs.readFileSync(app.getAppPath() + '/chatbot/settings/settings.JSON');
let settings = JSON.parse(botSettingsRaw);

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
    console.log("GlimBot:");
        console.log(" Chat Control: " + "\x1b[38m" + settings.GlimBot.chatControls + "\033[0m");
        console.log(" Current Version: " + "\x1b[38m" + autoUpdater.currentVersion + "\033[0m");
        console.log("\x1b[38m" + "______________________" + "\033[0m");
    console.log("Logging Completed!");
}
CommandHandle.updatePath(app.getPath("userData"));


ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
  console.log("The current version is recieved. " + app.getVersion());
});



//console.log(autoUpdater.fullChangelog);




var win;


function createWindow () {
  const {width,height} = screen.getPrimaryDisplay().workAreaSize
   win = new BrowserWindow({
    width: width,
    height: height,
    backgroundColor: "#060818",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    icon: __dirname + "UI/Icons/ending.png",
    frame: false
  })
  win.loadFile(app.getAppPath() + '/UI/index.html');
  //win.setOverlayIcon('UI/Icons/ending.png', "Gleam");
  win.setIcon('UI/Icons/bot.png');
    autoUpdater.checkForUpdatesAndNotify().then(data => {
      console.log(data)
    })
 // win.webContents.openDevTools()
}


app.whenReady().then(createWindow)

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

//Creats the chat window for viewing a chat
ipcMain.on("createChat", (event, arg) => {
  console.log(arg);
  var chat = new BrowserWindow({
    width: 400,
    height: 700,
    backgroundColor: "#060818",
    icon: __dirname + "UI/Icons/ending.png",
    frame: true,
    darkTheme: true
  })
  chat.loadURL("https://glimesh.tv/" + arg.user + "/chat")
})



//This handles the BOT connecting to chat (NOT the User)
//A non electorn version of this file can be run in the chatbot directory. You need Nodejs.

function joinChatBot() {
  var chat = require(__dirname + "/chatbot/lib/chat.js");

}
