//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
CommandHandle.updatePath(appData[1]);
let table; //The physical table for the UI
let AddModal:Modal, EditModal:Modal, RemoveModal:Modal

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
        ],
        columnDefs: [{
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
        }],
        pageLength: 25
    });
    $('#example').on('click', 'tbody tr', async function () {
        let data = table.row(this).data();
        const CommandUI = require(`${appData[0]}/frontend/commands/modalManager.js`);
        let commandClicked = await CommandHandle.findCommand(data.commandName);
        console.log(1)
        AddModal.show();
        CommandUI.loadModalEdit(commandClicked, AddModal);
    });
}



//removes commands
function checkRemoveCommand() {
    let commandToBeRemoved = ($("#commandRemoveInput").val() as string).toLowerCase()
    commandToBeRemoved = commandToBeRemoved.replace(new RegExp("^[\!]+"), "").trim();
    let removeCommandMessageError = document.getElementById("removeCommandMessage")

    try {
        CommandHandle.findCommand(commandToBeRemoved).then(data => {
            if (data !== null) {
                console.log("The command " + commandToBeRemoved + " will now be removed from the table");
                removeCommandMessageError.innerHTML = "Command Removed";
                removeCommandFromTable(commandToBeRemoved)
                CommandHandle.removeCommand(commandToBeRemoved);
            } else {
                removeCommandMessageError.innerHTML = "This command does not exist.";
                setTimeout(() => {
                    removeCommandMessageError.innerHTML = ""
                }, 4000);
            }
        })
    } catch (e) {
        console.log(e);
        removeCommandMessageError.innerHTML = "This command does not exist.";
        setTimeout(() => {
            removeCommandMessageError.innerHTML = ""
        }, 4000);
    }
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

    RemoveModal = new Modal(document.getElementById("removeCommandModal"), {
        onHide: () => {
            (document.getElementById("commandRemoveInput") as HTMLInputElement).value = "";
            document.getElementById("errorMessageDelete").innerHTML = "";
        }
    });

    document.getElementById("activateCommandAddModal").addEventListener("click", () => {
        AddModal.show();
        CommandUI.loadModalAdd(AddModal);
    });
    document.getElementById("activateCommandEditModal").addEventListener("click", () => EditModal.show());
    document.getElementById("closeCommandEditModal").addEventListener("click", () => EditModal.hide());
    document.getElementById("activateCommandRemoveModal").addEventListener("click", () => RemoveModal.show());
    document.getElementById("closeCommandRemoveModal").addEventListener("click", () => RemoveModal.hide());

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

function addCommandTable({commandName, uses, points, rank, actions}) {
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions })
    table.draw(); //Show changes
}

function editCommandTable({commandName, actions, uses, points, rank}) {
    let filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
        .rows()
        .indexes()
        .filter(function (value, index) {
            return table.row(value).data().commandName == commandName;
        });
    table.rows(filteredData).remove();
    table.row.add({ commandName: commandName, message: null, uses: uses, points: points, rank: rank, actions: actions});
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
