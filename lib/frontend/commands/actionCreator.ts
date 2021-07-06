// Creates all of the actions that the bot uses (UI)
const fsPromise = require("fs").promises

async function buildChatMessageUI(mode:actionMode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src//html/commands/actions/ChatMessage.html`)
    // Takes the data and converts it to text (html). Also sets the styles
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    // If a message exists we add it to the action
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.message
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action)
}

async function buildApiRequestGetUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/ApiRequestGet.html`)
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;";
    action.children[1].firstElementChild.children[1].firstElementChild.addEventListener("change", event => {
        switchAPIView((action.children[1].firstElementChild.children[1].firstElementChild as HTMLInputElement).value, action)
    })
    // Onclick adds a new row to add a JSON search key
    action.children[1].children[1].children[2].firstElementChild.firstElementChild.children[1].firstElementChild.addEventListener("click", async event => {
        await addJSONRow(action.children[1].children[1].children[2].firstElementChild.firstElementChild, mode, "ApiRow");
        document.getElementById(`command${mode}ModalBody`).scrollTo(0,document.getElementById(`${mode}CommandList`).parentElement.scrollHeight);
    })
    //Onclick adds header row
    action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children[1].firstElementChild.firstElementChild.addEventListener("click", async event => {
        await addJSONRow(action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild, mode, "HeaderRow");
        document.getElementById(`command${mode}ModalBody`).scrollTo(0,document.getElementById(`${mode}CommandList`).parentElement.scrollHeight);
    })
    if (commandInfo) {
        // Sets the URL
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLInputElement).innerText = commandInfo.url;
        // If the prop is null it is a text command, if not then its JSON.
        if (commandInfo.returns[0].data == null) {
            (action.children[1].children[1].firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[0].variable
        } else {
            (action.children[1].firstElementChild.children[1].firstElementChild as HTMLInputElement).value = "json"
            switchAPIView("json", action);
            for (let i = 0; i < commandInfo.returns.length; i++) {
                if (i == 0) {
                    (action.children[1].children[1].children[2].firstElementChild.firstElementChild.children[1].children[1].firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[i].data
                    (action.children[1].children[1].children[2].firstElementChild.firstElementChild.children[1].children[2].firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[i].variable
                    continue;
                }
                addJSONRow(action.children[1].children[1].children[2].firstElementChild.firstElementChild, mode, "ApiRow", commandInfo.returns[i])
            }
        }
        if (commandInfo.headers[0]) {
            console.log(commandInfo.headers)
            for (let i = 0; i < commandInfo.headers.length; i++) {
                if (i == 0) {
                    (action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children[1].children[1].firstElementChild as HTMLParagraphElement).innerText = commandInfo.headers[i][0]
                    (action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children[1].children[2].firstElementChild as HTMLParagraphElement).innerText = commandInfo.headers[i][1]
                    continue;
                }
                addJSONRow(action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild, mode, "HeaderRow", {variable: commandInfo.headers[i][1], data: commandInfo.headers[i][0]})
            }
        }
    }
    document.getElementById(`${mode}CommandList`).appendChild(action)
}

/**
 * Adds a row to one of the tables for the API Action
 * @param {HTMLElement} table The table (tbody) we are adding the row to
 * @param {string} mode "Add or Edit"
 * @param {string} filePath Which file we are adding (file contains the new row info)
 */
async function addJSONRow(table, mode, filePath, fill?) {
    let tr = document.createElement("tr");
    let file = await fsPromise.readFile(`src/html/commands/actions/resources/${filePath}.html`)
    tr.innerHTML = file.toString();
    tr.firstElementChild.firstElementChild.addEventListener("click", event => {
        addJSONRow(table, mode, filePath);
        document.getElementById(`command${mode}ModalBody`).scrollTo(0,document.getElementById(`${mode}CommandList`).parentElement.scrollHeight);
    })
    tr.firstElementChild.children[1].addEventListener("click", event => {
        if ((event.target as HTMLElement).parentElement.parentElement.nodeName == "TR") {
            (event.target as HTMLElement).parentElement.parentElement.remove()
        } else {
            (event.target as HTMLElement).parentElement.parentElement.parentElement.remove()
        }
    }, true);
    if (fill) {
        (tr.children[1].firstElementChild as HTMLParagraphElement).innerText = fill.data
        (tr.children[2].firstElementChild as HTMLParagraphElement).innerText = fill.variable
    }
    table.appendChild(tr)
}

function switchAPIView(view, action) {
    if (view == "text") {
        action.children[1].children[1].firstElementChild.classList = "col-6";
        action.children[1].children[1].children[1].classList = "col-6";
        action.children[1].children[1].children[2].classList = "col-12 hidden";
        action.children[1].children[1].children[3].classList = "col-12 hidden";
    } else {
        action.children[1].children[1].firstElementChild.classList = "col-6 hidden";
        action.children[1].children[1].children[1].classList = "col-6 hidden";
        action.children[1].children[1].children[2].classList = "col-12";
        action.children[1].children[1].children[3].classList = "col-12";
    }
}

async function buildAudioUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/Audio.html`)
    // Takes the data and converts it to text (html). Also sets the styles
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
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
    document.getElementById(`${mode}CommandList`)!.appendChild(action)
}

async function buildImageGifUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/ImageGIF.html`)
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    let imageGifSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
    let options = OBSHandle.getImages()
    imageGifSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].name
        if (commandInfo && commandInfo.source == opt) {
            imageGifSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            imageGifSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action)
}

async function buildTimeoutUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/Timeout.html`)
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    console.log(action)
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.target;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLSelectElement).value = commandInfo.duration;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action)

}

async function buildVideoUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/Video.html`)
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
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
    document.getElementById(`${mode}CommandList`)!.appendChild(action)
}

async function buildWaitUI(mode, commandInfo) {
    let action = document.createElement("div");
    let file = await fsPromise.readFile(`src/html/commands/actions/Wait.html`);
    action.innerHTML = file.toString();
    action.className = "action";// @ts-ignore
    action.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.wait
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action)
}

export  {buildApiRequestGetUI, buildAudioUI, buildChatMessageUI, buildImageGifUI, buildTimeoutUI, buildVideoUI, buildWaitUI}