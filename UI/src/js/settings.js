var ApiHandle = require(appData[0] + "/chatbot/lib/API.js");
ApiHandle.updateID(); // Gives the api file auth information
var fs = require("fs");
var settings = {}
var updatedSettings = {
    Points: {
        enabled: true,
        name: "Points",
        StartingAmount: 0,
        accumalation: 15
    },
    Commands: {
        enabled: true,
        cooldown: 0,
        Prefix: "!",
        Error: true,
        repeatDelay: 10,
        repeatSpamProtection: 15
    },
    chat: {
        logging: false,
        filter: false,
        health: 0
    }
}

// removes the disable class on the navbar
function unlockBot() {
    try {
        document.getElementById("CommandLink").classList.remove("disabled")
        document.getElementById("PointsLink").classList.remove("disabled")
        document.getElementById("UsersLink").classList.remove("disabled")
        document.getElementById("SettingsLink").classList.remove("disabled")
        document.getElementById("ChatLink").classList.remove("disabled")
        document.getElementById("EventsLink").classList.remove("disabled")

    } catch (e) {
        console.log("error unlocking bot. It may already be unlocked.")
        errorMessage("Error unlocking bot. This is a unknown bug. You can report it to Mytho at the git repo or through any other means. A restart may fix the problem.")
    }
}


// Ran at startup and to get data for settings page
function getSettings() {
    try { // Check if the file exists.
        var raw = fs.readFileSync(appData[1] + '/data/settings.json');
        settings = JSON.parse(raw)
    } catch (e) { // if not create the file
        console.log("no settings file exists, creating it")
        var dataTemplate = JSON.stringify({
            Points: {
                enabled: true,
                name: "Points",
                StartingAmount: 0,
                accumalation: 15
            },
            Commands: {
                enabled: true,
                cooldown: 0,
                Prefix: "!",
                Error: true,
                repeatDelay: 10,
                repeatSpamProtection: 15
            },
            chat: {
                logging: false,
                filter: false,
                health: 0
            }
        })
        try {
            fs.writeFileSync(appData[1] + '/data/settings.json', dataTemplate); // writes to the file. We use this the next time the bot runs.
        } catch (e) {
            fs.mkdirSync(appData[1] + '/data'); // Makes the folder
            fs.writeFileSync(appData[1] + '/data/settings.json', dataTemplate); // writes the file
        }
        // for now we use the settings variable
        settings = {
            Points: {
                enabled: true,
                name: "Points",
                StartingAmount: 0,
                accumalation: 15
            },
            Commands: {
                enabled: true,
                cooldown: 0,
                Prefix: "!",
                Error: true,
                repeatDelay: 10,
                repeatSpamProtection: 15
            },
            chat: {
                logging: false,
                filter: false,
                health: 0
            }
        }
    }
    settings = $.extend(true, updatedSettings, settings) // merges the settings together, adds new values if any
    console.log(settings)
    updateSettings()
    unlockBot()
}


// Shows the settings on the settings page. Ran when that page is opened.
function showSettings() {
    // Points - - -
    var slider = document.getElementById("initialValueSlider");
    slider.value = settings.Points.StartingAmount
    var output = document.getElementById("initialValueOutput");
    output.innerHTML = slider.value;
    slider.oninput = function () {
        output.innerHTML = this.value;
    }
    document.getElementById("pointsNewName").value = settings.Points.name
    var rateSlider = document.getElementById("rateValueSlider");
    rateSlider.value = settings.Points.accumalation
    var rateOutput = document.getElementById("rateValueOutput");
    rateOutput.innerHTML = rateSlider.value;
    rateSlider.oninput = function () {
        rateOutput.innerHTML = this.value;
    }
    // Chat - - -
    var loggingswitch = document.getElementById("loggingEnabled")
    if (settings.chat.logging == true) {
        loggingswitch.toggleAttribute("checked");
    }
    var filterSwitch = document.getElementById("filterEnabled");
    if (settings.chat.filter == true) {
        filterSwitch.toggleAttribute("checked")
    }
    // Commands - - -
    switch (settings.Commands.cooldown) {
        case 0:
            document.getElementById("cdNone").toggleAttribute("selected");
            break;
        case 30:
            document.getElementById("cd30").toggleAttribute("selected");
            break;
        case 60:
            document.getElementById("cd60").toggleAttribute("selected");
            break;
        case 180:
            document.getElementById("cd180").toggleAttribute("selected");
            break;
        case 300:
            document.getElementById("cd300").toggleAttribute("selected");
            break;
        default:
            break;
    }
    // repeat handlers
    var repeatDelay = document.getElementById("repeatDelaySlider");
    repeatDelay.value = settings.Commands.repeatDelay;
    var repeatDelayValue = document.getElementById("repeatDelayValue");
    repeatDelayValue.innerHTML = repeatDelay.value;
    repeatDelay.oninput = function () {
        repeatDelayValue.innerHTML = this.value
    }
    switch (settings.Commands.repeatSpamProtection) {
        case 5:
            document.getElementById("rp5").toggleAttribute("selected")
            break;
        case 15:
            document.getElementById("rp15").toggleAttribute("selected")
            break;
        case 30:
            document.getElementById("rp30").toggleAttribute("selected")
            break;
        case 60:
            document.getElementById("rp60").toggleAttribute("selected")
            break;
        default:
            break;
    }

    switch (settings.chat.health) {
        case 0:
            document.getElementById("hr0").toggleAttribute("selected")
            break;
        case 30:
            document.getElementById("hr30").toggleAttribute("selected")
            break;
        case 60:
            document.getElementById("hr60").toggleAttribute("selected")
            break;
        case 120:
            document.getElementById("hr120").toggleAttribute("selected")
            break;
        default:
            break;
    }
}
    



// saves the settings. 
function saveSettings() {
    function getCooldown() {
        var value = document.getElementById("sel1").value
        switch (value) {
            case "None (default)":
                return 0
                break;
            case "30 seconds":
                return 30
                break;
            case "1 Minute":
                return 60
                break;
            case "3 Minutes":
                return 180
                break;
            case "5 Minutes":
                return 300
                break;
        }
    }
    function getRepeatProtection() {
        var value = document.getElementById("repeatProtect").value
        switch (value) {
            case "5 (not recommended)":
                return 5
                break;
            case "15 (default)":
                return 15
                break;
            case "30":
                return 30
                break;
            case "60":
                return 60
                break;
        }
    }
    function getHealthInterval() {
        var value = document.getElementById("healthReminder").value
        switch (value) {
            case "Disabled (default)":
                return 0
                break;
            case "30 minutes":
                return 30
                break;
            case "60 minutes":
                return 60
                break;
            case "2 hours":
                return 120
                break;
        }
    }
    settings = {
        Points: {
            enabled: true,
            name: document.getElementById("pointsNewName").value,
            StartingAmount: Number(document.getElementById("initialValueOutput").innerText),
            accumalation: Number(document.getElementById("rateValueOutput").innerText)
        },
        Commands: {
            enabled: true,
            cooldown: getCooldown(),
            Prefix: "!",
            Error: true,
            repeatDelay: Number(document.getElementById("repeatDelayValue").innerText),
            repeatSpamProtection: getRepeatProtection()
        },
        chat: {
            logging: document.getElementById("loggingEnabled").checked,
            filter: document.getElementById("filterEnabled").checked,
            health: getHealthInterval()
        }
    }
    console.log(settings);
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function () { })
    updateSettings()
    successMessage("Settings Saved", " Your new settings have been applied and saved.")
}

// resets the settings.
function resetSettings() {
    settings = {
        Points: {
            enabled: true,
            name: "Points",
            StartingAmount: 0,
            accumalation: 15
        },
        Commands: {
            enabled: true,
            cooldown: 0,
            Prefix: "!",
            Error: true,
            repeatDelay: 10,
            repeatSpamProtection: 15
        },
        chat: {
            logging: false,
            filter: false,
            health: 0
        }
    }
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function () { });
    showSettings() // shows the sliders as the normal values.
    updateSettings()
    successMessage("Settings Reset", "Your settings have been set to their original values.")
}

//applies the settings. THis is ran at launch after the file is read. Once finished the bot is fully ready
function updateSettings() {
    CommandHandle.cooldownChange(settings.Commands.cooldown);
    ModHandle.updateFilter(settings.chat.filter);
    if (ChatSettings !== undefined) {
        ChatSettings.updateChatSettings(settings)
    }
}