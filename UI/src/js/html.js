// This file stores lengthy HTML.

function addCommandModal() {
    return `
    <div class="modal-body" id="commandAddModalBody">
   		<table class="table table-hover">
      		<thead>
         		<tr>
            		<th>Command</th>
            		<th>Data</th>
         		</tr>
      		</thead>
      		<tbody>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Name of command">Name</td>
            		<td>
               			<div id="addCommandName" contentEditable="true" data-text="ex. !follow"></div>
            		</td>
        		</tr>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Command Message">Command Data</td>
            		<td placeholder="test">
               			<div id="addCommandData" contentEditable="true" data-text="Command response"></div>
            		</td>
        		</tr>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="The amount of currency required">Points</td>
            		<td contenteditable="true" id="addCommandPoints">0</td>
        		</tr>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Sets a counter">Uses</td>
            		<td contenteditable="true" id="addCommandUses">0</td>
        		</tr>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="The minimum rank to use the command">Rank</td>
            		<td id="addCommandRank">
               			<select name="cars" id="rankChoiceAdd" >
                  			<option value="Everyone">Everyone (Default)</option>
               			</select>
            		</td>
        		</tr>
        		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Add to Repeat List">Repeat</td>
            		<td id="commandRepeat">
               			<select name="repeatableCommand" id="commandRepeatableChoice">
                  			<option value="false">Disabled (Default)</option>
                  			<option value="true">Enabled</option>
               			</select>
            		</td>
        		</tr>
                <tr>
                <td data-toggle="tooltip" data-placement="top" title="Play a sound on activation">Sound</td>
                <td id="commandSound">
                  <select name="commandSelect" id="commandSoundSelect">
                    <option value="null">None (Default)</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td data-toggle="tooltip" data-placement="top" title="Show media on activation">Image/GIF/Video</td>
                <td id="commandMedia">
                  <select name="commandSelectMedia" id="commandSelectMedia">
                    <option value="null">None (Default)</option>
                  </select>
                </td>
              </tr>
    		</tbody>
   		</table>
	</div>`
}

function editCommandModal(command, options) {
    let select = document.createElement("select")
    select.id = "rankChoiceEdit"
    select.innerHTML += "<option value=\"" + "Everyone" + "\">" + "Everyone (Default)" + "</option>";
    for (let i = 0; i < options.length; i++) {
        let opt = options[i].rank;
        if (command.rank == opt) {
            select.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + " (current)" + "</option>";
        } else {
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    let soundSelect = document.createElement("select");
    soundSelect.id = "commandEditSound";
    let soundOptions = OBSHandle.getSounds();
    let soundDefault = document.createElement("option");
    soundDefault.value = null;
    soundDefault.selected = true;
    soundDefault.appendChild(document.createTextNode("None (Default)"))
    soundSelect.appendChild(soundDefault)
    for (let i = 0; i < soundOptions.length; i++) {
        let opt = soundOptions[i].name;
        if (command.sound == opt) {
            soundDefault.selected = false
            soundSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + "</option>";
        } else {
            soundSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }
    let mediaSelect = document.createElement("select");
    mediaSelect.id = "commandMediaSelect";
    let mediaOptions = OBSHandle.getImages();
    let mediaOptions2 = OBSHandle.getVideos();
    mediaOptions = mediaOptions.concat(mediaOptions2);
    let mediaDefault = document.createElement("option");
    mediaDefault.value = null;
    mediaDefault.selected = true;
    mediaDefault.innerText = "None (Default)"
    mediaSelect.appendChild(mediaDefault)
    for (let i = 0; i < mediaOptions.length; i++) {
        let opt = mediaOptions[i].name;
        if (command.media == opt) {
            mediaDefault.selected = false
            mediaSelect.innerHTML += "<option value=\"" + opt + "\" selected>" + opt + "</option>";
        } else {
            mediaSelect.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
    }

   	return `
	<div class="modal-header text-center">
   		<h4 class="modal-title w-100" id="myModalLabel">Edit a command</h4>
	</div>
	<div class="modal-body">
   		<table class="table table-hover">
      		<thead>
         		<tr>
            		<th>Command</th>
            		<th>Data</th>
         		</tr>
      		</thead>
      		<tbody>
         		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Command Message">Command Data</td>
            		<td contenteditable="true" id="editCommandData">${command.message}</td>
         		</tr>
         		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="The amount of currency required">Points</td>
            		<td contenteditable="true" id="editCommandPoints">${command.points}</td>
         		</tr>
         		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Sets a counter">Uses</td>
            		<td contenteditable="true" id="editCommandUses">${command.uses}</td>
         		</tr>
         		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Restrict a command to a specific rank">Rank</td>
            		<td id="editCommandRank">
               			${select.outerHTML}
            		</td>
         		</tr>
         		<tr>
            		<td data-toggle="tooltip" data-placement="top" title="Add to Repeat List">Repeat</td>
            		<td id="commandRepeat">
               			<select name="repeatableCommand" id="commandRepeatableChoiceEdit">
                  			<option value="false">Disabled (Default)</option>
                  			<option value="true">Enabled</option>
               			</select>
            		</td>
         		</tr>
                 <tr>
                 <td data-toggle="tooltip" data-placement="top" title="Play a sound on activation">Sound</td>
                 <td id="editCommandSound">
                        ${soundSelect.outerHTML}
                 </td>
              </tr>
              </tr>
                 <tr>
                 <td data-toggle="tooltip" data-placement="top" title="Show media on activation">Image/GIF/Video</td>
                 <td id="editCommandMedia">
                        ${mediaSelect.outerHTML}
                 </td>
              </tr>
      		</tbody>
   		</table>
	</div>
	<!--Footer-->
	<div class="modal-footer">
   		<p id="errorMessageEdit"></p>
   		<button type="button" class="btn btn-outline-warning" onclick="editReset()" data-dismiss="modal">Close</button>
   		<button class="btn btn-outline-success" onclick="editCommand()" id="editCommandButtonFinish">Edit</button>
	</div>`
}

function editCommandModalEntry() {
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
                    <label for="avatar">Upload Media:</label>
                    <input type="file"
                        id="addMediaInput" name="input"
                        accept="image/png, image/jpeg, audio/mp3, audio/wav, video/mp4, video/webm">
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
                    <label for="avatar">Upload Media:</label>
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
          <button class="btn btn-outline-danger" id="mediaEditButton" onclick="removeMedia(document.getElementById('mediaRemoveInput').value)">Remove</button>
        </div>`
}

function audioResetModal() {
    return `
    <select id="playAudioModalSelect">
                <option value="null">None</option>
            </select>
            <p id="audioMessage">Select the audio to be played in the overlay</p>`
}

function imageResetModal() {
    return `
    <select id="playImageModalSelect">
                <option value="none">None</option>
            </select>
            <p>Select the Image or GIF to be shown in the overlay</p>`
}