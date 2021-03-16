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
            <td data-toggle="tooltip" data-placement="top" title="Arguements">Arguements</td>
            <td>
               <div id="addCommandArguements" contentEditable="true" data-text="null"></div>
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
               <select name="cars" id="rankChoiceAdd" disabled>
                  <option value="Everyone">Everyone (Default)</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Editor">Editor</option>
                  <option value="Streamer">Streamer</option>
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
      </tbody>
   </table>
</div>`
}

function editCommandModal(command) {
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
            <td data-toggle="tooltip" data-placement="top" title="Arguements">Arguements</td>
            <td contenteditable="true" id="editCommandArguements">${command.arguements}</td>
         </tr>
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
            <td data-toggle="tooltip" data-placement="top" title="The minimum rank to use the command">Rank</td>
            <td id="editCommandRank">
               <select name="cars" id="rankChoiceEdit" disabled>
                  <option value="Everyone">Everyone (Default)</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Editor">Editor</option>
                  <option value="Streamer">Streamer</option>
               </select>
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
      </tbody>
   </table>
</div>
<!--Footer-->
<div class="modal-footer">
   <p id="errorMessageEdit"></p>
   <button type="button" class="btn btn-outline-warning" onclick="editReset()" data-dismiss="modal">Close</button>
   <button class="btn btn-outline-success" onclick="editCommand()" id="editCommandButtonFinish">Edit</button>
</div>
   `
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
      </div>`
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

function setModalEditBody(data) {
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
         <td data-toggle="tooltip" data-placement="top" title="Rank">Chat role</td>
         <td contenteditable="false" id="EditUserRank">${data.role}</td>
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
      document.getElementById('EditUserRank').innerHTML,
      document.getElementById('editUserPoints').innerHTML
    ),
    $('#modalUserEdit').modal('hide'),
    UserHandle.editUser(
      tempUser.toLowerCase(),
      document.getElementById('EditUserRank').innerHTML,
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
}