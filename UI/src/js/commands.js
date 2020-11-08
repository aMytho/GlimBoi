//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
var fs = require("fs"); //File handling
const Datastore = require("nedb"); // The database module

let commandsDB = new Datastore({
  filename: `${app.getAppPath()}/chatbot/data/commands.db`,
  autoload: true,
}); // The DB of commands.
let quotesDB = new Datastore({
  filename: `${app.getAppPath()}/chatbot/data/quotes.db`,
  autoload: true,
});
let usersDB = new Datastore({
  filename: `${app.getAppPath()}/chatbot/data/users.db`,
  autoload: true,
});
console.log(app.getAppPath())
var CommandHandle = require(app.getAppPath() + "/chatbot/lib/commands.js");
var arrayOfCommands = []; //An array that stores the commands from the DB so we don't import them every change.
var tblhasbeenopened = false; //Ensures we don't run this function evey time the table is opened.
var table; //The physical table for the UI

var commandToBeEdited; // A global var because I was too lazy to find another solution. Must have for editing.

//Loads the command table. It is loaded when the page is opened for the first time. After that it is saved to a variable.
function loadCommandTable() {
  if (tblhasbeenopened == false) {
    CommandHandle.updatePath(app.getAppPath());
    //  let commandData = fs.readFileSync('chatbot/data/commands.JSON'); //Imports the commands.
    let commandData;
    //Imports all the commands from the DB
    commandsDB.find({}, function (err, docs) {
      console.log(docs);
      commandData = docs;
      //We push the commands to the arrayofcommands var. The table uses this to build.
      for (const property in commandData) {
        console.log(`${property}: ${commandData[`${property}`].commandName}`);
        var tempArray = [
          `${commandData[`${property}`].commandName}`,
          ` ${commandData[`${property}`].arguements}`,
          ` ${commandData[`${property}`].message}`,
          ` ${commandData[`${property}`].uses}`,
          ` ${commandData[`${property}`].points}`,
          ` ${commandData[`${property}`].rank}`,
          ` ${commandData[`${property}`].special}`,
        ];
        arrayOfCommands.push(tempArray); //Pushes the commands to a variable which we use to build the table
      }
      console.log(arrayOfCommands);

      $(document).ready(function () {
        table = $("#example").DataTable({
          //Create a table with the arrayofcommands varibale.
          data: arrayOfCommands,
          columns: [
            {
              title: "Commands",
            },
            {
              title: "Arguements",
            },
            {
              title: "Data",
            },
            {
              title: "Uses",
            },
            {
              title: "Points",
            },
            {
              title: "Rank",
            },
          ],
        });
      });

      /*   var hasbeenEdited = document.getElementById('example');
            hasbeenEdited.addEventListener('input', function(updateValue) {
        console.log(updateValue)
        console.log('Hey, somebody changed something in my text!');
    });*/

      $("#example").click(function (event) {
        //Tells us which column and row they clicked
        var text = $(event.target).text();
        event.target.id = "one";
        console.log(event);
      });

      tblhasbeenopened = true;
    });
  } else {
    //it has already been ran before. Building from arrayofcommands
    $(document).ready(function () {
      table = $("#example").DataTable({
        data: arrayOfCommands,
        columns: [
          {
            title: "Commands",
          },
          {
            title: "Arguements",
          },
          {
            title: "Data",
          },
          {
            title: "Uses",
          },
          {
            title: "Points",
          },
          {
            title: "Rank",
          },
        ],
      });
    });
  }
} // End of start function

//Adds a command
function checkNewCommand() {
  var isvalid = 0;
  console.log("Checking if command is valid.");
  var commandName, commandData, commandPoints, commandUses, commandRank;

  if ($("#addCommandName").html() == "!") {
    //Ensure it is not JUST a !
    document.getElementById("addCommandName").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML =
      "You need a command Name.";
    console.log("Command Name is not valid.");
  } else if ($("#addCommandName").html().startsWith("!")) {
    //Removes the ! if it exists
    commandName = $("#addCommandName").html().substring(1);
    console.log("Command name is valid");
    for (let i = 0; i < arrayOfCommands.length; i++) {
      if (arrayOfCommands[i][0] == commandName) {
        console.log("The command " + commandName + " already exists");
        setTimeout(() => {
          document.getElementById("addCommandName").classList.add("errorClass");
        }, 1000);
        setTimeout(() => {
          document.getElementById("errorMessageAdd").innerHTML =
            "This command already exists";
        }, 1000);

        isvalid = -1;
      }
    }
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandName").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  } else if ($("#addCommandName").html() == "") {
    //if blank...
    console.log("Not valid name");
    document.getElementById("addCommandName").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML = "Cannot be Blank";
  } else {
    commandName = $("#addCommandName").html();
    console.log("Valid Name is " + commandName);
    for (let i = 0; i < arrayOfCommands.length; i++) {
      if (arrayOfCommands[i][0] == commandName) {
        console.log("The command " + commandName + " already exists");
        document.getElementById("addCommandName").classList.add("errorClass");
        document.getElementById("errorMessageAdd").innerHTML =
          "This command already exists";
        isvalid = -1;
      }
    }
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandName").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (false) {
    //Arguements
    console.log("no argue");
  }

  if ($("#addCommandData").html().length > 254) {
    //max length is 255. - 1 for the 0. may be worng, idk
    console.log("its too long.");
    document.getElementById("addCommandData").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML =
      "This message is too long.";
  } else {
    commandData = $("#addCommandData").html();
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandData").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (isNaN($("#addCommandPoints").html()) == true) {
    console.log("Not a number");
    document.getElementById("addCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML = "Must be a number.";
  } else if (Math.sign(parseFloat($("#addCommandPoints").html())) == -1) {
    console.log("Its a negative");
    document.getElementById("addCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML =
      "Must be greater than 0.";
  } else {
    commandPoints = $("#addCommandPoints").html();
    isvalid = isvalid + 1;
    try {
      document
        .getElementById("addCommandPoints")
        .classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (isNaN($("#addCommandUses").html()) == true) {
    console.log("Not a number");
    document.getElementById("errorMessageAdd").innerHTML = "Must be a number";
    document.getElementById("addCommandUses").classList.add("errorClass");
  } else if (Math.sign(parseFloat($("#addCommandUses").html())) == -1) {
    console.log("Its a negative");
    document.getElementById("errorMessageAdd").innerHTML =
      "Must be greater than 0.";
  } else {
    commandUses = $("#addCommandUses").html();
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandUses").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  commandRank = document.getElementById("rankChoiceAdd").value;
  commandName = commandName.toLowerCase();
  if (isvalid == 4) {
    console.log(
      commandName,
      commandData,
      commandPoints,
      commandUses,
      commandRank
    );
    CommandHandle.addCommand(
      commandName,
      null,
      commandData,
      commandUses,
      commandPoints,
      commandRank,
      null
    ); //Adds a command to the DB
    //adds a row to the table with the new command info
    table.row.add([
      commandName,
      null,
      commandData,
      commandUses,
      commandPoints,
      commandRank,
    ]);
    var newcommand = [
      `${commandName}`,
      null,
      `${commandData}`,
      `${commandUses}`,
      `${commandPoints}`,
      `${commandRank}`,
    ];
    arrayOfCommands.push(newcommand); //Adds it to the array variable.
    table.draw(); //Show changes
    $("#modalCart").modal("hide");
  }
  console.log(isvalid);
  isvalid = 0;
}

//removes commands
function checkRemoveCommand() {
  var commandToBeRemoved = $("#commandRemoveInput").val();
  commandToBeRemoved = commandToBeRemoved.toLowerCase();
  if (commandToBeRemoved.startsWith("!")) {
    commandToBeRemoved = commandToBeRemoved.substring(1);
  }
  var errorNeeded = true;
  try {
    for (let i = 0; i < arrayOfCommands.length; i++) {
      if (arrayOfCommands[i][0] == commandToBeRemoved) {
        console.log(
          "The command " + commandToBeRemoved + " will now be deleted"
        );
        arrayOfCommands.splice(i, 1); //Removes it from the array.
        var filteredData = table
          .rows()
          .indexes()
          .filter(function (value, index) {
            return table.row(value).data()[0] == commandToBeRemoved;
          });
        table.rows(filteredData).remove().draw();
        CommandHandle.removeCommand(commandToBeRemoved);
        errorNeeded = false;
      }
    }
    if (errorNeeded == true) {
      document.getElementById("removeCommandMessage").innerHTML =
        "This command does not exist.";
    }
  } catch (e) {
    console.log(e);
    document.getElementById("removeCommandMessage").innerHTML =
      "This command does not exist.";
  }
}

//edits commands
function checkEditCommand() {
  commandToBeEdited = $("#commandEditInput").val();
  commandToBeEdited = commandToBeEdited.toLowerCase();
  if (commandToBeEdited.startsWith("!")) {
    commandToBeEdited = commandToBeEdited.substring(1);
  }
  var errorNeeded = true;
  //Make sure the command exists.
  try {
    for (let i = 0; i < arrayOfCommands.length; i++) {
      if (arrayOfCommands[i][0] == commandToBeEdited) {
        console.log("Editing " + commandToBeEdited);
        errorNeeded = false;
        //We replace the html of the modal with new html
        document.getElementById("editModal").innerHTML = `<!--Header-->
                <div class="modal-header text-center">
                   <h4 class="modal-title w-100" id="myModalLabel">Edit a command</h4>
                </div>
                <!--Body-->
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
                            <td contenteditable="true" id="editCommandArguements">null</td>
                         </tr>
                         <tr>
                            <td data-toggle="tooltip" data-placement="top" title="Command Message">Command Data</td>
                            <td contenteditable="true" id="editCommandData">Follow me on Glimesh at https://glimesh.tv/Mytho</td>
                         </tr>
                         <tr>
                            <td data-toggle="tooltip" data-placement="top" title="The amount of currency required">Points</td>
                            <td contenteditable="true" id="editCommandPoints">0</td>
                         </tr>
                         <tr>
                            <td data-toggle="tooltip" data-placement="top" title="Sets a counter">Uses</td>
                            <td contenteditable="true" id="editCommandUses">0</td>
                         </tr>
                         <tr>
                            <td data-toggle="tooltip" data-placement="top" title="The minimum rank to use the command">Rank</td>
                            <td id="editCommandRank">
                               <select name="cars" id="rankChoiceEdit">
                                  <option value="Everyone">Everyone (Defualt)</option>
                                  <option value="Moderator">Moderator</option>
                                  <option value="Editor">Editor</option>
                                  <option value="Streamer">Streamer</option>
                               </select>
                            </td>
                         </tr>
                      </tbody>
                   </table>
                </div>
                <!--Footer-->
                <div class="modal-footer">
                   <p id="errorMessageEdit"></p>
                   <button type="button" class="btn btn-outline-primary" onclick="editReset()" data-dismiss="modal">Close</button>
                   <button class="btn btn-outline-primary" onclick="editCommand()" id="editCommandButtonFinish">Edit</button>
                </div>`;
      }
    }
    if (errorNeeded == true) {
      document.getElementById("editCommandMessage").innerHTML =
        "This command does not exist.";
    }
  } catch (e) {
    console.log(e);
    document.getElementById("editCommandMessage").innerHTML =
      "This command does not exist.";
  }
}

function editCommand() {
  var isvalid = 0;
  console.log("Checking if command is valid.");
  var commandData, commandPoints, commandUses, commandRank;
  if (false) {
    //Arguements
    console.log("no argue");
  }

  if ($("#editCommandData").html().length > 254) {
    //max length is 255. - 1 for the 0. may be worng, idk
    console.log("its too long.");
    document.getElementById("editCommandData").classList.add("errorClass");
    document.getElementById("errorMessageEdit").innerHTML =
      "This message is too long.";
  } else {
    commandData = $("#editCommandData").html();
    isvalid = isvalid + 1;
    try {
      document.getElementById("editCommandData").classList.remove("errorClass");
      document.getElementById("errorMessageEdit").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (isNaN($("#editCommandPoints").html()) == true) {
    console.log("Not a number");
    document.getElementById("editCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageEdit").innerHTML = "Must be a number.";
  } else if (Math.sign(parseFloat($("#editCommandPoints").html())) == -1) {
    console.log("Its a negative");
    document.getElementById("editCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageEdit").innerHTML =
      "Must be greater than 0.";
  } else {
    commandPoints = $("#editCommandPoints").html();
    isvalid = isvalid + 1;
    try {
      document
        .getElementById("editCommandPoints")
        .classList.remove("errorClass");
      document.getElementById("errorMessageEdit").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (isNaN($("#editCommandUses").html()) == true) {
    console.log("Not a number");
    document.getElementById("errorMessageEdit").innerHTML = "Must be a number";
    document.getElementById("editCommandUses").classList.add("errorClass");
  } else if (Math.sign(parseFloat($("#editCommandUses").html())) == -1) {
    console.log("Its a negative");
    document.getElementById("errorMessageEdit").innerHTML =
      "Must be greater than 0.";
  } else {
    commandUses = $("#editCommandUses").html();
    isvalid = isvalid + 1;
    try {
      document.getElementById("editCommandUses").classList.remove("errorClass");
      document.getElementById("errorMessageEdit").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  commandRank = document.getElementById("rankChoiceEdit").value;
  commandToBeEdited = commandToBeEdited.toLowerCase();
  if (commandToBeEdited.startsWith("!")) {
    commandToBeEdited = commandToBeEdited.substring(1);
  }
  commandToBeEdited = commandToBeEdited.toLowerCase();
  if (isvalid == 3) {
    console.log(commandData, commandPoints, commandUses, commandRank);

    CommandHandle.editCommand(
      commandToBeEdited,
      null,
      commandData,
      commandUses,
      commandPoints,
      commandRank,
      null
    ); //Edit the DB
    for (let i = 0; i < arrayOfCommands.length; i++) {
      //Find the right command on the table
      if (arrayOfCommands[i][0] == commandToBeEdited) {
        //Found it!
        arrayOfCommands.splice(i, 1); //Removes it from the array.
        var newcommand = [
          `${commandToBeEdited}`,
          null,
          `${commandData}`,
          `${commandUses}`,
          `${commandPoints}`,
          `${commandRank}`,
        ];
        arrayOfCommands.push(newcommand); //Add the command back with new data
        var filteredData = table //A set of functions that removes the command, adds it back, and redraws the table.
          .rows()
          .indexes()
          .filter(function (value, index) {
            return table.row(value).data()[0] == commandToBeEdited;
          });
        table.rows(filteredData).remove();
        table.row.add(newcommand);
        table.draw();
        $("#modalEditCommand").modal("hide");
        document.getElementById("editModal").innerHTML = `
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
                       <p id="errorMessageAdd"></p>
                       <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                       <button class="btn btn-outline-primary" onclick="checkEditCommand()" id="addCommandButtonFinish">Edit</button>
                    </div>`;
      }
    }
  }
  console.log(isvalid);
  isvalid = 0;
}

function editReset() {
  document.getElementById("editModal").innerHTML = `
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
                       <p id="errorMessageAdd"></p>
                       <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                       <button class="btn btn-outline-primary" onclick="checkEditCommand()" id="addCommandButtonFinish">Edit</button>
                    </div>`;
}
