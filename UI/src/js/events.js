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

    $('#modalPoll').on('hide.bs.modal', function (e) {
        document.getElementById('modalPollBody').innerHTML = `
        <div class="modal-body" id="modalPollBody">
                <p class="text-center">Any blank options will be removed. The question and options must not exceed the chat limit.</p>
                <table class="table table-hover" id="pollData">
                    <thead>
                       <tr>
                          <th>Type</th>
                          <th>Data</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr>
                          <td data-toggle="tooltip" data-placement="top" title="The poll question">Question</td>
                          <td contenteditable="true" id="pollQuestion"></td>
                       </tr>
                       <tr>
                          <td data-toggle="tooltip" data-placement="top" title="Poll response">Option</td>
                          <td contenteditable="true" class="pollOption"></td>
                       </tr>
                    </tbody>
                 </table>
            </div>`
        console.log('Resetting poll modal')
    })
}

/**
 * Starts a raffle from the GUI. Lasts 1 minute.
 */
function startRaffle() {
    if (arrayOfEvents.includes("raffle")) {
        console.log("A raffle is already in progress.");
        errorMessage("Raffle In progress", "A raffle is already in progres. Only one raffle can be run at a time. ")
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


function startPoll(user, message, GUI, stringMessage) {
    if (arrayOfEvents.includes("poll")) {
        console.log("A poll is already in progress.");
        errorMessage("Poll in Progress", "A poll is already in progress. Only one poll can be run at a time.");
    } else {
        if (GUI) {
            var options = document.getElementsByClassName("pollOption");
            var pollOptions = [];
            for (let index = 0; index < options.length; index++) {
                console.log(options[index].innerText);
                if (options[index].innerText !== "" && options[index].innerText !== undefined && options[index].innerText !== null) {
                    pollOptions.push(options[index].innerText)
                }
            }
            console.log(pollOptions);
            if (!user) {
                user = ChatHandle.getBotName();
            }
            arrayOfEvents.push("poll");
            EventHandle.startPoll({ question: message, options: pollOptions, user: user }, 25000).then(data => {
                if (data == "NOPOLL") {
                    var pollError = document.getElementById("PollModalText").innerHTML = "No Question was selected.";
                    setTimeout(() => {
                        pollError.innerText = ""
                    }, 3000);
                }
            })
            $("#modalPoll").modal("hide");
        } else {
        arrayOfEvents.push("poll");
        console.log(stringMessage);
        stringMessage = stringMessage.slice(6)
        var questionEnd = stringMessage.indexOf("?");
        console.log(questionEnd);
        var question = stringMessage.substring(questionEnd + 1);
        var possibleAnswers = question.split('|');
        console.log(possibleAnswers);
        for (let index = 0; index < possibleAnswers.length; index++) {
           possibleAnswers[index] = possibleAnswers[index].trim()
        }
        console.log(possibleAnswers);
        EventHandle.startPoll({ question: stringMessage.slice(0, questionEnd + 1), options: possibleAnswers, user: user }, 60000).then(data => {
            if (data == "POLLFINISHED") {
                console.log("The poll has finsished");
            } else if (data == {status:"CANCELLED", reson:"MANUAL CANCELLATION"}){
                try {
                    document.getElementById("pollResults").innerText = "Poll Cancelled"
                } catch (e) {
                }
            }
        })
      }
    }
}


function openGlimRealm(user) {
    if (EventHandle.getGlimrealmStatus() == "active") {
        ChatMessages.filterMessage("The portal to the Glimrealm is already open! Type !portal to enter the world of the Glimdrops.");
    } else if (EventHandle.getGlimrealmStatus() == "charging") {
        ChatMessages.filterMessage("The portal to Glimrealm is charging. You must wait until it finishes to enter the world of the Glimdrops.", "glimboi")
    } else if (EventHandle.getGlimrealmStatus() == "ready") {
        EventHandle.openGlimrealm();
        arrayOfEvents.push("glimrealm")
        ChatMessages.filterMessage("The portal to the Glimrealm has been opened! Type !portal to enter the world of the Glimdrops!", "glimboi");
    }

}

/**
 *
 * @param {string} user
 * @param {string} action
 * @param {string} effect
 */
function actionHandler(user, action, effect) {

}