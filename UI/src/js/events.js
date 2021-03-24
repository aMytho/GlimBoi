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
        var set = EventHandle.raffle.getRaffleUsers();
        set.forEach(element => {
            $("#RaffleUserList").append("<li>" + element + "</li>")
        });
        console.log("Showing raffle user list.");
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

/**
 *
 * @param {string} user
 * @param {string} action
 * @param {string} effect
 */
function actionHandler(user, action, effect) {

}