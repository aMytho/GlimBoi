async function loadObsAction(action, isEdit:false | CommandType = false) {
    let html = await getObsHtml(action);
    if (isEdit) {
        html = fillObsData(isEdit, html)
    }
    return html;
}

function getObsHtml(action) {
    switch (action) {
        case "changeScene": return loadBasicHthml(action);
        case "muteSource": return loadBasicHthml(action);
        case "replayBuffer": return loadBasicHthml(action);
        case "startStopStreamRecording": return loadBasicHthml(action);
        case "screenshot": return loadBasicHthml(action);
        case "none": return document.createElement("div");
    }
}

async function loadBasicHthml(action) {
    let div = document.createElement("div");
    let file = await fs.readFile(dirName + `/html/commands/actions/resources/obs/${action}.html`);
    div.innerHTML = file.toString();
    return div;
}

function fillObsData(data, html) {
    console.log(html)
    console.log(data)
    switch (data.instruction) {
        case "changeScene":
            html.firstElementChild.firstElementChild.innerText = data.data["scene-name"];
            return html;
        case "muteSource":
            html.firstElementChild.firstElementChild.firstElementChild.firstElementChild.innerText = data.data["source"];
            if (data.requestType == "ToggleMute") {
                html.firstElementChild.lastElementChild.firstElementChild.firstElementChild.value = "toggleMute";
                html.firstElementChild.lastElementChild.firstElementChild.firstElementChild.querySelector(`[value="toggleMute"]`).setAttribute("selected", "selected");
            } else {
                let shouldMute;
                if (data.data["mute"] == true) {
                    shouldMute = "mute";
                } else {
                    shouldMute = "unMute";
                }
                html.firstElementChild.lastElementChild.firstElementChild.firstElementChild.value = shouldMute;
                html.firstElementChild.lastElementChild.firstElementChild.firstElementChild.querySelector(`[value="${shouldMute}"]`).setAttribute("selected", "selected");
            }
            return html;
        case "replayBuffer":
            html.firstElementChild.firstElementChild.value = data.requestType;
            html.firstElementChild.firstElementChild.querySelector(`[value="${data.requestType}"]`).setAttribute("selected", "selected");
            return html;
        case "startStopStreamRecording":
            switch (data.requestType) {
                case "StartStreaming": data.requestType = "startStream"; break
                case "StopStreaming": data.requestType = "stopStream"; break
                case "StartRecording": data.requestType = "startRecording"; break
                case "StopRecording": data.requestType = "stopRecording"; break
            }
            html.firstElementChild.firstElementChild.value = data.requestType;
            html.firstElementChild.firstElementChild.querySelector(`[value="${data.requestType}"]`).setAttribute("selected", "selected");
            return html;
        case "screenshot": return html
        case "none": return html
    }
}


export {fillObsData, loadObsAction}