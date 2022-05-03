//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
CommandHandle.updatePath(appData[1]);
let table; //The physical table for the UI
let AddModal:Modal, EditModal:Modal;
let commandDupePrevention: boolean = false;

//Loads the command table.
async function loadCommandTable() {
    commandModalPrep() // ensures the modals have the proper filter enabled
    table = $("#example").DataTable({
        data: await CommandHandle.getAll(), // returns all the commands
        columns: [
            {
                title: "Commands",
                data: "commandName",
            },
            {
                title: "Data",
                data: "message",
            },
            {
                title: "Uses",
                data: "uses",
            },
            {
                title: "Points",
                data: "points",
            },
            {
                title: "Rank",
                data: "rank",
            },
            {
                title: "Status",
            },
            {
                title: "Delete"
            }
        ],
        columnDefs: [
            {
                targets: -1,
                data: null,
                defaultContent: "<button class='btn-danger deletionIcon'><i class='fas fa-trash'></i></button>"
            },
            {
            className: "border-t-teal-50",
            targets: 1,
            data: "message",
            render: function (data, type, row, meta) {
                if (data == undefined || data == null) {
                    let actionString = ""
                    for (let i = 0; i < row.actions.length; i++) {
                        if (i == 3) {
                            actionString = actionString + "..."
                            break
                        }
                        actionString = actionString.concat(row.actions[i].action, ": ", row.actions[i][`${row.actions[i].info[0].length > 1 && row.actions[i].info[0] || row.actions[i].info}`]);
                        if (row.actions.length - 1 !== i) {
                            actionString = actionString.concat(", ")
                        }
                    }
                    return actionString
                }
                return data;
            }
        },
            {
                targets: 5,
                data: null,
                render: function (data, type, row, meta) {
                    if (data.disabled != undefined && data.disabled == true) {
                            data = `
                            <div class="niceSwitch">
                        <label class="switch">
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                        </div>`
                    } else {
                        data = `
                            <div class="niceSwitch">
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>`
                    }
                    return data;
                }
            }
        ],
        pageLength: 25
    });
    $('#example').on('click', 'tbody tr .deletionIcon', async function (e) {
        e.stopPropagation();
        let data = table.row($(this).parents('tr')).data();
        removeCommandFromTable(data.commandName);
        CommandHandle.removeCommand(data.commandName);
        showToast(`Deleted ${data.commandName}`);
    });
    $('#example').on('click', 'tbody tr .switch', async function (e) {
        e.stopPropagation();
        if (!commandDupePrevention) {
            commandDupePrevention = true;
            let data = table.row($(this).parents('tr')).data();
            await CommandHandle.setCommandStatus(data.commandName, data.disabled);
            data.disabled = !data.disabled;
            showToast(`${data.commandName} is now ${data.disabled ? "disabled" : "enabled"}`);
            commandDupePrevention = false;
        }
    });
    $('#example').on('click', 'tbody tr', async function (e) {
        e.stopPropagation();
        let data = table.row(this).data();
        const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
        let commandClicked = await CommandHandle.findCommand(data.commandName);
        AddModal.show();
        CommandUI.loadModalEdit(commandClicked, AddModal);
    });
}

//edits commands
function checkEditCommand() {
    let commandToBeEdited = ($("#commandEditInput").val() as string).toLowerCase();
    let editErrorMessage = document.getElementById("editSearchCommandLabel")
    commandToBeEdited = commandToBeEdited.replace(new RegExp("^[\!]+"), "").trim();

    //Make sure the command exists.
    CommandHandle.findCommand(commandToBeEdited).then(data => {
        if (data !== null) {
            console.log(`Editing ${commandToBeEdited}`);
            const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
            // Close the search modal
            EditModal.hide();
            // Create and open the edit modal
            AddModal.show();
            CommandUI.loadModalEdit(data, AddModal);
        } else {
            editErrorMessage.innerHTML = "This command does not exist.";
            setTimeout(() => {
                editErrorMessage.innerHTML = "Enter the command to edit.";
            }, 4000);
        }
    })

}

/**
 * Removes any HTML/CSS that is invisible to the user.
 * @param {string} html All the command data
 */
function strip(html:string) {
  	let doc = new DOMParser().parseFromString(html, 'text/html');
  	return doc.body.textContent || "";
}

function moveAction(element:HTMLElement, direction: "up" | "down") {
    if (direction == "up") {
        if (element.previousElementSibling) {
            element.parentNode!.insertBefore(element, element.previousElementSibling)
        }
    } else {
        if (element.nextElementSibling) {
            element.parentNode!.insertBefore(element.nextElementSibling, element)
        }
    }
}

/**
 * Runs on cmd page load. Adds filters and other things for the modals
 */
function commandModalPrep() {
    const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
    AddModal = new Modal(document.getElementById("addCommandModal"), {});

    EditModal = new Modal(document.getElementById("editCommandModal"), {
        onHide: () => {
            (document.getElementById("commandEditInput") as HTMLInputElement).value = "";
        }
    });

    document.getElementById("activateCommandAddModal").addEventListener("click", () => {
        AddModal.show();
        CommandUI.loadModalAdd(AddModal);
    });
    document.getElementById("activateCommandEditModal").addEventListener("click", () => EditModal.show());
    document.getElementById("closeCommandEditModal").addEventListener("click", () => EditModal.hide());

    document.getElementById("saveCommandSettings").addEventListener('click', function (e) {
        successMessage("Settings Saved", "Command settings have been saved.");
        CacheStore.setMultiple([
            {commandRepeatDelay: Number(repeatDelay.value)},
            {commandRepeatProtection: getRepeatProtection()},
            {commandCooldownMessage: cooldownMessageValue}
        ]);
    });

    let cooldownMessageValue = (document.getElementById("cooldownMessage") as HTMLInputElement).value;
    let repeatDelay = document.getElementById("repeatDelaySlider")! as HTMLInputElement;
    repeatDelay.value = String(CacheStore.get("commandRepeatDelay", 10, false));
    let repeatDelayValue = document.getElementById("repeatDelayValue")!;
    repeatDelayValue.innerHTML = repeatDelay.value;
    repeatDelay.oninput = function (ev) {
        repeatDelayValue.innerHTML = (ev.target as HTMLInputElement).value
    }
    const getRepeatProtection = () => {
        let value = (document.getElementById("repeatProtect") as HTMLInputElement)!.value
        switch (value) {
            case "5 (not recommended)":
                return 5
            case "15 (default)":
                return 15
            case "30":
                return 30
            case "60":
                return 60
        }
    }
}

function addCommandTable({commandName, uses, points, rank, actions, disabled}) {
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions })
    table.draw(); //Show changes
}

function editCommandTable({commandName, actions, uses, points, rank, disabled}) {
    let filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
        .rows()
        .indexes()
        .filter(function (value, index) {
            return table.row(value).data().commandName == commandName;
        });
    table.rows(filteredData).remove();
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions, disabled: disabled });
    table.draw();
}

// Removes a command from the table
function removeCommandFromTable(command) {
    try {
        let filteredData = table
            .rows()
            .indexes()
            .filter(function (value, index) {
                return table.row(value).data().commandName == command;
            });
        table.rows(filteredData).remove().draw();
    } catch (e) {}
}