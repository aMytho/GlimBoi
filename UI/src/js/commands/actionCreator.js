// Creates all of the actions that the bot uses (UI)


function buildChatMessageUI(mode, commandInfo) {
    let action = document.createElement("div");
    fs.readFile(`${appData[0]}/UI/src/html/commands/actions/ChatMessage.html`, async (err, data) => {
        if (err) {
            throw err
        }
        // Takes the data and converts it to text (html). Also sets the styles
        action.innerHTML = await data.toString();
        action.className = "action";
        action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
        // If a message exists we add it to the action
        if (commandInfo) {
            action.children[1].firstElementChild.firstElementChild.firstElementChild.innerText = commandInfo.message
        }
        document.getElementById(`${mode}CommandList`).appendChild(action)
    })
}

function buildAudioUI(mode, commandInfo) {
    let action = document.createElement("div");
    fs.readFile(`${appData[0]}/UI/src/html/commands/actions/Audio.html`, async (err, data) => {
        if (err) {throw err}
        // Takes the data and converts it to text (html). Also sets the styles
        action.innerHTML = await data.toString();
        action.className = "action";
        action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
        // Now we fill the dropdown with our sound effects. This is pulled from the media tab.
        let audioSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
        let options = OBSHandle.getSounds()
        audioSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
        for (let i = 0; i < options.length; i++) {
            let opt = options[i].name
            // If a sound was provided we have it be the selected item
            if (commandInfo && commandInfo.sound == opt) {
                audioSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
            } else {
                audioSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
            }
        }
        document.getElementById(`${mode}CommandList`).appendChild(action)
    })
}

function buildImageGifUI(mode, commandInfo) {
    let action = document.createElement("div");
    fs.readFile(`${appData[0]}/UI/src/html/commands/actions/ImageGIF.html`, async (err, data) => {
        if (err) {throw err}
        // Takes the data and converts it to text (html). Also sets the styles
        action.innerHTML = await data.toString();
        action.className = "action";
        action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
        // Now we fill the dropdown with our sound effects. This is pulled from the media tab.
        let imageGifSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
        let options = OBSHandle.getImages()
        imageGifSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
        for (let i = 0; i < options.length; i++) {
            let opt = options[i].name
            // If a sound was provided we have it be the selected item
            if (commandInfo && commandInfo.media == opt) {
                imageGifSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
            } else {
                imageGifSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
            }
        }
        document.getElementById(`${mode}CommandList`).appendChild(action)
    })
}

module.exports = {buildAudioUI, buildChatMessageUI, buildImageGifUI}