import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron'; //electron modules
import log from 'electron-log' // helps with logging to file for main process
console.log = log.log; //Logs all console messages in the main process to a file for debug purposes.
import { autoUpdater } from 'electron-updater'; //handles updates
import isDev = require("electron-is-dev"); // detects if we are in dev mode
import windowStateKeeper from 'electron-window-state';

ipcMain.on('app_version', (event) => {
    console.log(`Glimboi dev mode: ${isDev}`);
    console.log("The current version is " + app.getVersion());
    event.sender.send('app_version', { version: app.getVersion() });
    if (isDev) {
        return
    }
    autoUpdater.logger = log
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    console.log(autoUpdater.currentVersion);
    autoUpdater.checkForUpdates();
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


function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
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
            contextIsolation: false,
            backgroundThrottling: false,
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
    event.returnValue = [__dirname, app.getPath("userData"), isDev]
})

ipcMain.on("window", async (event, arg: "close" | "import" | "maximize" | "minimize" | "refresh", path?: string, files?: { name: string, copy: boolean }[]) => {
    switch (arg) {
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
        case "import":
            console.log("Importing new data, closing window");
            let { copyFile } = require("fs");
            // do file stuff
            for (let file of files) {
                try {
                    await copyFile(`${path}/${file.name}.db`, `${app.getPath("userData")}/data/${file.name}.db`, 0, () => {});
                } catch (e) {
                    console.error(e);
                    dialog.showMessageBoxSync(null, {
                        message: "Error importing data file. Please restart Glimboi.",
                        type: "error",
                        title: "Error",
                    })
                    app.quit();
                    break;
                }
            }
            dialog.showMessageBoxSync(null, {message: "Data imported successfully! Glimboi will now restart.", type: "info", title: "Success"});
            win.reload();
    }
});


ipcMain.handle("getLogLocation", async (event) => {
    let fileSelection = await dialog.showSaveDialog(win, {
        title: "Create Chat Log:", defaultPath: app.getPath("logs"), buttonLabel: "Create/Write",
        properties: ['showOverwriteConfirmation'], filters: [{ name: "Chat Logs", extensions: ["txt"] }]
    })
    return fileSelection;
})

ipcMain.handle("backup", async (event) => {
    let folderSelection = await dialog.showOpenDialog(win, {
        title: "Select Backup Folder:", defaultPath: app.getPath("desktop"), buttonLabel: "Select",
        properties: ['openDirectory']
    });
    if (folderSelection.canceled) {
        return null
    }
    return folderSelection;
})

ipcMain.handle("openPath", (event, path: string, location: "internal" | "external") => {
    let shell = require("electron").shell;
    if (location == "internal") {
        shell.openPath(path);
    } else {
        shell.openExternal(path, {activate: true});
    }
    return;
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    } else {
        console.log("Closed");
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})