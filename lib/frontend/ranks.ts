// Handles the UI for ranks

let RankAddModal:Modal, RankRemoveModal: Modal;

async function rankPrep() {
    let currentRanks = await RankHandle.getAll();
    currentRanks.forEach(element => {
        if (element.rank !== "Mod" && element.rank !== "Streamer" && element.rank !== "user") {
            let rankButton = document.createElement("a");
            rankButton.className = `btn-info mt-2 CUSTOM_RANK`
            rankButton.innerHTML = element.rank;
            rankButton.setAttribute("onclick", `displayRank("${element.rank}")`)
            document.getElementById("customRankButtons")!.append(rankButton)
        }
    });
    rankModalPrep();
}

function rankModalPrep() {
    RankAddModal = new Modal(document.getElementById("modalRankAdd"), {
        onHide: () => {
            (document.getElementById("rankAddInput") as HTMLInputElement).value = "";
            (document.getElementById("addRank") as HTMLParagraphElement).innerText = "";
        }
    });

    RankRemoveModal = new Modal(document.getElementById("modalRankremove"), {
        onHide: () => {
            (document.getElementById("rankRemoveInput") as HTMLInputElement).value = "";
            (document.getElementById("removeRank") as HTMLParagraphElement).innerText = "";
        }
    })
    document.getElementById("triggerModalRankAdd").addEventListener("click", () => RankAddModal.show());
    document.getElementById("closeModalRankAdd").addEventListener("click", () => RankAddModal.hide());
    document.getElementById("triggerModalRankRemove").addEventListener("click", () => RankRemoveModal.show());
    document.getElementById("closeModalRankRemove").addEventListener("click", () => RankRemoveModal.hide());
}

async function addRank() {
    let rankName = (document.getElementById("rankAddInput") as HTMLInputElement)!.value.trim();
    let rankCreated = await RankHandle.createRank(rankName);
    if (rankCreated == "RANKADDED") {
        let rankButton = document.createElement("a");
        rankButton.className = `btn-info mt-2 CUSTOM_RANK`;
        rankButton.innerHTML = rankName;
        rankButton.setAttribute("onclick", `displayRank('${rankName}')`)
        document.getElementById("customRankButtons")!.append(rankButton);
        RankAddModal.hide();
    } else {
        document.getElementById("addRank")!.innerText = "That rank already exists."
    }
}

async function removeRank() {
    let rankName = (document.getElementById("rankRemoveInput")! as HTMLInputElement).value.trim();
    let rankRemoved = await RankHandle.removeRank(rankName)
    if (rankRemoved == "RANKREMOVED") {
        RankRemoveModal.hide();
        var possibleRanks = document.getElementsByClassName("CUSTOM_RANK") as HTMLCollectionOf<HTMLParagraphElement> // adjust later
        for (let item of possibleRanks) {
            if (item.innerText == rankName) {
                item.remove()
            }
        }
    } else if (rankRemoved == "INVALIDRANK") {
        document.getElementById("removeRank")!.innerText = "You cannot remove that rank."
    } else {
        document.getElementById("removeRank")!.innerText = "That rank does not exist."
    }
}

function saveRankSettings(rank:rankName) {
    let updatedRank = {
        rank: rank,
        rankTier: Number((document.getElementById("tierRank") as HTMLInputElement).value),
        canAddCommands: (document.getElementById("addCommandsRank") as HTMLInputElement).checked,
        canEditCommands: (document.getElementById("editCommandsRank") as HTMLInputElement).checked,
        canRemoveCommands: (document.getElementById("removeCommandsRank") as HTMLInputElement).checked,
        canAddPoints: (document.getElementById("addPointsRank") as HTMLInputElement).checked,
        canEditPoints: (document.getElementById("editPointsRank") as HTMLInputElement).checked,
        canRemovePoints: (document.getElementById("removePointsRank") as HTMLInputElement).checked,
        canAddUsers: (document.getElementById("addUsersRank") as HTMLInputElement).checked,
        canEditUsers: (document.getElementById("editUsersRank") as HTMLInputElement).checked,
        canRemoveUsers: (document.getElementById("removeUsersRank") as HTMLInputElement).checked,
        canAddQuotes: (document.getElementById("addQuotesRank") as HTMLInputElement).checked,
        canEditQuotes: (document.getElementById("editQuotesRank") as HTMLInputElement).checked,
        canRemoveQuotes: (document.getElementById("removeQuotesRank") as HTMLInputElement).checked,
        canControlMusic: (document.getElementById("controlMusicRank") as HTMLInputElement).checked,
        modImmunity: (document.getElementById("modImmunityRank") as HTMLInputElement).checked,
        canStartEvents: (document.getElementById("startEventsRank") as HTMLInputElement).checked,
        canEndEvents: (document.getElementById("endEventsRank") as HTMLInputElement).checked
    }
    console.log(updatedRank);
    RankHandle.editRank(updatedRank);
    successMessage("Rank Settings Updated", "Your new rank settings have been applied.")
}

async function displayRank(rank: rankName) {
    let rankExists = await RankHandle.getRankPerms(rank)
    if (rankExists !== null) {
        (document.getElementById("rankName") as HTMLHeadingElement)!.innerText = rankExists.rank;
        (document.getElementById("rankName") as HTMLHeadingElement)!.setAttribute("data-rank", rankExists.rank);
        (document.getElementById("tierRank") as HTMLInputElement)!.value = rankExists.rankTier.toString();
        (document.getElementById("rankMessage") as HTMLInputElement)!.innerText = "Make sure to save your changes!";
        (document.getElementById("addCommandsRank") as HTMLInputElement)!.checked = rankExists.canAddCommands;
        (document.getElementById("editCommandsRank") as HTMLInputElement)!.checked = rankExists.canEditCommands;
        (document.getElementById("removeCommandsRank") as HTMLInputElement)!.checked = rankExists.canRemoveCommands;
        (document.getElementById("addPointsRank") as HTMLInputElement)!.checked = rankExists.canAddPoints;
        (document.getElementById("editPointsRank") as HTMLInputElement)!.checked = rankExists.canEditPoints;
        (document.getElementById("removePointsRank") as HTMLInputElement)!.checked = rankExists.canRemovePoints;
        (document.getElementById("addUsersRank") as HTMLInputElement)!.checked = rankExists.canAddUsers;
        (document.getElementById("editUsersRank") as HTMLInputElement)!.checked = rankExists.canEditUsers;
        (document.getElementById("removeUsersRank") as HTMLInputElement)!.checked = rankExists.canRemoveUsers;
        (document.getElementById("addQuotesRank") as HTMLInputElement)!.checked = rankExists.canAddQuotes;
        (document.getElementById("editQuotesRank") as HTMLInputElement)!.checked = rankExists.canEditQuotes;
        (document.getElementById("removeQuotesRank") as HTMLInputElement)!.checked = rankExists.canRemoveQuotes;
        (document.getElementById("controlMusicRank") as HTMLInputElement)!.checked = rankExists.canControlMusic;
        (document.getElementById("modImmunityRank") as HTMLInputElement)!.checked = rankExists.modImmunity;
        (document.getElementById("startEventsRank") as HTMLInputElement)!.checked = rankExists.canStartEvents;
        (document.getElementById("endEventsRank") as HTMLInputElement)!.checked = rankExists.canEndEvents;
        document.getElementById("saveRankSettings")!.classList.remove("disabled")
    }
}