// File handles creating/deleting/updating files and folders

import { ObsWebSocket } from "./commands/commandActionHandler";

/**
 * Runs all migrations
 */
function migrate() {
    console.log("Checking for migrations");
    checkForScreenShots();
    checkForMediaOverlay();
    checkForCommandTriggers();
    checkForOBSVersion();
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

async function checkForOBSVersion() {
    let obsVersion = CacheStore.get("obsVersion", 1);
    if (obsVersion < 2) {
        console.log(`OBS rpc needs an update! Updating to: ${obsVersion + 1}`);
        if (obsVersion == 1) {
            //User was on v4. Need upgrade to v5.
            let obsCommands = await CommandHandle.getAll();
            let promises = [];
            // For each command
            obsCommands.forEach((cmd) => { // Make sure it has actions
                if (cmd.actions && cmd.actions.length > 0) {
                    // Loop through each action and check for obswebsocket
                    cmd.actions.forEach((action, i) => {
                        if (action.action == "ObsWebSocket") {
                            // Needs migration
                            switch ((action as ObsWebSocket).requestType as string) {
                                case "SetMute":
                                    (action as ObsWebSocket).requestType = "SetInputMute";
                                    (action as ObsWebSocket).data.inputName = (action as ObsWebSocket).data.source;
                                    delete (action as ObsWebSocket).data.source;
                                    (action as ObsWebSocket).data.inputMuted = (action as ObsWebSocket).data.mute;
                                    delete (action as ObsWebSocket).data.mute;
                                    break;
                                case "ToggleMute":
                                    (action as ObsWebSocket).requestType = "ToggleInputMute";
                                    (action as ObsWebSocket).data.inputName = (action as ObsWebSocket).data.source;
                                    delete (action as ObsWebSocket).data.source;
                                    break;
                                case "SetVolume":
                                    (action as ObsWebSocket).requestType = "SetInputVolume";
                                    (action as ObsWebSocket).data.inputName = (action as ObsWebSocket).data.source;
                                    delete (action as ObsWebSocket).data.source;
                                    (action as ObsWebSocket).data.inputVolumeDb = (action as ObsWebSocket).data.volume;
                                    delete (action as ObsWebSocket).data.volume;
                                    break;
                                case "SetCurrentScene":
                                    (action as ObsWebSocket).requestType = "SetCurrentProgramScene";
                                    (action as ObsWebSocket).data.sceneName = (action as ObsWebSocket).data["scene-name"];
                                    delete (action as ObsWebSocket).data["scene-name"];
                                    break;
                                case "SetSceneItemRender":
                                    (action as ObsWebSocket).requestType = "SetSceneItemEnabled";
                                    (action as ObsWebSocket).data.sceneName = "Unknown";
                                    (action as ObsWebSocket).data.sceneItemId = 1;
                                    (action as ObsWebSocket).data.sceneItemEnabled = false;

                                    delete (action as ObsWebSocket).data["source"];
                                    delete (action as ObsWebSocket).data["render"];
                                    break;
                                case "StartStreaming":
                                    (action as ObsWebSocket).requestType = "StartStream";
                                    break;
                                case "StopStreaming":
                                    (action as ObsWebSocket).requestType = "StopStream";
                                    break;
                                case "StartRecording":
                                    (action as ObsWebSocket).requestType = "StartRecord";
                                    break;
                                case "StopRecording":
                                    (action as ObsWebSocket).requestType = "StopRecord";
                                    break;
                                case "TakeSourceScreenshot":
                                    (action as ObsWebSocket).requestType = "SaveSourceScreenshot";
                                    (action as ObsWebSocket).data.sourceName = "Unknown";
                                    (action as ObsWebSocket).data.imageFormat = (action as ObsWebSocket).data.embedPictureFormat;
                                    (action as ObsWebSocket).data.imageFilePath = (action as ObsWebSocket).data.saveToFilePath;
                                    delete (action as ObsWebSocket).data["embedPictureFormat"];
                                    delete (action as ObsWebSocket).data["saveToFilePath"];
                                    break;
                            }
                            
                            // Don't uncomment until you have a backup and you know all has been converted
                            promises.push(CommandHandle.updateCommand(cmd.commandName, "actions", cmd.actions));
                        }
                    })
                }
            });

            // Wait until all commands have been migrated
            await Promise.all(promises);
            CacheStore.set("obsVersion", 2);
        }
    } else {
        console.log("OBS rpc is already the latest version.");
    }
}

export { migrate }