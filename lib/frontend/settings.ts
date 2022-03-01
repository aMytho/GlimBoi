const CacheStore = new DumbCacheStore;
CacheStore.setFile();
LogHandle.updatePath(appData[1]);
ModHandle.loadFilter(appData[1]);

// removes the disable class on the navbar
function unlockBot() {
    try {
        let mainNav = document.getElementById("mainNavBar")!;
        let navItems = [...mainNav.children];
        // Remove the diable class from all navbar items
        navItems.forEach(item => {
            item.firstElementChild!.classList.remove("disabled");
        });
    } catch (e) {
        console.log("error unlocking bot. It may already be unlocked.")
        errorMessage("Error unlocking bot. This is a unknown bug. You can report it to Mytho at the git repo or through any other means. A restart may fix the problem.")
    }
}


// Shows the settings on the settings page. Ran when that page is opened.
function showIntegrations() {
    // Webhooks - - -
    if (CacheStore.get("discordWebhookEnabled", false)) {
        document.getElementById("discordWebhookEnabled")!.toggleAttribute("checked");
    }
    if (CacheStore.get("guildedWebhookEnabled", false)) {
        document.getElementById("guildedWebhookEnabled")!.toggleAttribute("checked");
    }
    // webhook uri
    if (CacheStore.get("discordWebhookURL", "")) {
        (document.getElementById("discordWebhookURL") as HTMLInputElement)!.value = CacheStore.get("discordWebhookURL");
    };
    if (CacheStore.get("guildedWebhookURL", "")) {
        (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value = CacheStore.get("guildedWebhookURL", "");
    }

    // webhook default message
    if (CacheStore.get("discordWebhookMessage", "")) {
        (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value = CacheStore.get("discordWebhookMessage", "");
    } else {
        (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value = "$streamer just went live on https://glimesh.tv/$streamer"
    }
    if (CacheStore.get("guildedWebhookMessage", "")) {
        (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value = CacheStore.get("guildedWebhookMessage", "");
    } else {
        (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value = "$streamer just went live on https://glimesh.tv/$streamer"
    }

    // webhook confirmation
    if (CacheStore.get("discordWebhookConfirmation", true)) {
        document.getElementById("discordWebhookConfirmation")!.toggleAttribute("checked");
    }
    if (CacheStore.get("guildedWebhookConfirmation", true)) {
        document.getElementById("guildedWebhookConfirmation")!.toggleAttribute("checked");
    }

    // OBS - - -
    if (CacheStore.get("obsEnabled", false)) {
        document.getElementById("obsEnabled")!.toggleAttribute("checked");
    }
    (document.getElementById("obsPassword") as HTMLInputElement)!.value = CacheStore.get("obsPassword", "");
    (document.getElementById("obsUrl") as HTMLInputElement)!.value = CacheStore.get("obsUrl", "ws://localhost:4444");

    // Follow Message - - -
    if (CacheStore.get("followMessageEnabled", false)) {
        document.getElementById("followMessageEnabled")!.toggleAttribute("checked");
    }

    (document.getElementById("followMessage") as HTMLInputElement)!.value = CacheStore.get("followMessage", "Thanks for the follow $follower !");

    // Streamlabs - - -
    if (CacheStore.get("streamlabsEnabled", false)) {
        document.getElementById("streamlabsEnabled")!.toggleAttribute("checked");
    }

    (document.getElementById("streamlabsKey") as HTMLInputElement)!.value = CacheStore.get("streamlabsToken", "");
    (document.getElementById("streamlabsMessage") as HTMLInputElement)!.value = CacheStore.get("streamlabsMessage", "$follower just followed the stream!");

    // Twitter - - -
    if (CacheStore.get("twitterEnabled", false)) {
        document.getElementById("twitterEnabled")!.toggleAttribute("checked");
    }
    (document.getElementById("twitterMessage") as HTMLInputElement)!.value = CacheStore.get("twitterMessage", "$streamer just went live on https://glimesh.tv/$streamer?follow_host=false");
    if (CacheStore.get("twitterConfirmation", true)) {
        document.getElementById("twitterConfirmation")!.toggleAttribute("checked");
    }

    // Matrix - - -
    if (CacheStore.get("matrixEnabled", false)) {
        document.getElementById("matrixEnabled")!.toggleAttribute("checked");
    }
    (document.getElementById("matrixToken") as HTMLInputElement)!.value = CacheStore.get("matrixToken", "");
    (document.getElementById("matrixMessage") as HTMLInputElement)!.value = CacheStore.get("matrixMessage", "$streamer just went live on https://glimesh.tv/$streamer?follow_host=false");
    (document.getElementById("matrixRoom") as HTMLInputElement)!.value = CacheStore.get("matrixRoom", "");
    if (CacheStore.get("matrixConfirmation", true)) {
        document.getElementById("matrixConfirmation")!.toggleAttribute("checked");
    }

}

// saves the settings.
function saveIntegrations() {
    CacheStore.setMultiple([
        {discordWebhookEnabled: (document.getElementById("discordWebhookEnabled") as HTMLInputElement)!.checked},
        {discordWebhookConfirmation: (document.getElementById("discordWebhookConfirmation") as HTMLInputElement)!.checked},
        {discordWebhookMessage: (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value},
        {discordWebhookURL: (document.getElementById("discordWebhookURL") as HTMLInputElement)!.value},
        {guildedWebhookEnabled: (document.getElementById("guildedWebhookEnabled") as HTMLInputElement)!.checked},
        {guildedWebhookConfirmation: (document.getElementById("guildedWebhookConfirmation") as HTMLInputElement)!.checked},
        {guildedWebhookMessage: (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value},
        {guildedWebhookURL: (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value},
        {obsEnabled: (document.getElementById("obsEnabled") as HTMLInputElement)!.checked},
        {obsPassword: (document.getElementById("obsPassword") as HTMLInputElement)!.value},
        {obsUrl: (document.getElementById("obsUrl") as HTMLInputElement)!.value},
        {followMessageEnabled: (document.getElementById("followMessageEnabled") as HTMLInputElement)!.checked},
        {followMessage: (document.getElementById("followMessage") as HTMLInputElement)!.value},
        {streamlabsEnabled: (document.getElementById("streamlabsEnabled") as HTMLInputElement)!.checked},
        {streamlabsToken: (document.getElementById("streamlabsKey") as HTMLInputElement)!.value},
        {streamlabsMessage: (document.getElementById("streamlabsMessage") as HTMLInputElement)!.value},
        {twitterConfirmation: (document.getElementById("twitterConfirmation") as HTMLInputElement)!.checked},
        {twitterEnabled: (document.getElementById("twitterEnabled") as HTMLInputElement)!.checked},
        {twitterMessage: (document.getElementById("twitterMessage") as HTMLInputElement)!.value},
        {matrixConfirmation: (document.getElementById("matrixConfirmation") as HTMLInputElement)!.checked},
        {matrixEnabled: (document.getElementById("matrixEnabled") as HTMLInputElement)!.checked},
        {matrixToken: (document.getElementById("matrixToken") as HTMLInputElement)!.value},
        {matrixMessage: (document.getElementById("matrixMessage") as HTMLInputElement)!.value},
        {matrixRoom: (document.getElementById("matrixRoom") as HTMLInputElement)!.value},
    ]);
    updateSettings()
    successMessage("Settings Saved", " Your new settings have been applied and saved.")
}

function backupData() {
    let selectedFiles = [
        {
            name: "bannedWordList",
            copy: (document.getElementById("backupModeration") as HTMLInputElement).checked
        },
        {
            name: "commands",
            copy: (document.getElementById("backupCommands") as HTMLInputElement).checked
        },
        {
            name: "logging",
            copy: (document.getElementById("backupLogging") as HTMLInputElement).checked
        },
        {
            name: "obs",
            copy: (document.getElementById("backupMedia") as HTMLInputElement).checked
        },
        {
            name: "quotes",
            copy: (document.getElementById("backupQuotes") as HTMLInputElement).checked
        },
        {
            name: "ranks",
            copy: (document.getElementById("backupRanks") as HTMLInputElement).checked
        },
        {
            name: "users",
            copy: (document.getElementById("backupUsers") as HTMLInputElement).checked
        },
    ];
    let fileSelected = false;
    for (const key in selectedFiles) {
        if (selectedFiles[key].copy) {
            fileSelected = true;
        }
    }
    if (fileSelected === false) {
        errorMessage("No files selected", "You must select at least one file to backup.")
        return;
    }
    let {exportBackup} = require(appData[0] + "/modules/files/backup.js");
    exportBackup(selectedFiles);
}

function importData() {
    let selectedFiles = [
        {
            name: "bannedWordList",
            copy: (document.getElementById("importModeration") as HTMLInputElement).checked
        },
        {
            name: "commands",
            copy: (document.getElementById("importCommands") as HTMLInputElement).checked
        },
        {
            name: "logging",
            copy: (document.getElementById("importLogging") as HTMLInputElement).checked
        },
        {
            name: "obs",
            copy: (document.getElementById("importMedia") as HTMLInputElement).checked
        },
        {
            name: "quotes",
            copy: (document.getElementById("importQuotes") as HTMLInputElement).checked
        },
        {
            name: "ranks",
            copy: (document.getElementById("importRanks") as HTMLInputElement).checked
        },
        {
            name: "users",
            copy: (document.getElementById("importUsers") as HTMLInputElement).checked
        },
    ];
    let fileSelected = false;
    for (const key in selectedFiles) {
        if (selectedFiles[key].copy) {
            fileSelected = true;
        }
    }
    if (fileSelected === false) {
        errorMessage("No files selected", "You must select at least one file to import.")
        return;
    }
    let {importBackup} = require(appData[0] + "/modules/files/backup.js");
    importBackup(selectedFiles);
}

//applies the settings. This is ran at launch after the file is read. Once finished the bot is fully ready
function updateSettings() {
    if (ChatSettings !== undefined) {
        ChatSettings.updateChatSettings();
    }
}
updateSettings();