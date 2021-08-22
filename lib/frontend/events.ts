// Runs the UI for events
let viewingEvent: eventName | "default" = "default"

function loadEvents() {
    viewingEvent = "default";
    console.log(`Loading events...`);
    $('.input-number').on('keypress', function(e){
        return e.metaKey || // cmd/ctrl
          e.which <= 0 || // arrow keys
          e.which == 8 || // delete key
          e.which == 46 || // period key
          /[0-9]/.test(String.fromCharCode(e.which)); // numbers
      })
}



function loadRaffleUI() {
    viewingEvent = "raffle";
    console.log(`Loading raffle UI...`);
    let raffleReward = CacheStore.get(`rafflePoints`, 777, false);
    let raffleCost = CacheStore.get(`raffleCost`, 50, false);
    let rawRaffleDuration = CacheStore.get(`raffleDuration`, 60000, false);
    let parsedRaffleDuration = rawRaffleDuration / 60000;
    let raffleQuiet = CacheStore.get(`raffleQuiet`, false, false);
    let raffleEnabled = CacheStore.get(`raffleEnabled`, true, false);

    (document.getElementById("raffleReward") as HTMLInputElement).value = raffleReward;
    (document.getElementById("raffleCost") as HTMLInputElement).value = raffleCost;
    (document.getElementById("raffleDuration") as HTMLInputElement).value = parsedRaffleDuration.toString();
    (document.getElementById("raffleQuiet") as HTMLInputElement).value = raffleQuiet;
    (document.getElementById("raffleEnabled") as HTMLInputElement).value = raffleEnabled;
    fillUsersRaffle();
}

function resetRaffleSettings() {
    // reset the UI
    (document.getElementById("raffleReward") as HTMLInputElement).value = String(777);
    (document.getElementById("raffleCost") as HTMLInputElement).value = String(50);
    (document.getElementById("raffleDuration") as HTMLInputElement).value = String(1);
    (document.getElementById("raffleQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("raffleEnabled") as HTMLInputElement).value = String(true);
    // reset the settings
    let migratedSettings = [
        {rafflePoints: 777},
        {raffleCost: 50},
        {raffleDuration: 60000},
        {raffleQuiet: false},
        {raffleEnabled: true}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Raffle settings have been reset.");
}

function saveRaffleSettings() {
    let raffleReward = (document.getElementById("raffleReward") as HTMLInputElement).value.trim();
    let raffleCost = (document.getElementById("raffleCost") as HTMLInputElement).value.trim();
    let raffleDuration = (document.getElementById("raffleDuration") as HTMLInputElement).value.trim();
    let raffleQuiet = ((document.getElementById("raffleQuiet") as HTMLInputElement).value.trim() === "true");
    let raffleEnabled = ((document.getElementById("raffleEnabled") as HTMLInputElement).value.trim() === "true");

    let migratedSettings = [
        {rafflePoints: Number(raffleReward)},
        {raffleCost: Number(raffleCost)},
        {raffleDuration: Number(raffleDuration) * 60000},
        {raffleQuiet: raffleQuiet},
        {raffleEnabled: raffleEnabled}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Raffle settings have been saved.");
}

async function startRaffleFromUI() {
    // todo - replace with streamer name
    let raffleStarted = await EventHandle.raffle.startRaffle('Glimboi', false);
    if (raffleStarted) {
        console.log(`Raffle started!`);
        successMessage("Raffle started!", "A raffle has been started. Users can type !enter to join the raffle.");
    } else {
        console.log(`Raffle failed to start.`);
        errorMessage("Raffle Error", "Raffle failed to start. Ensure you are in a chat and that raffles are enabled.");
    }
}

function stopRaffleFromUI() {
    let raffleStopped = EventHandle.raffle.stopRaffle();
    if (raffleStopped) {
        console.log(`Raffle stopped!`);
        successMessage("Raffle stopped!", "A raffle has been stopped. Users can no longer enter the raffle.");
    } else {
        console.log(`Raffle failed to stop.`);
        errorMessage("Raffle Error", "Raffle failed to stop. Ensure you are in a chat and that raffles are enabled.");
    }
}

function fillUsersRaffle(user?: string) {
    let raffleListUI = document.getElementById(`raffleUserList`);
    if (user) {
        let listElement = document.createElement(`li`);
        listElement.innerHTML = `Username: ${user}`
        raffleListUI.appendChild(listElement);
    } else {
        let usersInRaffle = EventHandle.raffle.getUsers();
        if (usersInRaffle.length !== 0) {
            for (let i = 0; i < usersInRaffle.length; i++) {
                let listElement = document.createElement(`li`);
                listElement.innerHTML = `${usersInRaffle[i]}`
                raffleListUI.appendChild(listElement);
            }
        }
    }
}

function loadPollUI() {
    viewingEvent = "poll";
    console.log(`Loading poll UI...`);
    let pollDuration = CacheStore.get(`pollDuration`, 60000, false);
    let parsedPollDuration = pollDuration / 60000;
    let pollEnabled = CacheStore.get(`pollEnabled`, true, false);
    let pollQuiet = CacheStore.get(`pollQuiet`, false, false);
    console.log(pollDuration, pollQuiet, pollEnabled);
    (document.getElementById("pollDuration") as HTMLInputElement).value = parsedPollDuration.toString();
    (document.getElementById("pollQuiet") as HTMLInputElement).value = pollQuiet;
    (document.getElementById("pollEnabled") as HTMLInputElement).value = pollEnabled;
}

function resetPollSettings() {
    // reset the UI
    (document.getElementById("pollDuration") as HTMLInputElement).value = String(1);
    (document.getElementById("pollQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("pollEnabled") as HTMLInputElement).value = String(true);
    // reset the settings
    let migratedSettings = [
        {pollDuration: 60000},
        {pollQuiet: false},
        {pollEnabled: true}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Poll settings have been reset.");
}

function savePollSettings() {
    let pollDuration = (document.getElementById("pollDuration") as HTMLInputElement).value.trim();
    let pollQuiet = ((document.getElementById("pollQuiet") as HTMLInputElement).value.trim() === "true");
    let pollEnabled = ((document.getElementById("pollEnabled") as HTMLInputElement).value.trim() === "true");
    console.log(pollDuration, pollQuiet, pollEnabled);
    let migratedSettings = [
        {pollDuration: Number(pollDuration) * 60000},
        {pollQuiet: pollQuiet},
        {pollEnabled: pollEnabled}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Poll settings have been saved.");
}

function loadGlimrealmUI() {
    viewingEvent = "glimrealm";
    console.log(`Loading Glimrealm UI...`);
    let glimrealmEnabled = CacheStore.get(`glimrealmEnabled`, true, false);
    let glimrealmQuiet = CacheStore.get(`glimrealmQuiet`, false, false);
    let glimrealmDuration = CacheStore.get(`glimrealmDuration`, 60000, false);
    let parsedGlimrealmDuration = glimrealmDuration / 60000;
    console.log(glimrealmEnabled, glimrealmQuiet, glimrealmDuration);
    (document.getElementById("glimrealmEnabled") as HTMLInputElement).value = glimrealmEnabled;
    (document.getElementById("glimrealmQuiet") as HTMLInputElement).value = glimrealmQuiet;
    (document.getElementById("glimrealmDuration") as HTMLInputElement).value = parsedGlimrealmDuration.toString();
}

function resetGlimrealmSettings() {
    (document.getElementById("glimmrealmEnabled") as HTMLInputElement).value = String(true);
    (document.getElementById("glimmrealmQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("glimmrealmDuration") as HTMLInputElement).value = String(1);
    let migratedSettings = [
        {glimrealmEnabled: true},
        {glimrealmQuiet: false},
        {glimrealmDuration: 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Glimrealm settings have been reset.");
}

function saveGlimrealmSettings() {
    let glimrealmEnabled = ((document.getElementById("glimrealmEnabled") as HTMLInputElement).value.trim() === "true");
    let glimrealmQuiet = ((document.getElementById("glimrealmQuiet") as HTMLInputElement).value.trim() === "true");
    let glimrealmDuration = ((document.getElementById("glimrealmDuration") as HTMLInputElement).value.trim());
    console.log(glimrealmEnabled, glimrealmQuiet, glimrealmDuration);
    let migratedSettings = [
        {glimrealmEnabled: glimrealmEnabled},
        {glimrealmQuiet: glimrealmQuiet},
        {glimrealmDuration: Number(glimrealmDuration) * 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Glimrealm settings have been saved.");
}

function loadBankheistUI() {
    viewingEvent = "bankheist";
    console.log(`Loading Bankheist UI...`);
    let bankheistEnabled = CacheStore.get(`bankheistEnabled`, true, false);
    let bankheistQuiet = CacheStore.get(`bankheistQuiet`, false, false);
    let bankheistDuration = CacheStore.get(`bankheistDuration`, 60000, false);
    let parsedBankheistDuration = bankheistDuration / 60000;
    console.log(bankheistEnabled, bankheistQuiet, bankheistDuration);
    (document.getElementById("bankheistEnabled") as HTMLInputElement).value = bankheistEnabled;
    (document.getElementById("bankheistQuiet") as HTMLInputElement).value = bankheistQuiet;
    (document.getElementById("bankheistDuration") as HTMLInputElement).value = parsedBankheistDuration.toString();
}

function resetBankheistSettings() {
    (document.getElementById("bankheistEnabled") as HTMLInputElement).value = String(true);
    (document.getElementById("bankheistQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("bankheistDuration") as HTMLInputElement).value = String(1);
    let migratedSettings = [
        {bankheistEnabled: true},
        {bankheistQuiet: false},
        {bankheistDuration: 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Bankheist settings have been reset.");
}

function saveBankheistSettings() {
    let bankheistEnabled = ((document.getElementById("bankheistEnabled") as HTMLInputElement).value.trim() === "true");
    let bankheistQuiet = ((document.getElementById("bankheistQuiet") as HTMLInputElement).value.trim() === "true");
    let bankheistDuration = ((document.getElementById("bankheistDuration") as HTMLInputElement).value.trim());
    console.log(bankheistEnabled, bankheistQuiet, bankheistDuration);
    let migratedSettings = [
        {bankheistEnabled: bankheistEnabled},
        {bankheistQuiet: bankheistQuiet},
        {bankheistDuration: Number(bankheistDuration) * 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Bankheist settings have been saved.");
}

function tryToStartBankHeistUI() {
    let ableToStart = EventHandle.bankHeist.tryToStartBankheist();
    if (ableToStart) {
        EventHandle.bankHeist.startBankHeist('', true);
        successMessage("Bankheist Started", "Bankheist has been started.");
    } else {
        errorMessage("Bankheist Failed", "Bankheist failed to start. Ensure you are in a chat, the event is enabled, and is not currently running.");
    }
}

function loadGlimroyaleUI() {
    viewingEvent = "glimroyale";
    console.log(`Loading Glimroyale UI...`);
    let glimroyaleEnabled = CacheStore.get(`glimroyaleEnabled`, true, false);
    let glimroyaleQuiet = CacheStore.get(`glimroyaleQuiet`, false, false);
    let glimroyaleDuration = CacheStore.get(`glimroyaleDuration`, 60000, false);
    let parsedGlimroyaleDuration = glimroyaleDuration / 60000;
    console.log(glimroyaleEnabled, glimroyaleQuiet, glimroyaleDuration);
    (document.getElementById("glimroyaleEnabled") as HTMLInputElement).value = glimroyaleEnabled;
    (document.getElementById("glimroyaleQuiet") as HTMLInputElement).value = glimroyaleQuiet;
    (document.getElementById("glimroyaleDuration") as HTMLInputElement).value = parsedGlimroyaleDuration.toString();
}

function resetGlimroyaleSettings() {
    (document.getElementById("glimroyaleEnabled") as HTMLInputElement).value = String(true);
    (document.getElementById("glimroyaleQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("glimroyaleDuration") as HTMLInputElement).value = String(1);
    let migratedSettings = [
        {glimroyaleEnabled: true},
        {glimroyaleQuiet: false},
        {glimroyaleDuration: 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Glimroyale settings have been reset.");
}

function saveGlimroyaleSettings() {
    let glimroyaleEnabled = ((document.getElementById("glimroyaleEnabled") as HTMLInputElement).value.trim() === "true");
    let glimroyaleQuiet = ((document.getElementById("glimroyaleQuiet") as HTMLInputElement).value.trim() === "true");
    let glimroyaleDuration = ((document.getElementById("glimroyaleDuration") as HTMLInputElement).value.trim());
    console.log(glimroyaleEnabled, glimroyaleQuiet, glimroyaleDuration);
    let migratedSettings = [
        {glimroyaleEnabled: glimroyaleEnabled},
        {glimroyaleQuiet: glimroyaleQuiet},
        {glimroyaleDuration: Number(glimroyaleDuration) * 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Glimroyale settings have been saved.");
}

function tryToStartGlimroyale() {
    let started = EventHandle.glimroyale.startGlimRoyale('', 0 , true);
    if (started) {
        successMessage("Glimroyale Started", "Glim Royale has been started.");
    } else {
        errorMessage("Glimroyale Failed", "GlimRoyale failed to start. Ensure it is enabled, not already running, and are connected to chat.");
    }
}

function loadDuelUI() {
    viewingEvent = "duel";
    console.log(`Loading Duel UI...`);
    let duelEnabled = CacheStore.get(`duelEnabled`, true, false);
    let duelQuiet = CacheStore.get(`duelQuiet`, false, false);
    let duelDuration = CacheStore.get(`duelDuration`, 60000, false);
    let parsedDuelDuration = duelDuration / 60000;
    console.log(duelEnabled, duelQuiet, duelDuration);
    (document.getElementById("duelEnabled") as HTMLInputElement).value = duelEnabled;
    (document.getElementById("duelQuiet") as HTMLInputElement).value = duelQuiet;
    (document.getElementById("duelDuration") as HTMLInputElement).value = parsedDuelDuration.toString();
}

function resetDuelSettings() {
    (document.getElementById("duelEnabled") as HTMLInputElement).value = String(true);
    (document.getElementById("duelQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("duelDuration") as HTMLInputElement).value = String(1);
    let migratedSettings = [
        {duelEnabled: true},
        {duelQuiet: false},
        {duelDuration: 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Duel settings have been reset.");
}

function saveDuelSettings() {
    let duelEnabled = ((document.getElementById("duelEnabled") as HTMLInputElement).value.trim() === "true");
    let duelQuiet = ((document.getElementById("duelQuiet") as HTMLInputElement).value.trim() === "true");
    let duelDuration = ((document.getElementById("duelDuration") as HTMLInputElement).value.trim());
    console.log(duelEnabled, duelQuiet, duelDuration);
    let migratedSettings = [
        {duelEnabled: duelEnabled},
        {duelQuiet: duelQuiet},
        {duelDuration: Number(duelDuration) * 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Duel settings have been saved.");
}

function loadGiveawayUI() {
    viewingEvent = "giveaway";
    console.log(`Loading Giveaway UI...`);
    let giveawayEnabled = CacheStore.get(`giveawayEnabled`, true, false);
    let giveawayQuiet = CacheStore.get(`giveawayQuiet`, false, false);
    let giveawayDuration = CacheStore.get(`giveawayDuration`, 60000, false);
    let parsedGiveawayDuration = giveawayDuration / 60000;
    console.log(giveawayEnabled, giveawayQuiet, giveawayDuration);
    (document.getElementById("giveawayEnabled") as HTMLInputElement).value = giveawayEnabled;
    (document.getElementById("giveawayQuiet") as HTMLInputElement).value = giveawayQuiet;
    (document.getElementById("giveawayDuration") as HTMLInputElement).value = parsedGiveawayDuration.toString();
}

function resetGiveawaySettings() {
    (document.getElementById("giveawayEnabled") as HTMLInputElement).value = String(true);
    (document.getElementById("giveawayQuiet") as HTMLInputElement).value = String(false);
    (document.getElementById("giveawayDuration") as HTMLInputElement).value = String(1);
    let migratedSettings = [
        {giveawayEnabled: true},
        {giveawayQuiet: false},
        {giveawayDuration: 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", "Giveaway settings have been reset.");
}

function saveGiveawaySettings() {
    let giveawayEnabled = ((document.getElementById("giveawayEnabled") as HTMLInputElement).value.trim() === "true");
    let giveawayQuiet = ((document.getElementById("giveawayQuiet") as HTMLInputElement).value.trim() === "true");
    let giveawayDuration = ((document.getElementById("giveawayDuration") as HTMLInputElement).value.trim());
    console.log(giveawayEnabled, giveawayQuiet, giveawayDuration);
    let migratedSettings = [
        {giveawayEnabled: giveawayEnabled},
        {giveawayQuiet: giveawayQuiet},
        {giveawayDuration: Number(giveawayDuration) * 60000}
    ];
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Giveaway settings have been saved.");
}

/*
function addOptionToPoll() {
    $('#pollData tbody').append(`<tr><td data-toggle='tooltip' data-placement='top' title='Poll response'>Option</td> <td contenteditable='true' class='pollOption' style="background-color:#00ffff0f"></td></tr>`)
}

function removeOptionFromPoll(element: HTMLElement) {
    if (true) {
        element.parentElement.remove();

    }

}

function tryToStartPoll() {
    let pollData = document.getElementById("pollData") as HTMLTableElement;
    let pollQuestion = pollData.children[1].firstElementChild.children[1].innerHTML;
    console.log(pollQuestion, pollData);
}

*/