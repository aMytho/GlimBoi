// File handles creating/deleting/updating files and folders

/**
 * Runs all migrations
 */
function migrate() {
    console.log("Checking for migrations");
    checkForScreenShots();
    checkForMediaOverlay();
}

/**
 * Creates the screenshots folder if it doesn't exist
 */
async function checkForScreenShots() {
    try {
        await fs.access(`${appData[1]}/screenshots`);
    } catch (e) {
        console.log("No screenshots found");
        fs.mkdir(`${appData[1]}/screenshots`);
    }
}

/**
 * Updates the media overlay file
 */
async function checkForMediaOverlay() {
    try {
        let mediaVersion: mediaOverlayVersion = CacheStore.get("mediaVersion", 1, true);
        // Need an upgrade to 2
        if (mediaVersion == 1) {
            console.log("Upgrading media overlay");
            let defaultFile = await fs.readFile(appData[0] + "/frontend/templates/connection.js");
            let defaultFileData = defaultFile.toString();
            let position = defaultFileData.indexOf("\n"); // Find the first new line
            if (position !== -1) {
                defaultFileData = defaultFileData.substr(position + 1);
                defaultFileData = "let url = `ws://" + CacheStore.get("serverUrl", "localhost") + ":" + CacheStore.get("serverPort", 3000) + "`;\n" + defaultFileData;
                console.log(defaultFileData);
                fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
            } else {
                throw "error with new line replacement in media file";
            }
            fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
            CacheStore.set("mediaVersion", 2);
        } else {
            console.log("Media overlay is up to date");
        }
    } catch (e) {
        console.log("Error checking for media overlay");
        console.log(e);
    }
}

export { migrate }