//handles command for electron. This file talks to the commands file in the lib folder. THEY ARE DIFFERENT!
var CommandHandle = require(appData[0] + "/chatbot/lib/commands.js");
CommandHandle.updatePath(appData[1]); 
var arrayOfCommands = []; //An array that stores the commands from the DB so we don't import them every change.
var tblhasbeenopened = false; //Ensures we don't run this function evey time the table is opened.
var table; //The physical table for the UI

var commandToBeEdited; // A global var because I was too lazy to find another solution. Must have for editing.

//Loads the command table. It is loaded when the page is opened for the first time. After that it is saved to a variable.
function loadCommandTable() {
  if (tblhasbeenopened == false) {
    $('#modalCart').on('hidden.bs.modal', function (e) {
      console.log("Resetting command add modal.");
      document.getElementById("commandAddModalBody").innerHTML = addCommandModal();
     })
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
     /* $("#example").click(function (event) {
        //Tells us which column and row they clicked, currently unused
        var text = $(event.target).text();
        event.target.id = "one";
        console.log(event);
      });*/
      tblhasbeenopened = true;
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

  if ($("#addCommandName").text() == "!") {
    //Ensure it is not JUST a !
    document.getElementById("addCommandName").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML ="You need a command Name.";
    console.log("Command Name is not valid.");
  } else if ($("#addCommandName").text().startsWith("!")) {
    //Removes the ! if it exists
    commandName = $("#addCommandName").text().substring(1);
    console.log("Command name is valid");
    for (let i = 0; i < arrayOfCommands.length; i++) {
      if (arrayOfCommands[i][0] == commandName) {
        console.log("The command " + commandName + " already exists");
        setTimeout(() => {
          document.getElementById("addCommandName").classList.add("errorClass");
        }, 1000);
        setTimeout(() => {
          document.getElementById("errorMessageAdd").innerHTML = "This command already exists";
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
        document.getElementById("errorMessageAdd").innerHTML = "This command already exists";
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


  if ($("#addCommandData").text().length > 254) {
    //max length is 255. - 1 for the 0. may be worng, idk
    console.log("Command data is too long.");
    document.getElementById("addCommandData").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML = "This message is too long.";
  } else {
    commandData = strip($("#addCommandData").text())
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandData").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  if (isNaN($("#addCommandPoints").text()) == true) {
    console.log("Not a number");
    document.getElementById("addCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML = "Must be a number.";
  } else if (Math.sign(parseFloat($("#addCommandPoints").text())) == -1) {
    console.log("Its a negative");
    document.getElementById("addCommandPoints").classList.add("errorClass");
    document.getElementById("errorMessageAdd").innerHTML = "Must be greater than 0.";
  } else {
    commandPoints = $("#addCommandPoints").text();
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

  if (isNaN($("#addCommandUses").text()) == true) {
    console.log("Not a number");
    document.getElementById("errorMessageAdd").innerHTML = "Must be a number";
    document.getElementById("addCommandUses").classList.add("errorClass");
  } else if (Math.sign(parseFloat($("#addCommandUses").text())) == -1) {
    console.log("Its a negative");
    document.getElementById("errorMessageAdd").innerHTML = "Must be greater than 0.";
  } else {
    commandUses = $("#addCommandUses").text();
    isvalid = isvalid + 1;
    try {
      document.getElementById("addCommandUses").classList.remove("errorClass");
      document.getElementById("errorMessageAdd").innerHTML = "";
    } catch (error) {
      console.log(error);
    }
  }

  var repeat = document.getElementById("commandRepeatableChoice").value
  if (repeat == "false") {repeat = false} else {repeat = true}

  commandRank = document.getElementById("rankChoiceAdd").value;
  commandName = commandName.toLowerCase(); // All DB data is lower case
  commandName = commandName.trim(); // removes any extra spaces before or after the command.
  if (isvalid == 4) {
    console.log(commandName, commandData, commandPoints, commandUses, commandRank, null, repeat);
    //Adds a command to the DB
    CommandHandle.addCommand(commandName, null, commandData, commandUses, commandPoints, commandRank,null, repeat); 
    //adds a row to the table with the new command info
    addCommandTable(commandName, commandData, commandUses, commandPoints, commandRank)
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
        console.log("The command " + commandToBeRemoved + " will now be deleted");
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
      document.getElementById("removeCommandMessage").innerHTML = "This command does not exist.";
    }
  } catch (e) {
    console.log(e);
    document.getElementById("removeCommandMessage").innerHTML = "This command does not exist.";
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
        document.getElementById("editModal").innerHTML = editCommandModal(arrayOfCommands, i)
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

  if (strip($("#editCommandData").html()).length > 254) {
    //max length is 255. - 1 for the 0. may be worng, idk
    console.log("its too long.");
    document.getElementById("editCommandData").classList.add("errorClass");
    document.getElementById("errorMessageEdit").innerHTML =
      "This message is too long.";
  } else {
    commandData = strip($("#editCommandData").html());
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
    document.getElementById("errorMessageEdit").innerHTML = "Must be greater than 0.";
  } else {
    commandPoints = $("#editCommandPoints").html();
    isvalid = isvalid + 1;
    try {
      document.getElementById("editCommandPoints").classList.remove("errorClass");
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
    document.getElementById("errorMessageEdit").innerHTML = "Must be greater than 0.";
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

  var repeat = document.getElementById("commandRepeatableChoiceEdit").value
  if (repeat == "false") {repeat = false} else {repeat = true}

  if (commandToBeEdited.startsWith("!")) {
    commandToBeEdited = commandToBeEdited.substring(1);
  }
  commandToBeEdited = commandToBeEdited.toLowerCase();
  if (isvalid == 3) {
    console.log(commandData, commandPoints, commandUses, commandRank);
    CommandHandle.editCommand(commandToBeEdited, null, commandData, commandUses, commandPoints, commandRank, null, repeat); //Edit the DB
    for (let i = 0; i < arrayOfCommands.length; i++) {
      //Find the right command on the table
      if (arrayOfCommands[i][0] == commandToBeEdited) {
        //Found it!
        arrayOfCommands.splice(i, 1); //Removes it from the array.
        var newcommand = [`${commandToBeEdited}`, null, `${commandData}`, `${commandUses}`, `${commandPoints}`, `${commandRank}`];
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
        document.getElementById("editModal").innerHTML = editCommandModalEntry()
      }
    }
  }
  console.log(isvalid);
  isvalid = 0;
}

function editReset() {
  document.getElementById("editModal").innerHTML = editCommandReset()
}

// Adds a command to the table. 
function addCommandTable(commandName, commandData, commandUses, commandPoints, commandRank) {
  table.row.add([commandName, "null", commandData, commandUses, commandPoints, commandRank]);
  var newcommand = [`${commandName}`, null, `${commandData}`, Number(`${commandUses}`), Number(`${commandPoints}`), `${commandRank}`];
  arrayOfCommands.push(newcommand); //Adds it to the array variable.
  table.draw(); //Show changes
}

/**
 * Removes any HTML/CSS that is invisible to the user.
 * @param {string} html All the command data
 */
function strip(html){
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}