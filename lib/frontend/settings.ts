ApiHandle.updateID(); // Gives the api file auth information
const CacheStore:CacheStoreClass = new DumbCacheStore;
LogHandle.updatePath(appData[1]);
ModHandle.loadFilter(appData[1]);
// @ts-ignore
let settings:Settings = {}
let updatedSettings:Settings = {
    Points: {
        enabled: true,
        name: "Points",
        StartingAmount: 0,
        accumalation: 15
    },
    Commands: {
        enabled: true,
        Prefix: "!",
        Error: true,
        repeatDelay: 10,
        repeatSpamProtection: 15
    },
    chat: {
        logging: false,
        filter: false,
        health: 0
    },
    music: {
        chatAttribution: false,
        writeToFile: false
    },
    Moderation: {
        filterEnabled: false,
        warning1: "none",
        warning2: "none",
        warning3: "none",
        warningAbove: "none",
        modMessage: false
    },
    Webhooks: {
        discord: {
            enabled: false,
            waitForConfirmation: true,
            defaultMessage: "",
            webhookUri: ""
        },
        guilded: {
            enabled: false,
            waitForConfirmation: true,
            defaultMessage: "",
            webhookUri: ""
        }
    }
}

// removes the disable class on the navbar
function unlockBot() {
    try {
        document.getElementById("CommandLink")!.classList.remove("disabled");
        document.getElementById("PointsLink")!.classList.remove("disabled");
        document.getElementById("UsersLink")!.classList.remove("disabled");
        document.getElementById("SettingsLink")!.classList.remove("disabled");
        document.getElementById("ChatLink")!.classList.remove("disabled");
        document.getElementById("EventsLink")!.classList.remove("disabled");
        document.getElementById("RanksLink")!.classList.remove("disabled");
        document.getElementById("OBSLink")!.classList.remove("disabled");
        document.getElementById("MusicLink")!.classList.remove("disabled");
        document.getElementById("ModPanelLink")!.classList.remove("disabled");
    } catch (e) {
        console.log("error unlocking bot. It may already be unlocked.")
        errorMessage("Error unlocking bot. This is a unknown bug. You can report it to Mytho at the git repo or through any other means. A restart may fix the problem.")
    }
}


// Ran at startup and to get data for settings page
function getSettings() {
    try { // Check if the file exists.
        let raw = fs.readFileSync(appData[1] + '/data/settings.json');
        // @ts-ignore
        settings = JSON.parse(raw);
    } catch (e) { // if not create the file
        console.log("no settings file exists, creating it")
        let dataTemplate = JSON.stringify({
            Points: {
                enabled: true,
                name: "Points",
                StartingAmount: 0,
                accumalation: 15
            },
            Commands: {
                enabled: true,
                Prefix: "!",
                Error: true,
                repeatDelay: 10,
                repeatSpamProtection: 15
            },
            chat: {
                logging: false,
                filter: false,
                health: 0
            },
            music: {
                chatAttribution: false,
                writeToFile: false
            },
            Moderation: {
                filterEnabled: false,
                warning1: "none",
                warning2: "none",
                warning3: "none",
                warningAbove: "none",
                modMessage: false
            },
            Webhooks: {
                discord: {
                    enabled: false,
                    waitForConfirmation: true,
                    defaultMessage: "",
                    webhookUri: ""
                },
                guilded: {
                    enabled: false,
                    waitForConfirmation: true,
                    defaultMessage: "",
                    webhookUri: ""
                }
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
                Prefix: "!",
                Error: true,
                repeatDelay: 10,
                repeatSpamProtection: 15
            },
            chat: {
                logging: false,
                filter: false,
                health: 0
            },
            music: {
                chatAttribution: false,
                writeToFile: false
            },
            Moderation: {
                filterEnabled: false,
                warning1: "none",
                warning2: "none",
                warning3: "none",
                warningAbove: "none",
                modMessage: false
            },
            Webhooks: {
                discord: {
                    enabled: false,
                    waitForConfirmation: true,
                    defaultMessage: "",
                    webhookUri: ""
                },
                guilded: {
                    enabled: false,
                    waitForConfirmation: true,
                    defaultMessage: "",
                    webhookUri: ""
                }
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
    let slider = document.getElementById("initialValueSlider")! as HTMLInputElement;
    slider.value = String(settings.Points.StartingAmount);
    let output = document.getElementById("initialValueOutput");
    output.innerHTML = slider.value;
    slider.oninput = function (ev) {
        output.innerHTML = (ev.target as HTMLInputElement).value
    }
    let newPointsName = document.getElementById("pointsNewName")! as HTMLInputElement;
    newPointsName.value = settings.Points.name
    let rateSlider = (document.getElementById("rateValueSlider") as HTMLInputElement);
    rateSlider.value = String(settings.Points.accumalation);
    let rateOutput = document.getElementById("rateValueOutput")!;
    rateOutput.innerHTML = rateSlider.value;
    rateSlider.oninput = function (ev) {
        rateOutput.innerHTML = (ev.target as HTMLInputElement).value
    }
    // Chat - - -
    let loggingswitch = document.getElementById("loggingEnabled")!;
    if (settings.chat.logging == true) {
        loggingswitch.toggleAttribute("checked");
    }
    // Commands - - -
    // repeat handlers
    let repeatDelay = document.getElementById("repeatDelaySlider")! as HTMLInputElement
    repeatDelay.value = String(settings.Commands.repeatDelay);
    let repeatDelayValue = document.getElementById("repeatDelayValue")!;
    repeatDelayValue.innerHTML = repeatDelay.value;
    repeatDelay.oninput = function (ev) {
        repeatDelayValue.innerHTML = (ev.target as HTMLInputElement).value
    }
    switch (settings.Commands.repeatSpamProtection) {
        case 5:
            document.getElementById("rp5")!.toggleAttribute("selected")
        break;
        case 15:
            document.getElementById("rp15")!.toggleAttribute("selected")
        break;
        case 30:
            document.getElementById("rp30")!.toggleAttribute("selected")
        break;
        case 60:
            document.getElementById("rp60")!.toggleAttribute("selected")
        break;
        default:
        break;
    }

    switch (settings.chat.health) {
        case 0:
            document.getElementById("hr0")!.toggleAttribute("selected")
        break;
        case 30:
            document.getElementById("hr30")!.toggleAttribute("selected")
        break;
        case 60:
            document.getElementById("hr60")!.toggleAttribute("selected")
        break;
        case 120:
            document.getElementById("hr120")!.toggleAttribute("selected")
        break;
        default:
        break;
    }
    // Music
    if (settings.music.chatAttribution) {
        document.getElementById("attributionMusicEnabled")!.toggleAttribute("checked");
    }
    if (settings.music.writeToFile) {
        document.getElementById("fileMusicEnabled")!.toggleAttribute("checked");
    }
    document.getElementById("chatNavSelector")!.click();
    // Webhooks - - -
    if (settings.Webhooks.discord.enabled) {
        document.getElementById("discordWebhookEnabled")!.toggleAttribute("checked");
    }
    if (settings.Webhooks.guilded.enabled) {
        document.getElementById("guildedWebhookEnabled")!.toggleAttribute("checked");
    }
    // webhook uri
    if (settings.Webhooks.discord.webhookUri != "") {
        (document.getElementById("discordWebhookURL") as HTMLInputElement)!.value = settings.Webhooks.discord.webhookUri;
    };
    if (settings.Webhooks.guilded.webhookUri != "") {
        (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value = settings.Webhooks.guilded.webhookUri;
    }
    // webhook default message
    if (settings.Webhooks.discord.defaultMessage != "") {
        (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value = settings.Webhooks.discord.defaultMessage;
    } else {
        (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value = "$streamer just went live on https://glimesh.tv/$streamer"
    }
    if (settings.Webhooks.guilded.defaultMessage != "") {
        (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value = settings.Webhooks.guilded.defaultMessage;
    } else {
        (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value = "$streamer just went live on https://glimesh.tv/$streamer"
    }
    // webhook confirmation
    if (settings.Webhooks.discord.waitForConfirmation) {
        document.getElementById("discordWebhookConfirmation")!.toggleAttribute("checked");
    }
    if (settings.Webhooks.guilded.waitForConfirmation) {
        document.getElementById("guildedWebhookConfirmation")!.toggleAttribute("checked");
    }
}




// saves the settings.
function saveSettings() {
    function getRepeatProtection() {
        let value = (document.getElementById("repeatProtect") as HTMLInputElement)!.value
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
        let value = (document.getElementById("healthReminder") as HTMLInputElement)!.value
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
            name: (document.getElementById("pointsNewName") as HTMLInputElement)!.value,
            StartingAmount: Number(document.getElementById("initialValueOutput")!.innerText),
            accumalation: Number(document.getElementById("rateValueOutput")!.innerText)
        },
        Commands: {
            enabled: true,
            Prefix: "!",
            Error: true,
            repeatDelay: Number(document.getElementById("repeatDelayValue")!.innerText),
            repeatSpamProtection: getRepeatProtection()
        },
        chat: {
            logging: (document.getElementById("loggingEnabled") as HTMLInputElement)!.checked,
            filter: false,
            health: getHealthInterval()
        },
        music: {
            chatAttribution: (document.getElementById("attributionMusicEnabled") as HTMLInputElement)!.checked,
            writeToFile: (document.getElementById("fileMusicEnabled") as HTMLInputElement)!.checked
        },
        Moderation: {
            filterEnabled: settings.Moderation.filterEnabled,
            warning1: settings.Moderation.warning1,
            warning2: settings.Moderation.warning2,
            warning3: settings.Moderation.warning3,
            warningAbove: settings.Moderation.warningAbove,
            modMessage: settings.Moderation.modMessage
        },
        Webhooks: {
            discord: {
                enabled: (document.getElementById("discordWebhookEnabled") as HTMLInputElement)!.checked,
                waitForConfirmation: (document.getElementById("discordWebhookConfirmation") as HTMLInputElement)!.checked,
                defaultMessage: (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value,
                webhookUri: (document.getElementById("discordWebhookURL") as HTMLInputElement)!.value
            },
            guilded: {
                enabled: (document.getElementById("guildedWebhookEnabled") as HTMLInputElement)!.checked,
                waitForConfirmation: (document.getElementById("guildedWebhookConfirmation") as HTMLInputElement)!.checked,
                defaultMessage: (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value,
                webhookUri: (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value
            }
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
            Prefix: "!",
            Error: true,
            repeatDelay: 10,
            repeatSpamProtection: 15
        },
        chat: {
            logging: false,
            filter: false,
            health: 0
        },
        music: {
            chatAttribution: false,
            writeToFile: false
        },
        Moderation: {
            filterEnabled: false,
            warning1: "none",
            warning2: "none",
            warning3: "none",
            warningAbove: "none",
            modMessage: false
        },
        Webhooks: {
            discord: {
                enabled: false,
                waitForConfirmation: true,
                defaultMessage: "",
                webhookUri: ""
            },
            guilded: {
                enabled: false,
                waitForConfirmation: true,
                defaultMessage: "",
                webhookUri: ""
            }
        }
    }
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function () { });
    document.getElementById("SettingsLink").click(); // Fully resets the UI
    showSettings() // shows the sliders as the normal values.
    updateSettings();
    successMessage("Settings Reset", "Your settings have been set to their original values.")
}

//applies the settings. This is ran at launch after the file is read. Once finished the bot is fully ready
function updateSettings() {
    if (ChatSettings !== undefined) {
        ChatSettings.updateChatSettings(settings);
    }
}