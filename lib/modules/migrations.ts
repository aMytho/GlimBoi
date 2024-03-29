// File handles creating/deleting/updating files and folders

/**
 * Runs all migrations
 */
function migrate() {
    console.log("Checking for migrations");
    checkForScreenShots();
    checkForMediaOverlay();
    checkForCommandTriggers();
    checkForHoldOnAMinCommaCriesCommaTheFinalUpdate()
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
        let mediaVersion: mediaOverlayVersion = CacheStore.get("mediaVersion", 2, true);
        // Need an upgrade to 3
        if (mediaVersion <= 3) {
            console.log("Upgrading media overlay");
            let defaultFile = await fs.readFile(appData[0] + "/frontend/templates/connection.js");
            let defaultFileData = defaultFile.toString();
            let position = defaultFileData.indexOf("\n"); // Find the first new line
            if (position !== -1) {
                defaultFileData = defaultFileData.substr(position + 1);
                defaultFileData = "let url = `ws://" + CacheStore.get("serverUrl", "localhost") + ":" + CacheStore.get("serverPort", 3000) + "`;\n" + defaultFileData;
                fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
            } else {
                throw "error with new line replacement in media file";
            }
            fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
            CacheStore.set("mediaVersion", 4); // Always 1 more than the max version. Should probably change that.
        } else {
            console.log("Media overlay is up to date");
        }
    } catch (e) {
        console.log("Error checking for media overlay");
        console.log(e);
    }
}

async function checkForCommandTriggers() {
    let hasTriggers = CacheStore.get("hasCommandTriggers", false);
    if (!hasTriggers) {
        // The user has no triggers, convert their commands to add them.
        console.log("No triggers found, converting commands");
        let commands = await CommandHandle.getAll();
        commands = commands.filter(command => command.triggers === undefined || command.triggers.length === 0);
        let promises = [];
        for (let command of commands) {
            promises.push(CommandHandle.addDefaultTrigger(command.commandName));
        }
        await Promise.all(promises);
        console.log("Commands converted");
        CacheStore.set("hasCommandTriggers", true);
    } else {
        console.log("Triggers found, skipping conversion");
    }
}

function checkForHoldOnAMinCommaCriesCommaTheFinalUpdate() {
    // Oh well, we had fun.
    let knowsAboutTheEnd = CacheStore.get("setFinalURL", false);
    if (!knowsAboutTheEnd) {
        // But now the end has come..
        
        CacheStore.setMultiple([
            {glimeshURL: "glimesh.tv"},
            {useGlimeshHTTPS: true},
            {setFinalURL: true}
        ]); // Sets all the values for custom servers. Defaults to glimesh.tv
        
        // My glimboi dev is now done...
    }
}

export { migrate }