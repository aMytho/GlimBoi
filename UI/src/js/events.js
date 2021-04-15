// Runs the UI for events
const EventHandle = require(appData[0] + "/chatbot/lib/events.js");

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
        let set = EventHandle.raffle.getRaffleUsers();
        set.forEach(element => {
            $("#RaffleUserList").append("<li>" + element + "</li>")
        });
        console.log("Showing raffle user list.");
    })

    $('#pollUserList').on('hidden.bs.modal', function (e) {
        document.getElementById('pollUserList').innerHTML = `
        <div class="modal-dialog" role="document">
        <div class="modal-content glimPanel whiteText" id="raffleList">
          <!--Header-->
          <div class="modal-header text-center">
            <h4 class="modal-title w-100">User List</h4>
          </div>
          <!--Body-->
          <div class="modal-body" id="modalRaffleListBody">
            <p class="whitetext">The results of the poll will appear as they come in.</p>
            <table id="pollTable" class="w-100">
                <thead>
                    <tr id="pollOptionsHeader">
                        <th scope="col">User</th>
                    </tr>

                </thead>
            </table>
            </ul>
          </div>
          <!--Footer-->
          <div class="modal-footer">
            <p id="RaffleListModalText"></p>
            <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
          </div>
        </div>
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
        let inList = false;
        $("#RaffleUserList li").each((id, elem) => {
            if (elem.innerText == user) {
                inList = true;
            }
        });
        if (inList == false) {
            $("#RaffleUserList").append("<li>" + user + "</li>")}
    } catch (e) { }
}