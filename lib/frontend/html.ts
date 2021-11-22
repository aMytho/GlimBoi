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
        <button class="btn btn-outline-primary" onclick="searchAndAddUser()" id="addUserFinish">Add</button>
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
        <button class="btn btn-outline-success" onclick="userSearch(document.getElementById('userEditSearch').value, false)" id="userEditSearchButton">Search</button>
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

function loadSpecificRank(rank: RankType) {
    (document.getElementById("rankName") as HTMLInputElement)!.innerText = rank.rank;
    (document.getElementById("tierRank") as HTMLInputElement)!.value = rank.rankTier.toString();
    (document.getElementById("rankMessage") as HTMLInputElement)!.innerText = "Make sure to save your changes!";
    (document.getElementById("addCommandsRank") as HTMLInputElement)!.checked = rank.canAddCommands;
    (document.getElementById("editCommandsRank") as HTMLInputElement)!.checked = rank.canEditCommands;
    (document.getElementById("removeCommandsRank") as HTMLInputElement)!.checked = rank.canRemoveCommands;
    (document.getElementById("addPointsRank") as HTMLInputElement)!.checked = rank.canAddPoints;
    (document.getElementById("editPointsRank") as HTMLInputElement)!.checked = rank.canEditPoints;
    (document.getElementById("removePointsRank") as HTMLInputElement)!.checked = rank.canRemovePoints;
    (document.getElementById("addUsersRank") as HTMLInputElement)!.checked = rank.canAddUsers;
    (document.getElementById("editUsersRank") as HTMLInputElement)!.checked = rank.canEditUsers;
    (document.getElementById("removeUsersRank") as HTMLInputElement)!.checked = rank.canRemoveUsers;
    (document.getElementById("addQuotesRank") as HTMLInputElement)!.checked = rank.canAddQuotes;
    (document.getElementById("editQuotesRank") as HTMLInputElement)!.checked = rank.canEditQuotes;
    (document.getElementById("removeQuotesRank") as HTMLInputElement)!.checked = rank.canRemoveQuotes;
    (document.getElementById("controlMusicRank") as HTMLInputElement)!.checked = rank.canControlMusic;
    (document.getElementById("modImmunityRank") as HTMLInputElement)!.checked = rank.modImmunity;
    (document.getElementById("startEventsRank") as HTMLInputElement)!.checked = rank.canStartEvents;
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

function actionError(action) {
    if (action.type == "quote") {
        let newDiv = document.createElement("div");
        // @ts-ignore
        newDiv.classList = "chat-body1 clearfix testing";
        let newText = document.createElement("p");
        newText.innerText = `Quote failed to add. Please ensure you are authenticated and the user exists.`;
        // @ts-ignore
        newText.classList = "errorMessage"
        newDiv.appendChild(newText);
        document.getElementById("actions")!.appendChild(newDiv);
    } else if (action.type == "userAdd") {
        let newDiv = document.createElement("div");
        // @ts-ignore
        newDiv.classList = "chat-body1 clearfix testing";
        let newText = document.createElement("p");
        if (action.error == "USEREXISTS") {
            newText.innerText = `That user has already been added to Glimboi!`;
        } else if (action.error == "INVALIDUSER") {
            newText.innerText = `That user doesn't exist. Whoah, this shouldn't be possible!`;
        }
        // @ts-ignore
        newText.classList = "errorMessage"
        newDiv.appendChild(newText);
        document.getElementById("actions")!.appendChild(newDiv);
    }
}

function bannedWordAddReset() {
    return `
    <div class="modal-header text-center">
          <h4 class="modal-title w-100" id="myModalLabel">Add Banned Words</h4>
        </div>
        <!--Body-->
        <div class="modal-body">
          <div class="icon-input-container">
            <input class="icon-input" type="text" placeholder="Enter words here" id="wordAddInput">
            <p class="mt-2">Enter the banned words to add. You can separate multiple words with spaces. 1 word per trigger (ie. "What's Twitch?" would have 2 triggers, not 1 phrase)</p>
            <p id="addWordErrorMessage" class="errorMessage"></p>
            <p id="addWordSuccessMessage" class="successMessage"></p>
          </div>
        </div>
        <!--Footer-->
        <div class="modal-footer">
          <p id="errorMessageAdd"></p>
          <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
          <button class="btn btn-outline-primary" onclick="addBannedWords(document.getElementById('wordAddInput').value)">Add</button>
        </div>`
}

function bannedWordRemoveReset() {
    return `
    <div class="modal-header text-center">
    <h4 class="modal-title w-100">Remove Banned Words</h4>
  </div>
  <!--Body-->
  <div class="modal-body">
    <div class="icon-input-container">
      <input class="icon-input" type="text" placeholder="Enter words here" id="wordRemoveInput">
      <p class="mt-2">Enter the banned words to remove. You can separate multiple words with space. 1 word per trigger (ie. "What's Twitch?" would remove 2 words, not 1 phrase)</p>
      <p id="removeWordErrorMessage" class="errorMessage"></p>
      <p id="removeWordSuccessMessage" class="successMessage"></p>
    </div>
  </div>
  <!--Footer-->
  <div class="modal-footer">
    <p id="errorMessageAdd"></p>
    <button type="button" class="btn btn-outline-warning" data-dismiss="modal">Close</button>
    <button class="btn btn-outline-danger" onclick="removeBannedWords(document.getElementById('wordRemoveInput').value)">Remove</button>
  </div>`
}