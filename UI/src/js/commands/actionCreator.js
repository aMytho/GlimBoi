// Creates all of the actions that the bot uses (UI)
const fsPromise = require("fs").promises

async function buildChatMessageUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`${appData[0]}/UI/src/html/commands/actions/ChatMessage.html`)
    // Takes the data and converts it to text (html). Also sets the styles
    action.innerHTML = file.toString();
    action.className = "action";
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    // If a message exists we add it to the action
    if (commandInfo) {
        action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText = commandInfo.message
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

async function buildAudioUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`${appData[0]}/UI/src/html/commands/actions/Audio.html`)
    // Takes the data and converts it to text (html). Also sets the styles
    action.innerHTML = file.toString();
    action.className = "action";
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    // Now we fill the dropdown with our sound effects. This is pulled from the media tab.
    let audioSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
    let options = OBSHandle.getSounds()
    audioSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].name
        // If a sound was provided we have it be the selected item
        if (commandInfo && commandInfo.source == opt) {
            audioSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            audioSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

async function buildImageGifUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`${appData[0]}/UI/src/html/commands/actions/ImageGIF.html`)
    // Takes the data and converts it to text (html). Also sets the styles
    action.innerHTML = file.toString();
    action.className = "action";
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    // Now we fill the dropdown with our sound effects. This is pulled from the media tab.
    let imageGifSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
    let options = OBSHandle.getImages()
    imageGifSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].name
        // If a sound was provided we have it be the selected item
        if (commandInfo && commandInfo.source == opt) {
            imageGifSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            imageGifSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

async function buildVideoUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`${appData[0]}/UI/src/html/commands/actions/Video.html`)
    action.innerHTML = file.toString();
    action.className = "action";
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    let videoSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
    let options = OBSHandle.getVideos()
    videoSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].name
        if (commandInfo && commandInfo.source == opt) {
            videoSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            videoSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

async function buildWaitUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`${appData[0]}/UI/src/html/commands/actions/Wait.html`);
    action.innerHTML = file.toString();
    action.className = "action";
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    // If a message exists we add it to the action
    if (commandInfo) {
        action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText = commandInfo.wait
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

module.exports = {buildAudioUI, buildChatMessageUI, buildImageGifUI, buildVideoUI, buildWaitUI}