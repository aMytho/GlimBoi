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
        {guildedWebhookURL: (document.getElementById("guildedWebhookURL") as HTMLInputElement)!.value},
        {obsEnabled: (document.getElementById("obsEnabled") as HTMLInputElement)!.checked},
        {obsPassword: (document.getElementById("obsPassword") as HTMLInputElement)!.value},
        {obsUrl: (document.getElementById("obsUrl") as HTMLInputElement)!.value},
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