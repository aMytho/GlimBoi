import { app, BrowserWindow, screen, ipcMain } from 'electron'; //electron modules
import log from 'electron-log' // helps with logging to file for main process
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
import { autoUpdater } from 'electron-updater'; //handles updates
import isDev from "electron-is-dev"; // detects if we are in dev mode

ipcMain.on('app_version', (event) => {
  	console.log("The current version is recieved. " + app.getVersion());
  	if (isDev) {
    	event.sender.send('app_version', { version: app.getVersion(), isDev: true });
    	console.log("isdev")
  	} else {
    	event.sender.send('app_version', { version: app.getVersion() , isDev: false});
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


let win: BrowserWindow; // The main window


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
  	win.loadFile(__dirname + '\\../src/index.html');
  	win.setIcon('resources/Icons/icon.ico');
}
app.whenReady().then(createWindow)

// send info to the renderer so it can use glimboi modules. This MUST come first and it needs to be very fast.
ipcMain.on("appDataRequest", (event) => {
  	event.returnValue = [__dirname, app.getPath("userData")]
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

let loggingFile: any;

ipcMain.on("startLogging", async event => {
    let { dialog } = require("electron");
    let fs = require("fs") //handles Files (writing and reading)
    let fileSelection = await dialog.showSaveDialog(win, { title: "Save chat:", defaultPath: app.getPath("logs"), buttonLabel: "Create", properties: ['showOverwriteConfirmation'], filters: [{ name: "Chat Logs", extensions: ["txt"] }] })
    console.log(fileSelection);
    if (fileSelection == undefined || fileSelection.canceled == true) {
        console.log("They did not select a file.");
        event.reply("noLogSelected", "No file was selected.")
    } else {
        loggingFile = fs.createWriteStream(fileSelection.filePath)
        event.reply("startedLogging", "Logging has begun");
        console.log("Started logging chat messages.")
    }
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
