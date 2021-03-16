// Handles the UI for ranks

function rankPrep() {
    var currentRanks = RankHandle.getCurrentRanks();
    currentRanks.forEach(element => {
        if (element.rank !== "Mod" && element.rank !== "Streamer" && element.rank !== "user") {
            var rankButton = document.createElement("a");
            rankButton.classList = `col-lg-12 col-3 btn btn-info mt-2`
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
            rankButton.setAttribute("onclick", `displayRank("${rankName})"`)
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
        } else {
            document.getElementById("removeRank").innerText = "That rank does not exist."
        }
    })
}


function displayRank(rank) {
    var rankExists = RankHandle.getRankPerms(rank)
    if (rankExists !== null) {
        loadSpecificRank(rankExists);
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