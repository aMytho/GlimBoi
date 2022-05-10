// handles all the data from command modals

const ActionCreator:ActionCreator = require(appData[0] + "/frontend/commands/actionCreator.js");

function prepareActions(mode, modal: Modal) {
    document.getElementById(`${mode}CommandButtonModal`)!.onclick = async function () {
        const commandValidator: typeof import("../commands/commandValidator") = require(appData[0] + "/frontend/commands/commandValidator.js");
        // First we check the triggers
        const triggers = commandValidator.validateTriggers(mode);
        if (triggers) {
            console.log("Triggers are valid");
        } else {
            console.log("Triggers are invalid");
            return;
        }
        // Next we check the settings
        let commandSettings = await commandValidator.validateSettings(mode);
        if (commandSettings) {
            console.log("All command settings for this command are valid.");
        } else {
            console.log("Command settings were not valid.");
            return
        }
        // Now we check each action
        let tempCommandActions = await commandValidator.validateActions(mode);
        if (!tempCommandActions) {
            console.log("Command actions were not valid.");
            return
        }
        // Finally we build the actions and add them as a command
        let commandActions = [];
        tempCommandActions.forEach(element => {
            let tempAction = new CommandHandle.ChatAction[`${element.type}`](element);
            commandActions.push(tempAction);
        });
        // Now we add the actions and triggers to the command. Command complete!
        commandSettings.actions = commandActions;
        commandSettings.triggers = triggers;
        console.log(commandSettings);

        if (mode == "add") {
            CommandHandle.addCommand(commandSettings as CommandType);
            addCommandTable(commandSettings as CommandType);
            modal.hide();
            showToast("Command added!");
        } else {
            console.log("Command Edit Finished");
            CommandHandle.editCommand(commandSettings as CommandType);
            editCommandTable(commandSettings as CommandType);
            modal.hide();
            showToast("Command edited!");
        }
    }

    document.getElementById("CreateChatMessage")!.onclick = () => addActionToUI("ChatMessage", mode);
    document.getElementById("CreateApiRequest")!.onclick = () => addActionToUI("ApiRequest", mode);
    document.getElementById("CreateAudio")!.onclick = () => addActionToUI("Audio", mode);
    document.getElementById("CreateBan")!.onclick = () => addActionToUI("Ban", mode);
    document.getElementById("CreateFollow")!.onclick = () => addActionToUI("Follow", mode);
    document.getElementById("CreateImageGif")!.onclick = () => addActionToUI("ImageGif", mode);
    document.getElementById("CreateMatrix")!.onclick = () => addActionToUI("Matrix", mode);
    document.getElementById("CreateObsWebSocket")!.onclick = () => addActionToUI("ObsWebSocket", mode);
    document.getElementById("CreateReadFile")!.onclick = () => addActionToUI("ReadFile", mode);
    document.getElementById("CreatePoints")!.onclick = () => addActionToUI("Points", mode);
    document.getElementById("CreateVideo")!.onclick = () => addActionToUI("Video", mode);
    document.getElementById("CreateTimeout")!.onclick = () => addActionToUI("Timeout", mode);
    document.getElementById("CreateTweet")!.onclick = () => addActionToUI("Twitter", mode);
    document.getElementById("CreateWait")!.onclick = () => addActionToUI("Wait", mode);
    document.getElementById("CreateWriteFile")!.onclick = () => addActionToUI("WriteFile", mode);
}

function prepareModals(mode: "add" | "edit", modal: Modal) {
    document.getElementById(`${mode}CloseModal`)!.onclick = () => modal.hide();
    setTimeout(() => {
        document.getElementById(`${mode}OpenMenu`).click();
    }, 700);
}

async function loadModalAdd(modal: Modal) {
    let data = await fs.readFile(dirName + `/html/commands/addCommand.html`);
    document.getElementById(`commandContent`)!.innerHTML = data.toString();
    let selectRank = document.getElementById("addCommandRank");
    let options = await RankHandle.getAll();
    selectRank.innerHTML += "<option value=\"" + "Everyone" + "\">" + "Everyone (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        selectRank.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
    }
    prepareModals("add", modal);
    prepareActions("add", modal);
    handleTriggerSelection("add");
    (document.getElementById(`addTriggerAdd`) as HTMLButtonElement).click();
    addActionToUI("ChatMessage", "add");
    loadFlowbite();
}

async function loadModalEdit(command: CommandType, modal: Modal) {
    let data = await fs.readFile(dirName + `/html/commands/editCommand.html`);
    document.getElementById(`commandContent`)!.innerHTML = data.toString();
    await insertEditData(command);
    prepareModals("edit", modal);
    prepareActions("edit", modal);
    handleTriggerSelection("edit", command.triggers);
    loadFlowbite();
}

/**
 * Based on the action we build the corresponding UI element
 * @param {string} action
 * @param {string} mode add or edit
 * @param {object} data The action data
 */
async function addActionToUI(action: actionName, mode: actionMode, data?: object) {
    switch (action) {
        case "ChatMessage": await ActionCreator.buildChatMessageUI(mode, data);
            break;

        case "ApiRequestGet": // Legacy
        case "ApiRequest": await ActionCreator.buildApiRequestUI(mode, data);
            break;

        case "Audio": await ActionCreator.buildAudioUI(mode, data);
            break;

        case "Ban": await ActionCreator.buildBanUI(mode, data);
            break;

        case "Follow": await ActionCreator.buildFollowUI(mode, data);
            break;

        case "ImageGif": await ActionCreator.buildImageGifUI(mode, data);
        break;

        case "Matrix": await ActionCreator.buildMatrixUI(mode, data);
        break;

        case "ObsWebSocket": await ActionCreator.buildObsWebSocketUI(mode, data);
        break;

        case "Points": await ActionCreator.buildPointsUI(mode, data);
        break;

        case "ReadFile": await ActionCreator.buildReadFileUI(mode, data);
        break;

        case "Timeout": await ActionCreator.buildTimeoutUI(mode, data);
        break;

        case "Twitter": await ActionCreator.buildTweetUI(mode, data);
        break;

        case "Video": await ActionCreator.buildVideoUI(mode, data);
        break;

        case "Wait": await ActionCreator.buildWaitUI(mode, data);
        break;

        case "WriteFile": await ActionCreator.buildWriteFileUI(mode, data);
        break;
        default: null
        break
    }
    document.getElementById(`command${mode}ModalBody`).scrollTo(0,document.getElementById(`${mode}CommandList`).parentElement.scrollHeight);
}

/**
 * Fills the modal with the commands data
 * @param {CommandType} command The command we are using
 */
async function insertEditData(command:CommandType) {
    // Sets the name, uses, and points
    (document.getElementById("editCommandName") as HTMLInputElement)!.value = command.commandName;
    (document.getElementById("editCommandPoints") as HTMLInputElement)!.value = `${command.points}`;
    (document.getElementById("editCommandUses") as HTMLInputElement)!.value = `${command.uses}`;

    // Sets the cooldown if any
    if (command.cooldown == undefined) {
        (document.getElementById("editCommandCooldown") as HTMLInputElement)!.value = "0"
    } else {
        (document.getElementById("editCommandCooldown") as HTMLInputElement)!.value = `${command.cooldown}`
    }

    // Selects the rank of the command if any
    let selectRank = document.getElementById("editCommandRank");
    let options = await RankHandle.getAll();
    selectRank.innerHTML += "<option value=\"" + "Everyone" + "\">" + "Everyone (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        if (command.rank == opt) {
            selectRank.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            selectRank.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }

    // Enables or disables the repeat property
    let repeatEnabled = document.getElementById("editCommandRepeat")!;
    if (command.repeat == true) {
        repeatEnabled.innerHTML += "<option value=\"" + "true" + "\" selected>" + "Enabled" + "</option>";
        repeatEnabled.innerHTML += "<option value=\"" + "false" + "\">" + "Disabled (Default)" + "</option>";
    } else if (command.repeat == false) {
        repeatEnabled.innerHTML += "<option value=\"" + "true" + "\">" + "Enabled" + "</option>";
        repeatEnabled.innerHTML += "<option value=\"" + "false" + "\" selected>" + "Disabled (Default)" + "</option>";
    }

    // Enables or disables the shouldDelete property
    let deleteEnabled = document.getElementById("editCommandDelete")!;
    if (command.shouldDelete == true) {
        deleteEnabled.innerHTML += "<option value=\"" + "true" + "\" selected>" + "Enabled" + "</option>";
        deleteEnabled.innerHTML += "<option value=\"" + "false" + "\">" + "Disabled (Default)" + "</option>";
    } else {
        deleteEnabled.innerHTML += "<option value=\"" + "true" + "\">" + "Enabled" + "</option>";
        deleteEnabled.innerHTML += "<option value=\"" + "false" + "\" selected>" + "Disabled (Default)" + "</option>";
    }

    // Enabled or disabled the disable property
    let disableEnabled = document.getElementById("editCommandDisabled")!;
    if (command.disabled == true) {
        disableEnabled.innerHTML += "<option value=\"" + "true" + "\" selected>" + "Disable Command" + "</option>";
        disableEnabled.innerHTML += "<option value=\"" + "false" + "\">" + "Enable Command" + "</option>";
    } else {
        disableEnabled.innerHTML += "<option value=\"" + "false" + "\" selected>" + "Enable Command" + "</option>";
        disableEnabled.innerHTML += "<option value=\"" + "true" + "\">" + "Disable Command" + "</option>";
    }

    // Now we show the actions. If none exist (v1 command) we convert the message prperties to their action equivalents
    if (command.actions) {
        for (let i = 0; i < command.actions.length; i++) {
            await addActionToUI(command.actions[i].action, "edit", command.actions[i])
        }
    } else {
        await ActionCreator.buildChatMessageUI("edit", {message: command.message});
        if (command.sound && command.sound !== "null") {
            await ActionCreator.buildAudioUI("edit", {source: command.sound})
        }
        if (command.media && command.media !== "null") {
            let media = await MediaHandle.getMediaByName(command.media);
            console.log(media)// @ts-ignore legacy check
            if (media !== null && media !== "null") {
                if (media.type.startsWith("image")) {
                    await ActionCreator.buildImageGifUI("edit", {source: media.name})
                } else if (media.type.startsWith("video")) {
                    await ActionCreator.buildVideoUI("edit", {source: media.name})
                }
            }
        }
    }
}

/**
 * Trigger prep. Listens for add/delete, and modify triggers.
 */
async function handleTriggerSelection(mode: string, data?:TriggerStructure[]) {
    (document.getElementById(`${mode}TriggerAdd`) as HTMLButtonElement).addEventListener("click", async () => {
        let container = document.getElementById(`${mode}TriggerData`);
        let newTrigger = await getTriggerHTML("baseTrigger");
        newTrigger.className = "border-2 border-solid border-sky-500 p-4";
        container.appendChild(newTrigger);
        changeTriggerOptions(newTrigger, data);

        newTrigger.getElementsByClassName("removeTrigger")[0].addEventListener("click", async () => {
            container.removeChild(newTrigger);
        });

        newTrigger.getElementsByClassName("selectTrigger")[0].addEventListener("change", () => changeTriggerOptions(newTrigger));
    });

    if (data) {
        let container = document.getElementById(`${mode}TriggerData`);
        for(let trigger of data) {
            let newTrigger = await getTriggerHTML("baseTrigger");
            newTrigger.className = "border-2 border-solid border-sky-500 p-4";
            container.appendChild(newTrigger);
            let triggerSelecter = (newTrigger.getElementsByClassName("selectTrigger")[0] as HTMLSelectElement);
            switch(trigger.trigger) {
                case "ChatMessage": triggerSelecter.value = "chatMessage"; break;
                case "Follow": triggerSelecter.value = "newFollower"; break;
                case "Welcome User": triggerSelecter.value = "welcomeUser"; break;
            }
            changeTriggerOptions(newTrigger, data);

            newTrigger.getElementsByClassName("removeTrigger")[0].addEventListener("click", async () => {
                container.removeChild(newTrigger);
            });

            newTrigger.getElementsByClassName("selectTrigger")[0].addEventListener("change", () => changeTriggerOptions(newTrigger));
        }
    }
}

/**
 * Runs on trigger change. Changes the UI to match the new trigger. Sets the status
 */
async function changeTriggerOptions(newTrigger:HTMLElement, data?:TriggerStructure[]) {
    let triggerSelecter = (newTrigger.getElementsByClassName("selectTrigger")[0] as HTMLSelectElement);
    let newDiv = await getTriggerHTML(triggerSelecter.value);
    newTrigger.getElementsByClassName("contentTrigger")[0].innerHTML = "";
    newTrigger.getElementsByClassName("contentTrigger")[0].appendChild(newDiv);
    console.log(data);
    if (data) {
        data.forEach(trigger => {
            switch(trigger.trigger) {
                case "ChatMessage":
                    newTrigger.getElementsByTagName("input")[0].value = (trigger.constraints as ChatMessageTrigger).startsWith;
                    break;
                case "Follow":
                    break;
                case "Welcome User":
                    newTrigger.getElementsByTagName("input")[0].value = (trigger.constraints as WelcomeUserTrigger).user || "";
                    break;
            }
        })
    }
    // Set the attribute so the validator knows what type of trigger it is
    triggerSelecter.parentElement.parentElement.setAttribute("data-triggerType", triggerSelecter.value);
}

/**
 * Returns an HTML file for the specified trigger
 * @param trigger The trigger to get the HTML for
 */
async function getTriggerHTML(trigger: string) {
    let div = document.createElement("div");
    let file = await fs.readFile(dirName + `/html/commands/triggers/${trigger}.html`);
    div.innerHTML = file.toString();
    return div;
}

export {addActionToUI, loadModalAdd, loadModalEdit}