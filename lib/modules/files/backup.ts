import { IpcRenderer } from "electron";

async function exportBackup() {
    try {
        let location = await getBackupLocation();
        if (location) {
            let entries = await fs.readdir(location, { withFileTypes: true });
            for (let entry of entries) {
                let srcPath = `${appData[1]}/data/${entry.name}`;
                let destPath = `${location}/${entry.name}`;
                fs.copyFile(srcPath, destPath);
            }
            console.log("Backup Complete");
        } else {
            errorMessage("Backup Error", "No folder was selected. No backup was created.");
        }
    } catch (e) {
        console.log(e);
        errorMessage("Backup Error",
            "Ensure the directory selected is valid. Ensure no files will be overwritten when the backup is complete.")
    }
}

function getBackupLocation(): Promise<null | string> {
    return new Promise(resolve => {
        (ipcRenderer as IpcRenderer).invoke("backup", null).then((data: null | Electron.OpenDialogReturnValue) => {
            if (data != null) {
                resolve(data.filePaths[0]);
            } else {
                resolve(null);
            }
        })
    })
}

export { exportBackup, getBackupLocation }