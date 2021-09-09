const CacheStore = new DumbCacheStore;
CacheStore.setFile();
LogHandle.updatePath(appData[1]);
ModHandle.loadFilter(appData[1]);

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
}




// saves the settings.
function saveIntegrations() {
    CacheStore.setMultiple([
        {discordWebhookEnabled: (document.getElementById("discordWebhookEnabled") as HTMLInputElement)!.checked},
        {guildedWebhookEnabled: (document.getElementById("guildedWebhookEnabled") as HTMLInputElement)!.checked},
        {discordWebhookConfirmation: (document.getElementById("discordWebhookConfirmation") as HTMLInputElement)!.checked},
        {guildedWebhookConfirmation: (document.getElementById("guildedWebhookConfirmation") as HTMLInputElement)!.checked},
        {discordWebhookMessage: (document.getElementById("discordWebhookMessage") as HTMLInputElement)!.value},
        {guildedWebhookMessage: (document.getElementById("guildedWebhookMessage") as HTMLInputElement)!.value},
        {discordWebhookURL: (document.getElementById("discordWebhookURL") as HTMLInputElement)!.value},
        {guildedWebhookURL: (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value}
    ]);
    updateSettings()
    successMessage("Settings Saved", " Your new settings have been applied and saved.")
}

//applies the settings. This is ran at launch after the file is read. Once finished the bot is fully ready
function updateSettings() {
    if (ChatSettings !== undefined) {
        ChatSettings.updateChatSettings();
    }
}
updateSettings();