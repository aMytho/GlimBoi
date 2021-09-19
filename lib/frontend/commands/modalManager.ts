// handles all the data from command modals

const ActionCreator:ActionCreator = require(appData[0] + "/frontend/commands/actionCreator.js")

function prepareActions(mode) {
   // Activates all bootstrap tooltips
    $('[data-toggle-second="tooltip"]').tooltip()

    // Adds a command
    document.getElementById(`${mode}CommandButtonModal`)!.onclick = async function () {
        // First we check to make sure all the command settings are valid
        const commandValidator: typeof import("../commands/commandValidator") = require(appData[0] + "/frontend/commands/commandValidator.js");
        let commandSettings = await commandValidator.validateSettings(mode)
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
            let tempAction = new CommandHandle.ChatAction[`${element.type}`](element)
            commandActions.push(tempAction);
        });
        // Now we add the actions to the settings. We send the settings to be added as a new command. Command complete!
        commandSettings.actions = commandActions;

        if (mode == "add") {
            CommandHandle.addCommand(commandSettings);
            addCommandTable(commandSettings);
            $("#modalCart").modal("hide");
        } else {
            console.info("Command Edit Finished");
            CommandHandle.editCommand(commandSettings);
            editCommandTable(commandSettings);
            $("#modalCart").modal("hide");
        }
    }

    document.getElementById("CreateChatMessage")!.onclick = () => addActionToUI("ChatMessage", mode);
    document.getElementById("CreateApiRequestGet")!.onclick = () => addActionToUI("ApiRequestGet", mode);
    document.getElementById("CreateAudio")!.onclick = () => addActionToUI("Audio", mode);
    document.getElementById("CreateBan")!.onclick = () => addActionToUI("Ban", mode);
    document.getElementById("CreateImageGif")!.onclick = () => addActionToUI("ImageGif", mode);
    document.getElementById("CreateVideo")!.onclick = () => addActionToUI("Video", mode);
    document.getElementById("CreateTimeout")!.onclick = () => addActionToUI("Timeout", mode);
    document.getElementById("CreateObsWebSocket")!.onclick = () => addActionToUI("ObsWebSocket", mode);
    document.getElementById("CreateWait")!.onclick = () => addActionToUI("Wait", mode);
}

function prepareModals(mode) {
    $(`#${mode}CommandPoints`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
    });
    $(`#${mode}CommandUses`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
    });
    $(`#${mode}CommandCooldown`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    setTimeout(() => {
        $(`#${mode}OpenMenu`).click()
    }, 700);
}

async function loadModalAdd() {
    let data = await fs.readFile(dirName + `/html/commands/addCommand.html`);
    document.getElementById(`commandContent`)!.innerHTML = data.toString();
    prepareModals("add")
    let selectRank = document.getElementById("addCommandRank");
    let options = await RankHandle.getAll();
    selectRank.innerHTML += "<option value=\"" + "Everyone" + "\">" + "Everyone (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        selectRank.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
    }
    prepareActions("add");
    addActionToUI("ChatMessage", "add");
}

async function loadModalEdit(command) {
    let data = await fs.readFile(dirName + `/html/commands/editCommand.html`);
    document.getElementById(`commandContent`)!.innerHTML = data.toString()
    await insertEditData(command);
    prepareModals("edit");
    prepareActions("edit");
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

        case "ApiRequestGet": await ActionCreator.buildApiRequestGetUI(mode, data);
            break;

        case "Audio": await ActionCreator.buildAudioUI(mode, data);
            break;

        case "Ban": await ActionCreator.buildBanUI(mode, data);
            break;

        case "ImageGif": await ActionCreator.buildImageGifUI(mode, data);
        break;

        case "ObsWebSocket": await ActionCreator.buildObsWebSocketUI(mode, data);
        break;

        case "Timeout": await ActionCreator.buildTimeoutUI(mode, data)
        break;

        case "Video": await ActionCreator.buildVideoUI(mode, data);
        break;

        case "Wait": await ActionCreator.buildWaitUI(mode, data);
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

export {addActionToUI, loadModalAdd, loadModalEdit}