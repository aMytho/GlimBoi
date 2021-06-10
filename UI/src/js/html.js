// This file stores lengthy HTML.

function editCommandReset() {
   	return `
   	<!--Header-->
	<div class="modal-header text-center">
   		<h4 class="modal-title w-100" id="myModalLabelEdit">Edit a command</h4>
	</div>
	<!--Body-->
	<div class="modal-body">
   		<!--Body-->
		<div class="modal-body">
 			<div class="icon-input-container">
    			<input class="icon-input" type="text" placeholder="Command Name" id="commandEditInput">
    			<p id="editCommandMessage" class="errorMessage"></p>
			</div>
		</div>
	</div>
	<!--Footer-->
	<div class="modal-footer">
   		<p id="errorMessageEdit"></p>
   		<button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
   		<button class="btn btn-outline-success" onclick="checkEditCommand()" id="addCommandButtonFinish">Edit</button>
	</div>`
}

function removeCommandReset() {
   	return `
   	<!--Header-->
    <div class="modal-header text-center">
    	<h4 class="modal-title w-100" id="myModalLabelDelete">Remove a Command</h4>
    </div>
    <!--Body-->
    <div class="modal-body">
        <div class="icon-input-container">
          	<input class="icon-input" type="text" placeholder="Command Name" id="commandRemoveInput">
          	<p id="removeCommandMessage" class="errorMessage"></p>
        </div>
    </div>
    <!--Footer-->
    <div class="modal-footer">
        <p id="errorMessageDelete"></p>
        <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
        <button class="btn btn-outline-danger" onclick="checkRemoveCommand()" id="removeCommandButtonFinish">Remove</button>
    </div>`
}

function addUserReset() {
   	return `
   	<!--Header-->
    <div class="modal-header text-center">
        <h4 class="modal-title w-100" id="myModalLabel">Add a User</h4>
    </div>
    <!--Body-->
    <div class="modal-body">
        <div class="icon-input-container">
          	<input class="icon-input" type="text" placeholder="Enter the User" id="userAddInput">
          	<p id="addUserMessage" class="errorMessage"></p>
          	<p id="addUserMessageSuccess" class="successMessage"></p>
        </div>
    </div>
    <!--Footer-->
    <div class="modal-footer">
        <p id="errorMessageAdd"></p>
        <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
        <button class="btn btn-outline-primary" onclick="addUser()" id="addUserFinish">Add</button>
    </div>`
}

function removeUserReset() {
   	return `
   	<div class="modal-content glimPanel whiteText" id="removeuserModal">
      	<!--Header-->
      	<div class="modal-header text-center">
        	<h4 class="modal-title w-100" id="myModalLabel2">Remove a User</h4>
      	</div>
      	<!--Body-->
      	<div class="modal-body">
        	<div class="icon-input-container">
          		<input class="icon-input" type="text" placeholder="Enter the User" id="userremoveInput">
          		<p>This is irreversible.</p>
          		<p id="removeUserMessage" class="errorMessage"></p>
          		<p id="removeUserMessageSuccess" class="successMessage"></p>
        	</div>
      	</div>
      	<!--Footer-->
      	<div class="modal-footer">
        	<p id="errorMessageRemove"></p>
        	<button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
        	<button class="btn btn-outline-danger" onclick="removeUser()" id="removeUserFinish">Remove</button>
      	</div>
	</div>` // You were missing a DIV - GG2015
}

function addQuoteReset() {
   	return `
   	<!--Header-->
    <div class="modal-header text-center">
        <h4 class="modal-title w-100" id="myModalLabel3">Add a Quote</h4>
    </div>
    <!--Body-->
    <div class="modal-body">
        <div class="icon-input-container">
          	<input class="icon-input" type="text" placeholder="Enter the User" id="userQuoteInputU">
          	<input class="icon-input" type="text" placeholder="Enter the Quote" id="userQuoteInputQ">
          	<p>If the user does not yet exist it will be created.</p>
          	<p id="addQuoteMessage" class="errorMessage"></p>
          	<p id="addQuoteMessageSuccess" class="successMessage"></p>
        </div>
    </div>
    <!--Footer-->
    <div class="modal-footer">
        <p id="errorMessageAddQuote"></p>
        <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
        <button class="btn btn-outline-primary" onclick="addQuote()" id="addQuoteFinish">Add</button>
    </div>`
}

function editUserReset() {
   	return `
   	<!--Header-->
    <div class="modal-header text-center">
        <h4 class="modal-title w-100">Edit User</h4>
    </div>
    <!--Body-->
    <div class="modal-body" id="modalEditBody">
        <div class="icon-input-container">
          	<input class="icon-input" type="text" placeholder="Username" id="userEditSearch">
          	<p id="editUserMessage" class="errorMessage"></p>
        </div>
    </div>
    <!--Footer-->
    <div class="modal-footer">
        <p id="errorUserEdit"></p>
        <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
        <button class="btn btn-outline-success" onclick="userSearch(document.getElementById('userEditSearch').value)" id="userEditSearchButton">Search</button>
    </div>`
}

function removeQuoteReset() {
   	return `
   	<!--Header-->
   	<div class="modal-header text-center">
     	<h4 class="modal-title w-100">Remove Quote</h4>
   	</div>
   	<!--Body-->
   	<div class="modal-body" id="modalRemoveQuote">
     	<div class="icon-input-container">
       		<input class="icon-input" type="text" placeholder="Username" id="userQuoteSearch">
       		<p id="editQuoteError" class="errorMessage"></p>
     	</div>
   	</div>
   	<!--Footer-->
   	<div class="modal-footer">
     	<p id="errorQuoteExit"></p>
     	<button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
     	<button class="btn btn-outline-danger" onclick="quoteSearch(document.getElementById('userQuoteSearch').value)" id="userRemoveQuoteSearch">Search</button>
   	</div>`
}

function setModalEditBody(data, options) {
    var select = document.createElement("select")
    select.id = "userEditRankChoice"
    for (var i = 0; i < options.length; i++) {
        var opt = options[i].rank;
        if (data.role == opt) {
            select.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    console.log(select)
   	return `
   	<table class="table table-hover">
     	<thead>
       		<tr>
         		<th>User</th>
         		<th>Information</th>
       		</tr>
     	</thead>
     	<tbody>
       		<tr>
         		<td data-toggle="tooltip" data-placement="top" title="Rank">Rank</td>
         		<td contenteditable="false" id="EditUserRank">
                 ${select.outerHTML}
                 </td>
       		</tr>
       		<tr>
         		<td data-toggle="tooltip" data-placement="top" title="The amount of points the user has">Points</td>
         		<td contenteditable="true" id="editUserPoints" onpaste="return false">${data.points}</td>
       		</tr>
       		<tr>
     	</tbody>
   	</table>`;
}

function setModalEditButtons() {
   	return `
   	editUserTable(
      	tempUser,
      	$("#userEditRankChoice").val(),
      	document.getElementById('editUserPoints').innerHTML
    ),
    $('#modalUserEdit').modal('hide'),
    UserHandle.editUser(
      	tempUser.toLowerCase(),
        $("#userEditRankChoice").val(),
      	document.getElementById('editUserPoints').innerHTML
    )`
}

function resetModalRankAdd() {
    return `
    <!--Body-->
          <div class="modal-body">
            <div class="icon-input-container">
              <input class="icon-input" type="text" placeholder="Rank Name" id="rankAddInput">
              <p id="addCommandRank" class="errorMessage"></p>
            </div>
          </div>`
}

function resetModalRankRemove() {
    return `
    <!--Body-->
          <div class="modal-body">
            <div class="icon-input-container">
              <input class="icon-input" type="text" placeholder="Rank Name" id="rankRemoveInput">
              <p id="removeRank" class="errorMessage"></p>
            </div>
          </div>`
}

function loadSpecificRank(rank) {
    document.getElementById("rankName").innerText = rank.rank;
    document.getElementById("rankMessage").innerText = "Make sure to save your changes!";
    document.getElementById("addCommandsRank").checked = rank.canAddCommands;
    document.getElementById("editCommandsRank").checked = rank.canEditCommands;
    document.getElementById("removeCommandsRank").checked = rank.canRemoveCommands;
    document.getElementById("addPointsRank").checked = rank.canAddPoints;
    document.getElementById("editPointsRank").checked = rank.canEditPoints;
    document.getElementById("removePointsRank").checked = rank.canRemovePoints;
    document.getElementById("addUsersRank").checked = rank.canAddUsers;
    document.getElementById("editUsersRank").checked = rank.canEditUsers;
    document.getElementById("removeUsersRank").checked = rank.canRemoveUsers;
    document.getElementById("addQuotesRank").checked = rank.canAddQuotes;
    document.getElementById("editQuotesRank").checked = rank.canEditQuotes;
    document.getElementById("removeQuotesRank").checked = rank.canRemoveQuotes;
    document.getElementById("controlMusicRank").checked = rank.canControlMusic;
}

function addMediaModal() {
    return `
    <!--Header-->
        <div class="modal-header text-center">
          <h4 class="modal-title w-100">Add Media</h4>
        </div>
        <!--Body-->
        <div class="modal-body" id="addMediaBody">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Media</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Name of media">Name</td>
                <td><div id="addMediaName" contentEditable="true" data-text="Ex. Fireworks"></div></td>
              </tr>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Position of the image/video">Position (Non audio elements)</td>
                <td>
                    <select id="addMediaPosition">
                        <option value="topLeft">Top Left</option>
                        <option value="topMid">Top Middle</option>
                        <option value="topRight">Top Right</option>
                        <option value="midLeft">Middle Left</option>
                        <option value="midMid">Middle Middle</option>
                        <option value="midRight">Middle Right</option>
                        <option value="bottomLeft">Bottom Left</option>
                        <option value="bottomMiddle">Bottom Middle</option>
                        <option value="bottomRight">Bottom Right</option>
                    </select>
                </td>
              </tr>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Media file">File</td>
                <td>
                    <label for="avatar">Audio, Image/GIF, Video</label>
                    <input type="file"
                        id="addMediaInput" name="input"
                        accept="image/png, image/jpeg, image/gif, audio/mp3, audio/wav, video/mp4, video/webm, video/mov">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--Footer-->
        <div class="modal-footer">
          <p id="addMediaError"></p>
          <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
          <button class="btn btn-outline-primary" onclick="addMedia()">Add</button>
        </div>
      </div>`
}

function fillMediaEdit(media) {
    document.getElementById("mediaEditButton").onclick = function() {editMediaCheck()}
    document.getElementById("mediaEditName").innerText = "Edit " + media.name
    let positionArray = ["topLeft", "topMid", "topRight", "midLeft", "midMid", "midRight", "bottomLeft", "bottomMid", "bottomRight"]
    let select = document.createElement("select")
    select.id = "editMediaFileInput"
    for (let i = 0; i < positionArray.length; i++) {
        let opt = positionArray[i];
        if (media.position == opt) {
            select.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    return `
    <table class="table table-hover">
            <thead>
              <tr>
                <th>Media</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Position of the image/video">Position (Non audio elements)</td>
                <td>
                    ${select.outerHTML}
                </td>
              </tr>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Media file">File</td>
                <td>
                    <label for="avatar">Audio, Image/GIF, Video</label>
                    <input type="file"
                        id="editMediaInput" name="input"
                        accept="image/png, image/jpeg, audio/mp3, audio/wav, video/mp4, video/webm">
                </td>
              </tr>
            </tbody>
    </table>`
}

function editMediaModal() {
    return `
    <!--Header-->
        <div class="modal-header text-center">
          <h4 class="modal-title w-100" id="mediaEditName">Edit Media</h4>
        </div>
        <!--Body-->
        <div class="modal-body" id="editMediaBody">
            <div class="icon-input-container">
                <input class="icon-input" type="text" placeholder="Media Name" id="mediaEditInput">
                <p id="editMediaMessage" class="errorMessage"></p>
              </div>
        </div>
        <!--Footer-->
        <div class="modal-footer">
          <p id="editMediaError"></p>
          <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
          <button class="btn btn-outline-success" id="mediaEditButton" onclick="editMedia(document.getElementById('mediaEditInput').value)">Edit</button>
        </div>
    `
}

function removeMediaModal() {
    return `
    <!--Header-->
        <div class="modal-header text-center">
          <h4 class="modal-title w-100">Remove Media</h4>
        </div>
        <!--Body-->
        <div class="modal-body" id="removeMediaBody">
            <div class="icon-input-container">
                <input class="icon-input" type="text" placeholder="Media Name" id="mediaRemoveInput">
              </div>
        </div>
        <!--Footer-->
        <div class="modal-footer">
          <p id="RemoveMediaError"></p>
          <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
          <button class="btn btn-outline-danger" id="mediaRemoveButton" onclick="removeMedia(document.getElementById('mediaRemoveInput').value)">Remove</button>
        </div>`
}

function audioResetModal() {
    return `
    <select id="playAudioModalSelect">
                <option value="null">None</option>
            </select>
            <p id="audioMessage">Select the audio to be played in the overlay</p>
            <p class="mt-2 errorClass" id="errorDisplayMedia2"></p>`
}

function imageResetModal() {
    return `
    <select id="playImageModalSelect">
                <option value="none">None</option>
            </select>
            <p>Select the Image or GIF to be shown in the overlay</p>
            <p class="mt-2 errorClass" id="errorDisplayMedia"></p>`
}

function addActionHTML(action) {
    if (action.type == "quote") {
        let newDiv = document.createElement("div");
        newDiv.classList = "chat-body1 clearfix testing"
        let newText = document.createElement("p");
        newText.innerText = `Quote: ${action.data} | Quote from ${action.target}`
        newDiv.appendChild(newText);
        document.getElementById("actions").appendChild(newDiv)
    } else if (action.type == "userAdd") {
        let newDiv = document.createElement("div");
        newDiv.classList = "chat-body1 clearfix testing"
        let newText = document.createElement("p");
        newText.innerText = `User ${action.data} added to Glimboi!`
        newDiv.appendChild(newText);
        document.getElementById("actions").appendChild(newDiv)
    }
}

function actionError(action) {
    if (action.type == "quote") {
        let newDiv = document.createElement("div");
        newDiv.classList = "chat-body1 clearfix testing";
        let newText = document.createElement("p");
        newText.innerText = `Quote failed to add. Please ensure you are authenticated and the user exists.`;
        newText.classList = "errorMessage"
        newDiv.appendChild(newText);
        document.getElementById("actions").appendChild(newDiv);
    } else if (action.type == "userAdd") {
        let newDiv = document.createElement("div");
        newDiv.classList = "chat-body1 clearfix testing";
        let newText = document.createElement("p");
        if (action.error == "USEREXISTS") {
            newText.innerText = `That user has already been added to Glimboi!`;
        } else if (action.error == "INVALIDUSER") {
            newText.innerText = `That user doesn't exist. Whoah, this shouldn't be possible!`;
        }
        newText.classList = "errorMessage"
        newDiv.appendChild(newText);
        document.getElementById("actions").appendChild(newDiv);
    }

}