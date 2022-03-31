// Creates all of the actions that the bot uses (UI)

async function buildChatMessageUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("ChatMessage");
    // If a message exists we add it to the action
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.message;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildApiRequestGetUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("ApiRequestGet");
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
            (action.children[1].children[1].firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[0].variable;
        } else {
            (action.children[1].firstElementChild.children[1].firstElementChild as HTMLInputElement).value = "json"
            switchAPIView("json", action);
            for (let i = 0; i < commandInfo.returns.length; i++) {
                if (i == 0) {
                    (action.children[1].children[1].children[2].firstElementChild.firstElementChild.children[1].children[1].firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[i].data;
                    (action.children[1].children[1].children[2].firstElementChild.firstElementChild.children[1].children[2].firstElementChild as HTMLParagraphElement).innerText = commandInfo.returns[i].variable;
                    continue;
                }
                addJSONRow(action.children[1].children[1].children[2].firstElementChild.firstElementChild, mode, "ApiRow", commandInfo.returns[i])
            }
        }
        if (commandInfo.headers[0]) {
            console.log(commandInfo.headers)
            for (let i = 0; i < commandInfo.headers.length; i++) {
                if (i == 0) {
                    (action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children[1].children[1].firstElementChild as HTMLParagraphElement).innerText = commandInfo.headers[i][0];
                    (action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild.children[1].children[2].firstElementChild as HTMLParagraphElement).innerText = commandInfo.headers[i][1];
                    continue;
                }
                addJSONRow(action.children[1].children[2].firstElementChild.firstElementChild.firstElementChild, mode, "HeaderRow", {variable: commandInfo.headers[i][1], data: commandInfo.headers[i][0]});
            }
        }
    }
    document.getElementById(`${mode}CommandList`).appendChild(action);
}

/**
 * Adds a row to one of the tables for the API Action
 * @param {HTMLElement} table The table (tbody) we are adding the row to
 * @param {string} mode "Add or Edit"
 * @param {string} filePath Which file we are adding (file contains the new row info)
 */
async function addJSONRow(table, mode:actionMode, filePath, fill?) {
    let tr = document.createElement("tr");
    let file = await fs.readFile(dirName + `/html/commands/actions/resources/${filePath}.html`)
    tr.innerHTML = file.toString();
    tr.firstElementChild.firstElementChild.addEventListener("click", event => {
        addJSONRow(table, mode, filePath);
        document.getElementById(`command${mode}ModalBody`).scrollTo(0,document.getElementById(`${mode}CommandList`).parentElement.scrollHeight);
    })
    tr.firstElementChild.children[1].addEventListener("click", event => {
        if ((event.target as HTMLElement).parentElement.parentElement.nodeName == "TR") {
            (event.target as HTMLElement).parentElement.parentElement.remove();
        } else {
            (event.target as HTMLElement).parentElement.parentElement.parentElement.remove();
        }
    }, true);
    if (fill) {
        (tr.children[1].firstElementChild as HTMLParagraphElement).innerText = fill.data;
        (tr.children[2].firstElementChild as HTMLParagraphElement).innerText = fill.variable;
    }
    table.appendChild(tr)
}

function switchAPIView(view, action) {
    if (view == "text") {
        action.children[1].children[1].firstElementChild.classList = "";
        action.children[1].children[1].children[1].classList = "";
        action.children[1].children[1].children[2].classList = "hidden";
        action.children[1].children[1].children[3].classList = "hidden";
    } else {
        action.children[1].children[1].firstElementChild.classList = "hidden";
        action.children[1].children[1].children[1].classList = "hidden";
        action.children[1].children[1].children[2].classList = "col-span-2";
        action.children[1].children[1].children[3].classList = "col-span-2";
    }
}

async function buildAudioUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Audio")
    // Now we fill the dropdown with our sound effects. This is pulled from the media tab.
    let audioSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild;
    let options = await MediaHandle.getMediaByType("audio");
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

async function buildBanUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Ban");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.target;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildFollowUI(mode: actionMode, commandInfo) {
    let action = await getActionHTML("Follow");
    if (commandInfo) {
        console.log(action.children[1].children[0].firstElementChild.firstElementChild);
        (action.children[1].children[2].firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.target;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLSelectElement).value = commandInfo.liveNotifications == true ? "enabled" : "disabled";
        (action.children[1].children[0].firstElementChild.firstElementChild as HTMLSelectElement).value = commandInfo.follow == true ? "follow" : "unFollow";
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildImageGifUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("ImageGif");
    let imageGifSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild
    let options = await MediaHandle.getMediaByType("image");
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

async function buildMatrixUI(mode, commandInfo) {
    let action = await getActionHTML("Matrix");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLTextAreaElement).innerText = commandInfo.message;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLTextAreaElement).innerText = commandInfo.room;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildReadFileUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("ReadFile");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.lastElementChild as HTMLInputElement).innerText = commandInfo.file;
        (action.children[1].lastElementChild.firstElementChild.firstElementChild as HTMLInputElement).innerText = commandInfo.returns[0].variable;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildObsWebSocketUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("ObsWebSocket");
    (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLSelectElement).onchange = async function(event) {
        let obsActionResources:typeof import("../commands/obs/resources") = require(appData[0] + "/frontend/commands/obs/resources.js");
        // Returns the HTML for the OBS action
        let obsAction = await obsActionResources.loadObsAction((event.target as HTMLOptionElement).value);
        // sets the HTML
        action.children[1].lastElementChild.innerHTML = obsAction.innerHTML;
        action.children[1].lastElementChild.id = (event.target as HTMLOptionElement).value;
    }
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLSelectElement).value = commandInfo.instruction;
        let obsActionResources:typeof import("../commands/obs/resources") = require(appData[0] + "/frontend/commands/obs/resources.js");
        let obsAction = await obsActionResources.loadObsAction(commandInfo.instruction, commandInfo);
        // sets the HTML
        action.children[1].lastElementChild.innerHTML = obsAction.innerHTML;
        action.children[1].lastElementChild.id = commandInfo.instruction;
        //obsActionResources.fillObsData(commandInfo, action.children[1].firstElementChild);
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}



async function buildPointsUI(mode: actionMode, commandInfo) {
    let action = await getActionHTML("Points");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText = commandInfo.target;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLSpanElement).innerText = commandInfo.points.toString();
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}


async function buildTimeoutUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Timeout");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.target;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLSelectElement).value = commandInfo.duration;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildTweetUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Twitter");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.tweetMessage;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildVideoUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Video");
    let videoSelect = action.children[1].firstElementChild.firstElementChild.firstElementChild;
    let options = await MediaHandle.getMediaByType("video");
    videoSelect.innerHTML += "<option value=\"" + "None" + "\">" + "None (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].name
        if (commandInfo && commandInfo.source == opt) {
            videoSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            videoSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildWaitUI(mode:actionMode, commandInfo) {
    let action = await getActionHTML("Wait")
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.firstElementChild as HTMLParagraphElement).innerText = commandInfo.wait;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function buildWriteFileUI(mode: actionMode, commandInfo) {
    let action = await getActionHTML("WriteFile");
    if (commandInfo) {
        (action.children[1].firstElementChild.firstElementChild.lastElementChild as HTMLDivElement).innerText = commandInfo.file;
        (action.children[1].children[1].firstElementChild.firstElementChild as HTMLSpanElement).innerText = commandInfo.data;
    }
    document.getElementById(`${mode}CommandList`)!.appendChild(action);
}

async function getActionHTML(action: string) {
    let div = document.createElement("div");
    let file = await fs.readFile(dirName + `/html/commands/actions/${action}.html`);
    div.innerHTML = file.toString();
    div.className = "action";// @ts-ignore
    div.style = "border: 1px solid darkslategray; background-color: rgb(64, 91, 134); width: 100%; height: 100%;"
    return div;
}

export {buildApiRequestGetUI, buildAudioUI, buildBanUI, buildChatMessageUI,buildFollowUI,
    buildImageGifUI, buildReadFileUI, buildMatrixUI, buildObsWebSocketUI, buildPointsUI,
    buildTimeoutUI, buildTweetUI, buildVideoUI, buildWaitUI, buildWriteFileUI}