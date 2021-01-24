var ApiHandle = require(appData[0] + "/chatbot/lib/API.js");
ApiHandle.updateID()
var fs = require("fs");
var settings = {}

// removes the disable class on the navbar
function unlockBot() {
    try {
    document.getElementById("CommandLink").classList.remove("disabled")
    document.getElementById("PointsLink").classList.remove("disabled")
    document.getElementById("UsersLink").classList.remove("disabled")
    document.getElementById("SettingsLink").classList.remove("disabled")
    document.getElementById("ChatLink").classList.remove("disabled")
    } catch(e) {
        console.log("error unlocking bot. It may already be unlocked.")
        errorMessage("Error unlocking bot. This is a unknown bug. You can report it to Mytho at the git repo or through any other means. A restart may fix the problem.")
    }
}
// Ran at startup and to get data for settings page
function getSettings() {
    try { // Check if the file exists.
    var raw = fs.readFileSync(appData[1] + '/data/settings.json');
    settings = JSON.parse(raw)
    } catch(e) { // if not create the file
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
                    Error: true
                },
                chat: {
                    logging: false
                }
            })
    
        fs.writeFileSync(appData[1] + '/data/settings.json', dataTemplate); // writes to the file. We use this the next time th ebot runs.
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
                Error: true
            },
            chat: {
                logging: false
            }
        }
    }
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
    slider.oninput = function() {
    output.innerHTML = this.value;
    }
    var rateSlider = document.getElementById("rateValueSlider");
    rateSlider.value = settings.Points.accumalation
    var rateOutput = document.getElementById("rateValueOutput");
    rateOutput.innerHTML = rateSlider.value;
    rateSlider.oninput = function() {
    rateOutput.innerHTML = this.value;
    }
    // Chat - - -
    var loggingswitch = document.getElementById("loggingEnabled")
    if (settings.chat.logging == true) {
    loggingswitch.toggleAttribute("checked");
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
    document.getElementById("pointsNewName").value = settings.Points.name
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
            Error: true
        },
        chat: {
            logging: document.getElementById("loggingEnabled").checked
        }
    }
    console.log(settings);
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function() {})
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
            Error: true
        },
        chat: {
            logging: false
        }
    }
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function() {});
    showSettings() // shows the sldiers as the normal values.
    updateSettings()
}

//applies the settings. THis is ran at launch after the file is read. Once finished the bot is fully ready
function updateSettings() {
    ChatHandle.loggingEnabled(settings.chat.logging);
    CommandHandle.cooldownChange(settings.Commands.cooldown)
}