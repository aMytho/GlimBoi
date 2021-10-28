// This could get messy, best be its own file

async function checkObsCommand(commandType, command) {
    switch (commandType) {
        case "changeScene": return getChangeSceneValue(command);
        case "changeVisibility": return getVisibilityValue(command);
        case "muteSource": return getMuteSourceInfo(command);
        case "replayBuffer": return getReplayBufferSelection(command);
        case "startStopStreamRecording": return getStartStopStreamingSelection(command);
        case "screenshot": return {type: "ObsWebSocket", requestType: "TakeSourceScreenshot", variables: [], data: {embedPictureFormat: `png`, saveToFilePath: `${appData[1]}/test.png` }, instruction: "screenshot"}
        case "none": return {error: "No OBS instruction was selected."}
    }
}

function getChangeSceneValue(command) {
    let scene = command.firstElementChild.firstElementChild.innerText;
    return {type: "ObsWebSocket", requestType: "SetCurrentScene", variables: [], data: {"scene-name": scene}, instruction: "changeScene"};
}

function getReplayBufferSelection(command) {
    let selection = command.firstElementChild.firstElementChild.value;
    switch (selection) {
        case "StartReplayBuffer": return {type: "ObsWebSocket", requestType: "StartReplayBuffer", variables: [], instruction: "replayBuffer"};
        case "StopReplayBuffer": return {type: "ObsWebSocket", requestType: "StopReplayBuffer", variables: [], instruction: "replayBuffer"};
        case "SaveReplayBuffer": return {type: "ObsWebSocket", requestType: "SaveReplayBuffer", variables: [], instruction: "replayBuffer"};
    }
}


function getStartStopStreamingSelection(command) {
    let selection = command.firstElementChild.firstElementChild.value;
    switch (selection) {
        case "startStream": return {type: "ObsWebSocket", requestType: "StartStreaming", variables: [], instruction: "startStopStreamRecording"};
        case "stopStream": return {type: "ObsWebSocket", requestType: "StopStreaming", variables: [], instruction: "startStopStreamRecording"};
        case "startRecording": return {type: "ObsWebSocket", requestType: "StartRecording", variables: [], instruction: "startStopStreamRecording"};
        case "stopRecording": return {type: "ObsWebSocket", requestType: "StopRecording", variables: [], instruction: "startStopStreamRecording"};
    }
}

function getMuteSourceInfo(command: HTMLElement) {
    let source = (command.firstElementChild.firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText;
    let actionToTake = (command.firstElementChild.lastElementChild.firstElementChild.firstElementChild as HTMLSelectElement).value;
    if (actionToTake == "toggleMute") {
        return { type: "ObsWebSocket", requestType: "ToggleMute", variables: [], data: { source: source }, instruction: "muteSource" };
    } else {
        let shouldMute = (actionToTake == "mute")
        return { type: "ObsWebSocket", requestType: "SetMute", variables: [], data: {source: source, mute: shouldMute}, instruction: "muteSource" };
    }
}

function getVisibilityValue(command) {
    let source = (command.firstElementChild.firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText;
    let actionToTake = (command.firstElementChild.lastElementChild.firstElementChild.firstElementChild as HTMLSelectElement).value;
    if (actionToTake == "hide") {
        return { type: "ObsWebSocket", requestType: "SetSceneItemRender", variables: [], data: { source: source, render: false }, instruction: "changeVisibility" };
    } else {
        return { type: "ObsWebSocket", requestType: "SetSceneItemRender", variables: [], data: { source: source, render: true }, instruction: "changeVisibility" };
    }
}

export { checkObsCommand }