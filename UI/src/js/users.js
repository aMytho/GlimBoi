var UserHandle = require(appData[0] + "/chatbot/lib/users.js"); 
UserHandle.updatePath(appData[1]);

var QuoteHandle = require(appData[0] + "/chatbot/lib/quotes.js"); 
QuoteHandle.updatePath(appData[1]); 

var arrayofUsers = []; //Holds users after we leave the page.
var userTable; //physical table showing user data
var usersActive = false; //ensures we only run the start function once. Saves us time querying the DB
var tempUser;

function loadUsers() { //Runs at startup (on page load (on page click (only the first time )))
  $('#modalUserEdit').on('hidden.bs.modal', function (e) {
    console.log("Resetting user edit modal.");
    document.getElementById("modalEditBody").innerHTML = `<div class="modal-body" id="modalEditBody">
    <div class="icon-input-container">
       <input class="icon-input" type="text" placeholder="Username" id="userEditSearch">
       <p id="editUserMessage" class="errorMessage"></p>
   </div>
   </div>`;
    document.getElementById("userEditSearchButton").innerText = "Search";
    document.getElementById("userEditSearchButton").setAttribute('onclick', "userSearch(document.getElementById('userEditSearch').value)")
  })
  $('#modalQuoteRemove').on('hidden.bs.modal', function (e) {
    console.log("Resetting quote removal modal.");
    document.getElementById("modalRemoveQuote").innerHTML = `<div class="modal-body" id="modalRemoveQuote">
    <div class="icon-input-container">
            <input class="icon-input" type="text" placeholder="Username" id="userQuoteSearch">
            <p id="editQuoteError" class="errorMessage"></p>
        </div>
   </div>`;
    document.getElementById("userRemoveQuoteSearch").innerText = "Search";
    document.getElementById("userRemoveQuoteSearch").setAttribute('onclick', "quoteSearch(document.getElementById('userQuoteSearch').value)")
  })
  if (usersActive == false) {
    console.log(arrayofUsers)
    $(document).ready(function () {
      loadUserTable()
      //makes clicking the button in the quotes column show the quotes under the table
      $('#userTable tbody').on('click', 'button', function () {
        var data = userTable.row($(this).parents('tr')).data();
        //alert( data[0] +"'s salary is: "+ data[ 5 ] ); Keep this as an example
        console.log('Build table with ' + data)
        makeList(data) //Builds the list of the users quotes.
      });
      $('#userTable tbody').on('click', 'a', function () {
        var data = userTable.row($(this).parents('tr')).data();
        loadLink("glimesh.tv/" + data[0])
      });
    });
    usersActive = true; //ensures we don't run this again.
  } else {
    $(document).ready(function () {
      loadUserTable()
      //Same as above
      $('#userTable tbody').on('click', 'button', function () {
        var data = userTable.row($(this).parents('tr')).data();
        console.log('Building table with ' + data)
        makeList(data)
      });
      $('#userTable tbody').on('click', 'a', function () {
        var data = userTable.row($(this).parents('tr')).data();
        loadLink("glimesh.tv/" + data[0])
      });
    });
  }
}

function loadAllQuotes() { //loads all quotes and displays them under the table. 
  console.log("Loading Quotes.");
  var quotes = QuoteHandle.getAll(); //Gets all thq quotes
  var allQuotes = [];
  quotes.then(function (data) {
    console.log("Quote query complete.");
    for (const property in data) { //For every quote we make a temp array and push its array to allQuotes. It is wiped when the function ends.
      var tempArray = [
        data[`${property}`].quoteName,
        data[`${property}`].quoteData,
      ];
      allQuotes.push(tempArray); //Pushes the commands to a variable which we use to build the table
    }
    //This section shows the quotes in a list under the table.
    document.getElementsByClassName('userList')[0].innerHTML = ""
    let listContainer = document.createElement('div'),
      listElement = document.createElement('ul'),
      // Set up a loop that goes through the items in listItems one at a time
      numberOfListItems = allQuotes.length,
      listItem,
      i;

    // Add it to the page
    document.getElementsByClassName('userList')[0].appendChild(listContainer);
    listContainer.appendChild(listElement);

    for (i = 0; i < numberOfListItems; ++i) {
      // create an item for each one
      listItem = document.createElement('li');

      // Add the item text
      listItem.innerHTML = `${allQuotes[i][0]}: ${allQuotes[i][1]}`;

      // Add listItem to the listElement
      listElement.appendChild(listItem);
    }
  })
}



function addQuote() { //Adds a quote to the db, table, and arrayofUsers variable.
  var quoteName = document.getElementById("userQuoteInputU").value.toLowerCase(); //All db values are lower case
  var quoteData = document.getElementById("userQuoteInputQ").value.toLowerCase(); //^^
  QuoteHandle.addquote(quoteName, quoteData);
}

function quoteSearch(user) {
  UserHandle.findByUserName(user.toLowerCase()).then(data => {
    console.log(data);
    if (data == "ADDUSER") {
      document.getElementById('editQuoteError').innerHTML = "No user was found with that name."
    } else {
     var tempButtonUser = document.getElementById('userRemoveQuoteSearch')
     tempButtonUser.innerText = 'Remove';
     tempButtonUser.setAttribute('onclick', `removeQuote(document.getElementById('quoteRemoveSearch').value, '${user}')`)
      document.getElementById("modalRemoveQuote").innerHTML = `
      <div class="removeQuoteList"></div>
      <div class="icon-input-container">
       <input class="icon-input" type="text" placeholder="Quote ID" id="quoteRemoveSearch">
       <p id="editUserMessage" class="errorMessage"></p>
   </div>
      `
    document.getElementsByClassName('removeQuoteList')[0].innerHTML = ""
    let listContainer = document.createElement('div'),
    listElement = document.createElement('ul'),
    // Set up a loop that goes through the items in listItems one at a time
    numberOfListItems = data[0].quotes.length,
    listItem,
    i;
  
    // Add it to the page
    document.getElementsByClassName('removeQuoteList')[0].appendChild(listContainer);
    listContainer.appendChild(listElement);
  
    for (i = 0; i < numberOfListItems; ++i) {
        // create an item for each one
        listItem = document.createElement('li');
  
        // Add the item text
        listItem.innerHTML = `${data[0].quotes[i].quoteID}: ${data[0].quotes[i].quoteData}`;
  
        // Add listItem to the listElement
        listElement.appendChild(listItem);
    }
    }
  })
}

function removeQuote(id, user) {
  UserHandle.removeQuoteByID(Number(id), user.toLowerCase()).then(data => {
    if (data == "NOQUOTEFOUND") {
      console.log("No quote was found with that ID.");
      document.getElementById("errorQuoteExit").innerText = "No quote was found with that ID."
      setTimeout(() => {
        document.getElementById("errorQuoteExit").innerText = ""
      }, 3500);
    } else {
      console.log("Quote was removed");
      document.getElementById("errorQuoteExit").innerText = "Quote removed."
      setTimeout(() => {
        document.getElementById("errorQuoteExit").innerText = ""
      }, 3500);
    }
  })
  
}

function addUser() { //Adds a user
  var user = document.getElementById("userAddInput").value.toLowerCase(); //must be lower case
  var newUser = UserHandle.addUser(user); //adds it to the DB. 
  newUser.then(data => { //Displays it on our side.
    if (data == "USEREXISTS") { //Tells the user that user exists.
      document.getElementById("addUserMessage").innerHTML = "That user already exists."
      setTimeout(() => {
        try {
        document.getElementById("addUserMessage").innerHTML = ""
        } catch(e) {
          console.log(e)
        }
      }, 4000);
    } else if (data == "INVALIDUSER") {
      console.log("The user cannot be created because the user doesn't exist on glimesh.");
      document.getElementById("addUserMessage").innerHTML = "The user does not exist on Glimesh. Ensure the username is correct."
    } else { //SUCCESS WOOOOOOOOOOOOOOOOOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
      document.getElementById("addUserMessageSuccess").innerHTML = "Success! User has been created!";
      //adds it to the user var.
      var arrayUser = [
        data.userName,
        data.points,
        data.watchTime,
        data.team,
        data.role,
        data.picture,
        data.quotes,
      ];
      arrayofUsers.push(arrayUser); //^
      addUserTable(data)
      setTimeout(() => { //Resets the message
        document.getElementById("addUserMessageSuccess").innerHTML = "";
      }, 4000);
    }
  })
}

function removeUser() { //removes the user
  var user = document.getElementById("userremoveInput").value.toLowerCase();
  //check if the user exists.
  var exists = UserHandle.findByUserName(user);
  exists.then(data => {
    if (data == "ADDUSER") {
      document.getElementById("removeUserMessage").innerHTML = "User not found. Pleae enter the correct name."
      setTimeout(() => {
        document.getElementById("removeUserMessage").innerHTML = ""
      }, 4000);
    } else {
       UserHandle.removeUser(user).then(deletedUser => { //removes the user from the db. Shows us afterwords
         document.getElementById("removeUserMessage").innerHTML = "User Removed.";
         for (let i = 0; i < arrayofUsers.length; i++) {
          if (arrayofUsers[i][0] == deletedUser) {
            console.log("The user " + deletedUser + " will now be deleted");
            arrayofUsers.splice(i, 1); //Removes it from the array.
            var filteredData = userTable
              .rows()
              .indexes()
              .filter(function (value, index) {
                return userTable.row(value).data()[0] == deletedUser;
              });
            userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
          }
        }
      setTimeout(() => {
        document.getElementById("removeUserMessage").innerHTML = ""
      }, 4000);
       })
    }
  })
}

// Removes the user from a table. This only affects the table and arrayofusers variable.
function removeUserFromTable(deletedUser) {
  for (let i = 0; i < arrayofUsers.length; i++) {
    if (arrayofUsers[i][0] == deletedUser) {
      console.log("The user " + deletedUser + " will now be deleted");
      arrayofUsers.splice(i, 1); //Removes it from the array.
      var filteredData = userTable
        .rows()
        .indexes()
        .filter(function (value, index) {
          return userTable.row(value).data()[0] == deletedUser;
        });
      userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
    }
  }
}

function makeList(user) { //Similir to above function, makes a list and displays it under the table.
  document.getElementsByClassName('userList')[0].innerHTML = ""
  console.log(user)
  // Make a container element for the list
  let listContainer = document.createElement('div'),
  // Make the list
  listElement = document.createElement('ul'),
  // Set up a loop that goes through the items in listItems one at a time
  numberOfListItems = user[6].length,
  listItem,
  i;

  // Add it to the page
  document.getElementsByClassName('userList')[0].appendChild(listContainer);
  listContainer.appendChild(listElement);

  for (i = 0; i < numberOfListItems; ++i) {
      // create an item for each one
      listItem = document.createElement('li');

      // Add the item text
      listItem.innerHTML = `ID: ${user[6][i].quoteID} | ${user[6][i].quoteData}`

      // Add listItem to the listElement
      listElement.appendChild(listItem);
  }
}

//This is the points section. 
var arrayOfPoints = [];
var pointsTable;
function getPoints() {
  arrayOfPoints = []
  document.getElementById("StartingPoints").innerHTML = settings.Points.StartingAmount;
  document.getElementById("EarningPoints").innerHTML = settings.Points.accumalation;
  document.getElementById("pointName").innerHTML = settings.Points.name
  var points = UserHandle.getTopPoints().then(data => {
    console.log(data);
    pointsTable = document.getElementById("pointsTable");
    for (const property in data) {
      var pointValue = [
        `${data[`${property}`].userName}`,
        `${data[`${property}`].points}`,
        `${data[`${property}`].team}`
      ];
      arrayOfPoints.push(pointValue)
    }
    console.log(pointsTable.rows.length + " rows in the table");
    for (let i = 0; i < pointsTable.rows.length; i++) { //For every row
      pointsTable.rows[i + 1].cells[0].innerHTML = i
      if (arrayOfPoints[i] == undefined) { } else {
        pointsTable.rows[i + 1].cells[1].innerHTML = arrayOfPoints[i][0]
        pointsTable.rows[i + 1].cells[2].innerHTML = arrayOfPoints[i][1]
        pointsTable.rows[i + 1].cells[3].innerHTML = arrayOfPoints[i][2]
      }
    }
  })
}

function userSearch(user) {
  tempUser = user
  UserHandle.findByUserName(user.toLowerCase()).then(data => {
    if (data == "ADDUSER") {
      document.getElementById("editUserMessage").innerText = "No user was found with that name.";
      setTimeout(() => {
        document.getElementById("editUserMessage").innerText = "";
      }, 3500);
    } else {
      console.log("Editing user");
      document.getElementById("modalEditBody").innerHTML = `
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
                            <td contenteditable="false" id="EditUserRank">${data[0].role}</td>
                         </tr>
                         <tr>
                            <td data-toggle="tooltip" data-placement="top" title="The amount of points the user has">Points</td>
                            <td contenteditable="true" id="editUserPoints">${data[0].points}</td>
                         </tr>
                         <tr>
                      </tbody>
                   </table>
      `;
      document.getElementById("userEditSearchButton").setAttribute('onclick', "editUserTable(tempUser, document.getElementById('EditUserRank').innerHTML, document.getElementById('editUserPoints').innerHTML), $('#modalUserEdit').modal('hide'), UserHandle.editUser(tempUser.toLowerCase(), document.getElementById('EditUserRank').innerHTML, document.getElementById('editUserPoints').innerHTML)")
      document.getElementById("userEditSearchButton").innerText = "Edit"

    }
  })
}

function editUserTable(user, role, points) {
  try {
  points = Number(points);
  console.log(user, role, points);
  user = user.toLowerCase()
    for (let index = 0; index < arrayofUsers.length; index++) {
      if (arrayofUsers[index][0] == user) {
        arrayofUsers[index][1] = points;
        arrayofUsers[index][4] = role;
        break;
      }
    }
    // searches the table for the name of the user
    var indexes = userTable
    .rows()
    .indexes()
    .filter( function ( value, index ) {
      return user === userTable.row(value).data()[0];
    } );

  // Get the row for indexes
  var row = userTable.row(indexes[0]);
  
  // Get the data for the row
  var data = row.data();

  // Change the row data
  data[1] = points;
  data[4] = role;
  
  // Update the table data and redraw the table
  row.data( data ).draw();
  // loadUserTable()
} catch(e) {
  console.log(e)
}
}

function loadUserTable() {
  userTable = $("#userTable").DataTable({
    //Create a table with the arrayofusers varibale.
    data: arrayofUsers,
    columns: [
      {
        title: "User",
      },
      {
        title: "Points",
      },
      {
        title: "Watch Time",
      },
      {
        title: "Team",
      },
      {
        title: "Role",
      },
      {
        title: "Link",
      },
      {
        title: "Quotes",
      },
    ],
    "columnDefs": [ {
      "targets": -1,
      "data": null,
      "defaultContent": "<button>Open</button>"
  }, {
    "targets": -2,
      "data": null,
      "render": function(data, type, row, meta){
            if(type === 'display'){
                data = '<a href="javascript:void(0)" disabled>' + "View Profile" + '</a>';
            }

            return data;
         }
  } ]
  });
}

//adds it to the table
function addUserTable(data) {
  userTable.row.add([
    data.userName,
    data.points,
    data.watchTime,
    data.team,
    data.role,
    data.picture,
    data.quotes
  ])
  userTable.draw() //redraws the table to see our changes
}