async function loadObsAction(action, isEdit:false | CommandType = false) {
    let html = await getObsHtml(action);
    if (isEdit) {
        html = fillObsData(isEdit, html)
    }
    console.log(html);
    return html;
}

function getObsHtml(action) {
    switch (action) {
        case "changeScene": return loadBasicHthml(action);
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
    switch (data.instruction) {
        case "changeScene":
            html.firstElementChild.firstElementChild.innerText = data.data["scene-name"];
            return html;
        case "replayBuffer":
            html.firstElementChild.firstElementChild.value = data.requestType;
            html.firstElementChild.firstElementChild.querySelector(`[value="${data.requestType}"]`).setAttribute("selected", "selected");
            return html;
        case "startStopStreamRecording":
            html.firstElementChild.firstElementChild.value = data.requestType;
            html.firstElementChild.firstElementChild.querySelector(`[value="${data.requestType}"]`).setAttribute("selected", "selected");
            return html;
        case "screenshot": return html
        case "none": return html
    }
}


export {fillObsData, loadObsAction}