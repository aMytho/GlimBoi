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
                  <option value="Everyone">Everyone (Defualt)</option>
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
                  <option value="false">Disabled (Defualt)</option>
                  <option value="true">Enabled</option>
               </select>
            </td>
         </tr>
      </tbody>
   </table>
</div>`
}

function editCommandModal(arrayOfCommands, i) {
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
            <td contenteditable="true" id="editCommandArguements">${arrayOfCommands[i][1]}</td>
         </tr>
         <tr>
            <td data-toggle="tooltip" data-placement="top" title="Command Message">Command Data</td>
            <td contenteditable="true" id="editCommandData">${arrayOfCommands[i][2]}</td>
         </tr>
         <tr>
            <td data-toggle="tooltip" data-placement="top" title="The amount of currency required">Points</td>
            <td contenteditable="true" id="editCommandPoints">${arrayOfCommands[i][4]}</td>
         </tr>
         <tr>
            <td data-toggle="tooltip" data-placement="top" title="Sets a counter">Uses</td>
            <td contenteditable="true" id="editCommandUses">${arrayOfCommands[i][3]}</td>
         </tr>
         <tr>
            <td data-toggle="tooltip" data-placement="top" title="The minimum rank to use the command">Rank</td>
            <td id="editCommandRank">
               <select name="cars" id="rankChoiceEdit" disabled>
                  <option value="Everyone">Everyone (Defualt)</option>
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
                  <option value="false">Disabled (Defualt)</option>
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