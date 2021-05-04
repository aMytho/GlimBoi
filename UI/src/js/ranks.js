// Handles the UI for ranks

function rankPrep() {
    var currentRanks = RankHandle.getCurrentRanks();
    currentRanks.forEach(element => {
        if (element.rank !== "Mod" && element.rank !== "Streamer" && element.rank !== "user") {
            var rankButton = document.createElement("a");
            rankButton.classList = `col-lg-12 col-3 btn btn-info mt-2 CUSTOM_RANK`
            rankButton.innerHTML = element.rank;
            rankButton.setAttribute("onclick", `displayRank("${element.rank}")`)
            document.getElementById("customRankButtons").append(rankButton)
        }
    });
    rankModalPrep()
}


function addRank() {
    var rankName = document.getElementById("rankAddInput").value.trim();
    RankHandle.createRank(rankName).then(data => {
        if (data == "RANKADDED") {
            var rankButton = document.createElement("a");
            rankButton.classList = `col-lg-12 col-3 btn btn-info mt-2 CUSTOM_RANK`;
            rankButton.innerHTML = rankName;
            rankButton.setAttribute("onclick", `displayRank('${rankName}')`)
            document.getElementById("customRankButtons").append(rankButton);
            $('#modalRankAdd').modal('hide');
        } else {
            document.getElementById("addRank").innerText = "That rank already exists."
        }
    })
}

function removeRank() {
    var rankName = document.getElementById("rankRemoveInput").value.trim();
    RankHandle.removeRank(rankName).then(data => {
        if (data == "RANKREMOVED") {
            $('#modalRankremove').modal('hide');
            var possibleRanks = document.getElementsByClassName("CUSTOM_RANK");
            console.log(possibleRanks)
            for (item of possibleRanks) {
                if (item.innerText == rankName) {
                    item.remove()
                }
            }
        } else if (data == "INVALIDRANK") {
            document.getElementById("removeRank").innerText = "You cannot remove that rank."
        } else {
            document.getElementById("removeRank").innerText = "That rank does not exist."
        }
    })
}

function saveRankSettings(rank) {
    var updatedRank = {
        rank: rank,
        canAddCommands: document.getElementById("addCommandsRank").checked,
        canEditCommands: document.getElementById("editCommandsRank").checked,
        canRemoveCommands: document.getElementById("removeCommandsRank").checked,
        canAddPoints: document.getElementById("addPointsRank").checked,
        canEditPoints: document.getElementById("editPointsRank").checked,
        canRemovePoints: document.getElementById("removePointsRank").checked,
        canAddUsers: document.getElementById("addUsersRank").checked,
        canEditUsers: document.getElementById("editUsersRank").checked,
        canRemoveUsers: document.getElementById("removeUsersRank").checked,
        canAddQuotes: document.getElementById("addQuotesRank").checked,
        canEditQuotes: document.getElementById("editQuotesRank").checked,
        canRemoveQuotes: document.getElementById("removeQuotesRank").checked,
        canControlMusic: document.getElementById("controlMusicRank").checked
    }
    console.log(updatedRank);
    RankHandle.editRank(updatedRank);
    successMessage("Rank Settings Updated", "Your new rank settings have been applied.")
}


function displayRank(rank) {
    var rankExists = RankHandle.getRankPerms(rank)
    if (rankExists !== null) {
        loadSpecificRank(rankExists);
        document.getElementById("saveRankSettings").classList.remove("disabled")
    }
}


function rankModalPrep() {
    $('#modalRankAdd').on('hide.bs.modal', function (e) {
        console.log("Resetting rank add modal");
        document.getElementById("modalRankAddBody").innerHTML = resetModalRankAdd()
      })

    $('#modalRankremove').on('hide.bs.modal', function (e) {
        console.log("Resetting rank remove modal");
        document.getElementById("modalRankRemoveBody").innerHTML = resetModalRankRemove()
      })
}