async function loadObsAction(action, isEdit: false | CommandType = false) {
    let html = await getObsHtml(action);
    if (isEdit) {
        html = fillObsData(isEdit, html);
    }
    return html;
}

function getObsHtml(action) {
    switch (action) {
        case "none": return document.createElement("div");
        default: return loadBasicHthml(action);
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
        case "changeVisibility":
            html.firstElementChild.firstElementChild.firstElementChild;
            html.firstElementChild.firstElementChild.firstElementChild.innerText = data.data["source"];
            let sourceVisible;
            if (data.data["render"]) {
                sourceVisible = "show";
            } else {
                sourceVisible = "hide";
            }
            html.firstElementChild.children[2].firstElementChild.value = sourceVisible;
            html.firstElementChild.children[2].firstElementChild.querySelector(`[value="${sourceVisible}"]`).setAttribute("selected", "selected");
            return html;
        case "muteSource":
            html.firstElementChild.firstElementChild.firstElementChild.innerText = data.data["source"];
            if (data.requestType == "ToggleMute") {
                html.firstElementChild.children[2].firstElementChild.value = "toggleMute";
                html.firstElementChild.children[2].firstElementChild.querySelector(`[value="toggleMute"]`).setAttribute("selected", "selected");
            } else {
                let shouldMute;
                if (data.data["mute"] == true) {
                    shouldMute = "mute";
                } else {
                    shouldMute = "unMute";
                }
                html.firstElementChild.children[2].firstElementChild.value = shouldMute;
                html.firstElementChild.children[2].firstElementChild.querySelector(`[value="${shouldMute}"]`).setAttribute("selected", "selected");
            }
            return html;
        case "replayBuffer":
            html.firstElementChild.firstElementChild.value = data.requestType;
            html.firstElementChild.firstElementChild.querySelector(`[value="${data.requestType}"]`).setAttribute("selected", "selected");
            return html;
        case "setVolume":
            html.firstElementChild.firstElementChild.firstElementChild.innerText = data.data["source"];
            html.firstElementChild.children[2].children[1].value = String(data.data["volume"]);
            html.firstElementChild.children[2].children[2].innerText = data.data["volume"].toString();
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


export { fillObsData, loadObsAction }