// Handles the UI for ranks

async function rankPrep() {
    let currentRanks = await RankHandle.getAll();
    currentRanks.forEach(element => {
        if (element.rank !== "Mod" && element.rank !== "Streamer" && element.rank !== "user") {
            let rankButton = document.createElement("a");
            rankButton.className = `col-lg-12 col-11 btn btn-info mt-2 CUSTOM_RANK border-radius-5`
            rankButton.innerHTML = element.rank;
            rankButton.setAttribute("onclick", `displayRank("${element.rank}")`)
            document.getElementById("customRankButtons")!.append(rankButton)
        }
    });
    rankModalPrep()
}


async function addRank() {
    let rankName = (document.getElementById("rankAddInput") as HTMLInputElement)!.value.trim();
    let rankCreated = await RankHandle.createRank(rankName);
    if (rankCreated == "RANKADDED") {
        let rankButton = document.createElement("a");
        rankButton.className = `col-lg-12 col-11 btn btn-info mt-2 CUSTOM_RANK border-radius-5`;
        rankButton.innerHTML = rankName;
        rankButton.setAttribute("onclick", `displayRank('${rankName}')`)
        document.getElementById("customRankButtons")!.append(rankButton);
        $('#modalRankAdd').modal('hide');
    } else {
        document.getElementById("addRank")!.innerText = "That rank already exists."
    }
}

async function removeRank() {
    let rankName = (document.getElementById("rankRemoveInput")! as HTMLInputElement).value.trim();
    let rankRemoved = await RankHandle.removeRank(rankName)
    if (rankRemoved == "RANKREMOVED") {
        $('#modalRankremove').modal('hide');
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
        canDeleteMessages: (document.getElementById("deleteMessagesRank") as HTMLInputElement).checked,
        canTimeoutUsers: (document.getElementById("timeoutUsersRank") as HTMLInputElement).checked,
        canBanUsers: (document.getElementById("banUsersRank") as HTMLInputElement).checked,
        canUnBanUsers: (document.getElementById("unBanUsersRank") as HTMLInputElement).checked,
        modImmunity: (document.getElementById("modImmunityRank") as HTMLInputElement).checked,
        canStartEvents: (document.getElementById("startEventsRank") as HTMLInputElement).checked,
    }
    console.log(updatedRank);
    RankHandle.editRank(updatedRank);
    successMessage("Rank Settings Updated", "Your new rank settings have been applied.")
}


async function displayRank(rank:rankName) {
    let rankExists = await RankHandle.getRankPerms(rank)
    if (rankExists !== null) {
        loadSpecificRank(rankExists);
        document.getElementById("saveRankSettings")!.classList.remove("disabled")
    }
}


function rankModalPrep() {
    $('#modalRankAdd').on('hide.bs.modal', function (e) {
        console.log("Resetting rank add modal");
        document.getElementById("modalRankAddBody")!.innerHTML = resetModalRankAdd()
      })

    $('#modalRankremove').on('hide.bs.modal', function (e) {
        console.log("Resetting rank remove modal");
        document.getElementById("modalRankRemoveBody")!.innerHTML = resetModalRankRemove()
      })
}