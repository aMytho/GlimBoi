// Runs the UI for events
var EventHandle = require(appData[0] + "/chatbot/lib/events.js");
var arrayOfEvents = [];

/**
 * Ran when the event page is opened. The listeners are destroyed when the tab is closed.
 */
function loadEvents() {
    $('#modalRaffleList').on('hide.bs.modal', function (e) {
        document.getElementById('modalRaffleListBody').innerHTML = `
        <div class="modal-body" id="modalRaffleListBody">
                <p class="whitetext">Note that if a user joins multiple times they will only be counted once.</p>
                <ul id="RaffleUserList">
                  </ul>
            </div>`
        console.log('Hiding raffle user list.')
    })

    $('#modalRaffleList').on('show.bs.modal	', function (e) {
        $("#RaffleUserList").empty();
        var set = EventHandle.getRaffleUsers();
        set.forEach(element => {
            $("#RaffleUserList").append("<li>" + element + "</li>")
        });
        console.log("Showing raffle user list.")
    })
}

/**
 * Starts a raffle from the GUI. Lasts 1 minute.
 */
function startRaffle() {
    if (arrayOfEvents.includes("raffle")) {
        console.log("A raffle is already in progress.");
    } else {
        try {
            document.getElementById("raffleWinner").innerText = "Determining Winner...";
        } catch (e) {
        }
        arrayOfEvents.push("raffle");
        EventHandle.startRaffle(60000).then(data => {
            if (typeof data !== "object") {
            console.log("The winner is " + data);
            try {
                $("#RaffleUserList").empty();
                if (data == "Nobody joined the raffle so nobody won.") {
                    document.getElementById('raffleWinner').innerText = data
                } else {
                    document.getElementById('raffleWinner').innerText = data + " won!"
                }
            } catch (e) { }
        } else {
            try {
                $("#RaffleUserList li").remove()
                document.getElementById("raffleWinner").innerText = "Raffle Cancelled"
            } catch(e) {
            }
        }
        })
    }
}


/**
 * Adds a user to the list if they are not already on there.
 * @param {String} user 
 */
function raffleUsersUpdate(user) {
    console.log(user)
    try {
        var inList = false;
        $("#RaffleUserList li").each((id, elem) => {
            if (elem.innerText == user) {
                inList = true;
            }
        });
        if (inList == false) {
            $("#RaffleUserList").append("<li>" + user + "</li>")}
    } catch (e) { }
}
