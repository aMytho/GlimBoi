// Handles the UI for ranks

function rankPrep() {
    var currentRanks = RankHandle.getCurrentRanks();
    currentRanks.forEach(element => {
        if (element.rank !== "Mod" && element.rank !== "Streamer" && element.rank !== "user") {
            var rankButton = document.createElement("a");
            // @ts-ignore
            rankButton.classList = `col-lg-12 col-11 btn btn-info mt-2 CUSTOM_RANK border-radius-5`
            rankButton.innerHTML = element.rank;
            rankButton.setAttribute("onclick", `displayRank("${element.rank}")`)
            document.getElementById("customRankButtons")!.append(rankButton)
        }
    });
    rankModalPrep()
}


function addRank() {
    var rankName = (document.getElementById("rankAddInput") as HTMLInputElement)!.value.trim();
    RankHandle.createRank(rankName).then(data => {
        if (data == "RANKADDED") {
            var rankButton = document.createElement("a");
            // @ts-ignore
            rankButton.classList = `col-lg-12 col-11 btn btn-info mt-2 CUSTOM_RANK border-radius-5`;
            rankButton.innerHTML = rankName;
            rankButton.setAttribute("onclick", `displayRank('${rankName}')`)
            document.getElementById("customRankButtons")!.append(rankButton);
            $('#modalRankAdd').modal('hide');
        } else {
            document.getElementById("addRank")!.innerText = "That rank already exists."
        }
    })
}

function removeRank() {
    var rankName = (document.getElementById("rankRemoveInput")! as HTMLInputElement).value.trim();
    RankHandle.removeRank(rankName).then(data => {
        if (data == "RANKREMOVED") {
            $('#modalRankremove').modal('hide');
            var possibleRanks = document.getElementsByClassName("CUSTOM_RANK") as HTMLCollectionOf<HTMLParagraphElement> // adjust later
            console.log(possibleRanks)
            for (let item of possibleRanks) {
                if (item.innerText == rankName) {
                    item.remove()
                }
            }
        } else if (data == "INVALIDRANK") {
            document.getElementById("removeRank")!.innerText = "You cannot remove that rank."
        } else {
            document.getElementById("removeRank")!.innerText = "That rank does not exist."
        }
    })
}

function saveRankSettings(rank:rankName) {
    var updatedRank = {
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


function displayRank(rank:rankName) {
    var rankExists = RankHandle.getRankPerms(rank)
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