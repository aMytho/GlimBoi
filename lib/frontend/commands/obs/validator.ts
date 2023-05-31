// This could get messy, best be its own file

async function checkObsCommand(commandType, command) {
    switch (commandType) {
        case "changeScene": return getChangeSceneValue(command);
        case "changeVisibility": return getVisibilityValue(command);
        case "muteSource": return getMuteSourceInfo(command);
        case "replayBuffer": return getReplayBufferSelection(command);
        case "setVolume": return getVolumeValue(command);
        case "startStopStreamRecording": return getStartStopStreamingSelection(command);
        case "screenshot": return {type: "ObsWebSocket", requestType: "TakeSourceScreenshot", variables: [], data: {embedPictureFormat: `png`, saveToFilePath: `${appData[1]}/test.png` }, instruction: "screenshot"}
        case "none": return {error: "No OBS instruction was selected."}
    }
}

function getChangeSceneValue(command) {
    let scene = command.firstElementChild.firstElementChild.innerText;
    return {type: "ObsWebSocket", requestType: "SetCurrentProgramScene", variables: [], data: {sceneName: scene}, instruction: "changeScene"};
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
        case "startStream": return {type: "ObsWebSocket", requestType: "StartStream", variables: [], instruction: "startStopStreamRecording"};
        case "stopStream": return {type: "ObsWebSocket", requestType: "StopStream", variables: [], instruction: "startStopStreamRecording"};
        case "startRecording": return {type: "ObsWebSocket", requestType: "StartRecord", variables: [], instruction: "startStopStreamRecording"};
        case "stopRecording": return {type: "ObsWebSocket", requestType: "StopRecord", variables: [], instruction: "startStopStreamRecording"};
    }
}

function getMuteSourceInfo(command: HTMLElement) {
    let source = (command.firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText;
    let actionToTake = (command.firstElementChild.children[2].firstElementChild as HTMLSelectElement).value;
    if (actionToTake == "toggleMute") {
        return { type: "ObsWebSocket", requestType: "ToggleInputMute", variables: [], data: { inputName: source }, instruction: "muteSource" };
    } else {
        let shouldMute = (actionToTake == "mute")
        return { type: "ObsWebSocket", requestType: "SetInputMute", variables: [], data: {inputName: source, inputMuted: shouldMute}, instruction: "muteSource" };
    }
}

function getVisibilityValue(command) {
    let source = (command.firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText;
    let actionToTake = (command.firstElementChild.children[2].firstElementChild as HTMLSelectElement).value;
    if (actionToTake == "hide") {
        return { type: "ObsWebSocket", requestType: "SetSceneItemEnabled", variables: [], data: { sceneName: source, sceneItemId: 1, sceneItemEnabled: false }, instruction: "changeVisibility" };
    } else {
        return { type: "ObsWebSocket", requestType: "SetSceneItemEnabled", variables: [], data: { sceneName: source, sceneItemId: 1, sceneItemEnabled: true }, instruction: "changeVisibility" };
    }
}

function getVolumeValue(command) {
    let source = (command.firstElementChild.firstElementChild.firstElementChild as HTMLSpanElement).innerText;
    let volume = (command.firstElementChild.children[2].children[2] as HTMLParagraphElement).innerText;
    return {type: "ObsWebSocket", requestType: "SetInputVolume", variables: [], data: {inputName: source.trim(), inputVolumeDb: parseFloat(volume)}, instruction: "setVolume"};
}

export { checkObsCommand }