// Runs the UI for events
let viewingEvent: eventName | "default" = "default";
let QueueUserAddModal:Modal, QueueUserRemoveModal:Modal;

function loadEvents() {
    viewingEvent = "default";
    console.log(`Loading events...`);
    $('.input-number').on('keypress', function (e) {
        return e.metaKey || // cmd/ctrl
            e.which <= 0 || // arrow keys
            e.which == 8 || // delete key
            e.which == 46 || // period key
            /[0-9]/.test(String.fromCharCode(e.which)); // numbers
    })

    QueueUserAddModal = new Modal(document.getElementById("modalQueueAdd"), {
        onHide: () => {
            (document.getElementById("queueAdd") as HTMLInputElement).value = "";
        }
    })

    QueueUserRemoveModal = new Modal(document.getElementById("modalQueueRemove"), {
        onHide: () => {
            (document.getElementById("queueRemove") as HTMLInputElement).value = "";
        }
    })

    document.getElementById("activateQueueUserAdd").addEventListener("click", () => QueueUserAddModal.show());
    document.getElementById("closeEventsQueueAddModal").addEventListener("click", () => QueueUserAddModal.hide());
    document.getElementById("activateQueueUserRemove").addEventListener("click", () => QueueUserRemoveModal.show());
    document.getElementById("closeEventsQueueRemoveModal").addEventListener("click", () => QueueUserRemoveModal.hide());

}


function loadRaffleUI() {
    viewingEvent = "raffle";
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
    let pollDuration = CacheStore.get(`pollDuration`, 60000, false);
    let parsedPollDuration = pollDuration / 60000;
    let pollEnabled = CacheStore.get(`pollEnabled`, true, false);
    let pollQuiet = CacheStore.get(`pollQuiet`, false, false);
    (document.getElementById("pollDuration") as HTMLInputElement).value = parsedPollDuration.toString();
    (document.getElementById("pollQuiet") as HTMLInputElement).value = pollQuiet;
    (document.getElementById("pollEnabled") as HTMLInputElement).value = pollEnabled;
}

function loadGlimrealmUI() {
    viewingEvent = "glimrealm";
    let glimrealmEnabled = CacheStore.get(`glimrealmEnabled`, true, false);
    let glimrealmQuiet = CacheStore.get(`glimrealmQuiet`, false, false);
    let glimrealmDuration = CacheStore.get(`glimrealmDuration`, 60000, false);
    let parsedGlimrealmDuration = glimrealmDuration / 60000;
    (document.getElementById("glimrealmEnabled") as HTMLInputElement).value = glimrealmEnabled;
    (document.getElementById("glimrealmQuiet") as HTMLInputElement).value = glimrealmQuiet;
    (document.getElementById("glimrealmDuration") as HTMLInputElement).value = parsedGlimrealmDuration.toString();
}

function loadBankheistUI() {
    viewingEvent = "bankheist";
    let bankheistEnabled = CacheStore.get(`bankheistEnabled`, true, false);
    let bankheistQuiet = CacheStore.get(`bankheistQuiet`, false, false);
    let bankheistDuration = CacheStore.get(`bankheistDuration`, 60000, false);
    let parsedBankheistDuration = bankheistDuration / 60000;
    (document.getElementById("bankheistEnabled") as HTMLInputElement).value = bankheistEnabled;
    (document.getElementById("bankheistQuiet") as HTMLInputElement).value = bankheistQuiet;
    (document.getElementById("bankheistDuration") as HTMLInputElement).value = parsedBankheistDuration.toString();
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
    let glimroyaleEnabled = CacheStore.get(`glimroyaleEnabled`, true, false);
    let glimroyaleQuiet = CacheStore.get(`glimroyaleQuiet`, false, false);
    let glimroyaleDuration = CacheStore.get(`glimroyaleDuration`, 60000, false);
    let parsedGlimroyaleDuration = glimroyaleDuration / 60000;
    (document.getElementById("glimroyaleEnabled") as HTMLInputElement).value = glimroyaleEnabled;
    (document.getElementById("glimroyaleQuiet") as HTMLInputElement).value = glimroyaleQuiet;
    (document.getElementById("glimroyaleDuration") as HTMLInputElement).value = parsedGlimroyaleDuration.toString();
}

function tryToStartGlimroyale() {
    let started = EventHandle.glimroyale.startGlimRoyale('', 0, true);
    if (started) {
        successMessage("Glimroyale Started", "Glim Royale has been started.");
    } else {
        errorMessage("Glimroyale Failed", "GlimRoyale failed to start. Ensure it is enabled, not already running, and are connected to chat.");
    }
}

function loadDuelUI() {
    viewingEvent = "duel";
    let duelEnabled = CacheStore.get(`duelEnabled`, true, false);
    let duelQuiet = CacheStore.get(`duelQuiet`, false, false);
    let duelDuration = CacheStore.get(`duelDuration`, 60000, false);
    let parsedDuelDuration = duelDuration / 60000;
    (document.getElementById("duelEnabled") as HTMLInputElement).value = duelEnabled;
    (document.getElementById("duelQuiet") as HTMLInputElement).value = duelQuiet;
    (document.getElementById("duelDuration") as HTMLInputElement).value = parsedDuelDuration.toString();
}

function loadGiveawayUI() {
    viewingEvent = "giveaway";
    let giveawayEnabled = CacheStore.get(`giveawayEnabled`, true, false);
    let giveawayQuiet = CacheStore.get(`giveawayQuiet`, false, false);
    let giveawayDuration = CacheStore.get(`giveawayDuration`, 60000, false);
    let parsedGiveawayDuration = giveawayDuration / 60000;
    (document.getElementById("giveawayEnabled") as HTMLInputElement).value = giveawayEnabled;
    (document.getElementById("giveawayQuiet") as HTMLInputElement).value = giveawayQuiet;
    (document.getElementById("giveawayDuration") as HTMLInputElement).value = parsedGiveawayDuration.toString();
}

function loadEightBallUI() {
    viewingEvent = "eightBall";
    let eightBallEnabled = CacheStore.get("eightBallEnabled", true, false);
    (document.getElementById("eightBallEnabled") as HTMLSelectElement).value = String(eightBallEnabled);
}

function loadGambleUI() {
    viewingEvent = "gamble";
    let gambleEnabled = CacheStore.get("gambleEnabled", true, false);
    let gambleMultiplier = CacheStore.get("gambleMultiplier", 1.5, false);
    let gambleWinRate = CacheStore.get("gambleWinRate", 20, false);
    (document.getElementById("gambleEnabled") as HTMLSelectElement).value = String(gambleEnabled);
    (document.getElementById("gambleMultiplier") as HTMLSelectElement).value = String(gambleMultiplier);
    (document.getElementById("gambleWinRate") as HTMLSelectElement).value = String(gambleWinRate);
}

async function loadQueueUI() {
    viewingEvent = "queue";
    let queueEnabled = CacheStore.get("queueEnabled", true, false);
    let queueQuiet = CacheStore.get("queueQuiet", false, false);
    let queuePoints = CacheStore.get("queuePoints", 100);
    let queueRank = CacheStore.get("queueRank", "Everyone");
    let queueProgression = CacheStore.get("queueController", "Everyone");

    let selectRank = document.getElementById("queueRank");
    let queueProgressionRank = document.getElementById("queueProgression");
    let options = await RankHandle.getAll();
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        if (queueRank == opt) {
            selectRank.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            selectRank.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }

    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        if (queueRank == opt) {
            queueProgressionRank.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            queueProgressionRank.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }

    let users = EventHandle.queue.getUsersInQueue();
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addOrRemoveQueueUserUI(user, "add")
    }

    (document.getElementById("queueEnabled") as HTMLInputElement).value = queueEnabled;
    (document.getElementById("queueQuiet") as HTMLInputElement).value = queueQuiet;
    (document.getElementById("queueCost") as HTMLInputElement).value = queuePoints.toString();
    (document.getElementById("queueRank") as HTMLSelectElement).value = queueRank;
    (document.getElementById("queueProgression") as HTMLSelectElement).value = queueProgression;
}

function startQueueFromUI() {
    let queueStarted = EventHandle.queue.startQueue();
    if (queueStarted) {
        successMessage("Queue Started", "Queue has been started.");
    } else {
        errorMessage("Queue Failed", "Queue failed to start. Ensure it is enabled, not already running, and are connected to chat.");
    }
}

function stopQueueFromUI() {
    EventHandle.queue.endQueue();
    successMessage("Queue Stopped", "Queue has been stopped.");
}

function addOrRemoveQueueUserUI(user: string, action: "add" | "remove") {
    if (action == "add") {
        let element = document.createElement("li");
        element.innerText = user;
        element.classList.add("list-group-item");
        document.getElementById("queueUserList").appendChild(element);
    } else {
        // Loop through queueUserList. Check its children. If the name matches, remove it.
        let queueUserList = document.getElementById("queueUserList");
        for (let i = 0; i < queueUserList.children.length; i++) {
            if ((queueUserList.children[i] as HTMLLIElement).innerText == user) {
                queueUserList.children[i].remove();
            }
        }
    }
}

async function checkQueueUser(user:string) {
    let userExists = await UserHandle.findByUserName(user);
    if (userExists) {
        return true;
    } else {
        let userAdded = await UserHandle.addUser(user, false);
        if (typeof userAdded == "string") {
            return false
        } else {
            return true;
        }
    }
}

async function addToQueueUI() {
    let user = (document.getElementById("queueAdd") as HTMLInputElement).value;
    let userExists = await checkQueueUser(user);
    if (userExists && EventHandle.queue.getUsersInQueue().indexOf(user) == -1 && ChatHandle.isConnected()) {
        EventHandle.queue.addToQueue(user);
        //addOrRemoveQueueUserUI(user, "add");
        QueueUserAddModal.hide();
        successMessage("User Added", "User has been added to queue.");
    } else {
        errorMessage(
        "User Failed", "User failed to be added to queue. Ensure you are connected to chat and the user is not already in a queue.");
    }
}

function removeFromQueueUI() {
    let user = (document.getElementById("queueRemove") as HTMLInputElement).value;
    if (EventHandle.queue.getUsersInQueue().indexOf(user) != -1) {
        EventHandle.queue.removeFromQueue(user);
        //addOrRemoveQueueUserUI(user, "remove");
        QueueUserRemoveModal.hide();
        successMessage("User Removed", "User has been removed from queue.");
    } else {
        errorMessage("User Failed", "The user is not in the queue.");
    }
}

function resetQueueUI() {
    document.getElementById("queueUserList").innerHTML = "";
}

function saveEventSettings(event: eventName) {
    let migratedSettings: any[] = [
        { [`${event}Enabled`]: ((document.getElementById(`${event}Enabled`) as HTMLInputElement).value.trim() === "true") },
    ];

    switch (event) {
        case "gamble":
            migratedSettings.push(
                {gambleMultiplier: Number((document.getElementById(`gambleMultiplier`) as HTMLInputElement).value.trim())},
                {gambleWinRate: Number((document.getElementById(`gambleWinRate`) as HTMLInputElement).value.trim())}
            );
            break;
        case "eightBall":
            migratedSettings.push(
                {eightBallEnabled: ((document.getElementById(`eightBallEnabled`) as HTMLSelectElement).value.trim() === "true")}
            );
            break;
        case "giveaway":
            migratedSettings.push(
                {giveawayQuiet: ((document.getElementById(`giveawayQuiet`) as HTMLInputElement).value.trim() === "true")},
                {giveawayDuration: Number((document.getElementById(`giveawayDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "duel":
            migratedSettings.push(
                {duelQuiet: ((document.getElementById(`duelQuiet`) as HTMLInputElement).value.trim() === "true")},
                {duelDuration: Number((document.getElementById(`duelDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "glimroyale":
            migratedSettings.push(
                {glimroyaleQuiet: ((document.getElementById(`glimroyaleQuiet`) as HTMLInputElement).value.trim() === "true")},
                {glimroyaleDuration: Number((document.getElementById(`glimroyaleDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "bankheist":
            migratedSettings.push(
                {bankheistQuiet: ((document.getElementById(`bankheistQuiet`) as HTMLInputElement).value.trim() === "true")},
                {bankheistDuration: Number((document.getElementById(`bankheistDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "glimrealm":
            migratedSettings.push(
                {glimrealmQuiet: ((document.getElementById(`glimrealmQuiet`) as HTMLInputElement).value.trim() === "true")},
                {glimrealmDuration: Number((document.getElementById(`glimrealmDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "poll":
            migratedSettings.push(
                {pollQuiet: ((document.getElementById(`pollQuiet`) as HTMLInputElement).value.trim() === "true")},
                {pollDuration: Number((document.getElementById(`pollDuration`) as HTMLInputElement).value.trim()) * 60000}
            );
            break;
        case "raffle":
            migratedSettings.push(
                {raffleQuiet: ((document.getElementById(`raffleQuiet`) as HTMLInputElement).value.trim() === "true")},
                {raffleDuration: Number((document.getElementById(`raffleDuration`) as HTMLInputElement).value.trim()) * 60000},
                {raffleCost: Number((document.getElementById(`raffleCost`) as HTMLInputElement).value.trim())},
                {rafflePoints: Number((document.getElementById(`raffleReward`) as HTMLInputElement).value.trim())}
            );
            break;
        case "queue":
            migratedSettings.push(
                {queueEnabled: ((document.getElementById(`queueEnabled`) as HTMLSelectElement).value.trim() === "true")},
                {queueQuiet: ((document.getElementById(`queueQuiet`) as HTMLSelectElement).value.trim() === "true")},
                {queuePoints: Number((document.getElementById(`queueCost`) as HTMLInputElement).value.trim())},
                {queueRank: (document.getElementById(`queueRank`) as HTMLSelectElement).value.trim()},
                {queueController: (document.getElementById(`queueProgression`) as HTMLSelectElement).value.trim()}
            );
            break;
        default:
            break;
    }

    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", `${event} settings have been saved.`);
}

function resetEventSettings(event: eventName) {
    // The event must be enabled. It is always eventEnabled so we don't need a switch case.
    (document.getElementById(`${event}Enabled`) as HTMLInputElement).value = String(true);

    let migratedSettings: any[] = [
        { [`${event}Enabled`]: true }
    ];

    // Each event has its own settings. We need to reset them all.
    switch (event) {
        case "duel":
            migratedSettings.push({ duelQuiet: false }, { duelDuration: 60000 });
            (document.getElementById("duelQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("duelDuration") as HTMLInputElement).value = String(1);
            break;
        case "giveaway":
            migratedSettings.push({ giveawayQuiet: false }, { giveawayDuration: 60000 });
            (document.getElementById("giveawayQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("giveawayDuration") as HTMLInputElement).value = String(1);
            break;
        case "eightBall":
            // Only has enabled property, nothing to do here
            break;
        case "gamble":
            migratedSettings.push({ gambleMultiplier: 1.5 }, { gambleWinRate: 20 });
            (document.getElementById("gambleMultiplier") as HTMLSelectElement).value = String(1.5);
            (document.getElementById("gambleWinRate") as HTMLSelectElement).value = String(20);
            break;
        case "glimroyale":
            migratedSettings.push({ glimroyaleQuiet: false }, { glimroyaleDuration: 60000 });
            (document.getElementById("glimroyaleQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("glimroyaleDuration") as HTMLInputElement).value = String(1);
            break;
        case "bankheist":
            migratedSettings.push({ bankheistQuiet: false }, { bankheistDuration: 60000 });
            (document.getElementById("bankheistQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("bankheistDuration") as HTMLInputElement).value = String(1);
            break;
        case "glimrealm":
            migratedSettings.push({ glimrealmQuiet: false }, { glimrealmDuration: 60000 });
            (document.getElementById("glimrealmQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("glimrealmDuration") as HTMLInputElement).value = String(1);
            break;
        case "poll":
            migratedSettings.push({ pollQuiet: false }, { pollDuration: 60000 });
            (document.getElementById("pollQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("pollDuration") as HTMLInputElement).value = String(1);
            break;
        case "raffle":
            migratedSettings.push(
                { raffleQuiet: false }, { raffleDuration: 60000 }, { rafflePoints: 777 }, { raffleCost: 50 }
            );
            (document.getElementById("raffleQuiet") as HTMLInputElement).value = String(false);
            (document.getElementById("raffleDuration") as HTMLInputElement).value = String(1);
            (document.getElementById("raffleReward") as HTMLInputElement).value = String(777);
            (document.getElementById("raffleCost") as HTMLInputElement).value = String(50);
            break;
        case "queue":
            migratedSettings.push(
                { queueEnabled: true }, { queueQuiet: false }, { queuePoints: 50 }, { queueRank: "Everyone" }, { queueController: "Everyone" }
            );
            (document.getElementById("queueEnabled") as HTMLSelectElement).value = String(true);
            (document.getElementById("queueQuiet") as HTMLSelectElement).value = String(false);
            (document.getElementById("queueCost") as HTMLInputElement).value = String(50);
            (document.getElementById("queueRank") as HTMLSelectElement).value = "Everyone";
            (document.getElementById("queueProgression") as HTMLSelectElement).value = "Everyone"
        default:
            break;
    }

    // Save the settings in the cache
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Reset", `${event} settings have been reset.`);
}
