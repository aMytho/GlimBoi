import { IpcRenderer } from "electron";

async function exportBackup(selectedFiles: { name: string, copy: boolean }[]) {
    try {
        let location = await getBackupLocation();
        if (location) {
            selectedFiles.forEach(file => {
                if (file.copy) {
                    fs.copyFile(`${appData[1]}/data/${file.name}.db`, `${location}/${file.name}.db`);
                }
            });
            console.log("Backup Complete");
            successMessage("Backup Complete", `Your backup has been created at ${location}.`);
        } else {
            errorMessage("Backup Error", "No folder was selected. No backup was created.");
        }
    } catch (e) {
        console.log(e);
        errorMessage("Backup Error",
            "Ensure the directory selected is valid. Ensure no files will be overwritten when the backup is complete.");
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

async function importBackup(selectedFiles: { name: string, copy: boolean }[]) {
    try {
        let location = await getBackupLocation();
        if (location) {
            // Check that every file selected exists
            for (let i = 0; i < selectedFiles.length; i++) {
                if (selectedFiles[i].copy) {
                    try {
                        await fs.access(`${location}/${selectedFiles[i].name}.db`);
                    } catch(e) {
                        errorMessage("Import Error", `The file ${selectedFiles[i].name}.db does not exist in the selected folder.`);
                        return;
                    }
                }
            }
            (ipcRenderer as IpcRenderer).send("window", "import", location, selectedFiles.filter(file => file.copy));
        } else {
            errorMessage("Backup Error", "No folder was selected. No data was imported.");
        }
    } catch(e) {
        console.log(e);
        errorMessage("Import Error",
        "Ensure the directory has the selected files.");
    }
}

export { exportBackup, getBackupLocation, importBackup }