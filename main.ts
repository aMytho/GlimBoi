import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron'; //electron modules
import log from 'electron-log' // helps with logging to file for main process
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
import { autoUpdater } from 'electron-updater'; //handles updates
import isDev = require("electron-is-dev"); // detects if we are in dev mode
import windowStateKeeper from 'electron-window-state';

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


function createWindow () {
    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    let mainWindowState = windowStateKeeper({
        defaultWidth: width,
        defaultHeight: height
      });
   	win = new BrowserWindow({
    	width: mainWindowState.width,
    	height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
    	backgroundColor: "#060818",
    	webPreferences: {
      		nodeIntegration: true,
              contextIsolation: false
    	},
    	frame: false
  	})
  	win.loadFile(__dirname + '\\../src/index.html');
  	win.setIcon('resources/Icons/icon.png');
    mainWindowState.manage(win);
}
app.whenReady().then(createWindow);

// send info to the renderer so it can use glimboi modules. This MUST come first and it needs to be very fast.
ipcMain.on("appDataRequest", (event) => {
  	event.returnValue = [__dirname, app.getPath("userData")]
})

ipcMain.on("windowSize", (event, arg: "close" | "maximize" | "minimize" | "refresh") => {
	switch(arg) {
		case "close":
			win.close();
			console.log("Recieved close request, closing.");
		break;
		case "maximize":
			win.maximize();
  			console.log("Maximizing window");
		break;
		case "minimize":
			win.minimize();
			console.log("Minimizing Window");
		break;
		case "refresh":
			win.reload();
  			console.log("Reloading Window");
		break;
	}
})


ipcMain.handle("getLogLocation", async (event) => {
	let fileSelection = await dialog.showSaveDialog(win, {
	title: "Create Chat Log:", defaultPath: app.getPath("logs"), buttonLabel: "Create/Write",
	properties: ['showOverwriteConfirmation'], filters: [{ name: "Chat Logs", extensions: ["txt"]}]
	})
	return fileSelection;
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
