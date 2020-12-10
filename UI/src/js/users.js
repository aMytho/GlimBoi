var UserHandle = require(app.getAppPath() + "/chatbot/lib/users.js"); //Module for Users
var QuoteHandle = require(app.getAppPath() + "/chatbot/lib/quotes.js"); //Module for quotes

var arrayofUsers = []; //Holds users after we leave the page.
var arrayofQuotes = [] //Unused?
var userTable; //physical table showing user data
var usersActive = false; //ensures we only run the start function once. Saves us time querying the DB
UserHandle.updatePath(app.getPath("userData")); //Updates the filepath to the DB. Tells the moduelw eare in electron not server mode.
QuoteHandle.updatePath(app.getPath("userData")); //^^

function loadUsers() { //Runs at startup (on page load (on page click (only the first time )))
  if(usersActive == false) {
    console.log("Loading users.");
    var x = UserHandle.getAll() //gets all users
    x.then(function(data) { //then...
        for (const property in data) {
            var tempArray = [
              `${data[`${property}`].userName}`,
              `${data[`${property}`].points}`,
              `${data[`${property}`].watchTime}`,
              `${data[`${property}`].team}`,
              `${data[`${property}`].role}`,
              `${data[`${property}`].picture}`,
              data[`${property}`].quotes,
            ];
            arrayofUsers.push(tempArray); //Pushes the commands to a variable which we use to build the table
          }
          console.log(arrayofUsers)
          $(document).ready(function () {
            userTable = $("#userTable").DataTable({
              //Create a table with the arrayofcommands varibale.
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
            } ]
            });
            //makes clicking the button in the quotes column show the quotes under the table
            $('#userTable tbody').on( 'click', 'button', function () { 
              var data = userTable.row( $(this).parents('tr') ).data();
              //alert( data[0] +"'s salary is: "+ data[ 5 ] ); Keep this as an example
              console.log('Build table with ' + data)
              makeList(data) //Builds the list of the users quotes.
            } );
          });
          usersActive = true; //ensures we don't run this again.
    })
  } else {

    $(document).ready(function () {
      userTable = $("#userTable").DataTable({
        //Create a table with the arrayofcommands varibale.
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
            title: "Link"
          },
          {
            title: "Quotes",
          },
        ],
        "columnDefs": [ {
          "targets": -1,
          "data": null,
          "defaultContent": "<button>Open</button>"
      } ]
      });
      //Same as above
      $('#userTable tbody').on( 'click', 'button', function () {
        var data = userTable.row( $(this).parents('tr') ).data();
        console.log('Building table with ' + data)
        makeList(data)
      } );
    });

  }
}

function loadAllQuotes() { //loads all quotes and displays them under the table. 
  console.log("Loading Quotes.");
  var quotes = QuoteHandle.getAll(); //Gets all thq quotes
  var allQuotes = [];
  quotes.then(function(data) {
    console.log("Quote query complete.");
    for (const property in data) { //For every quote we make a temp array and push tis array to allQuotes. It is wiped when the function ends.
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



//Unused ?
function viewQuoteModal(user) {
  console.log("Showing " + user + "s quotes");
};

function addQuote() { //Adds a quote to the db,table, and arrayofUsers variable.
  var quoteName = document.getElementById("userQuoteInputU").value.toLowerCase(); //All db values are lower case
  var quoteData = document.getElementById("userQuoteInputQ").value.toLowerCase(); //^^
  QuoteHandle.addquote(quoteName, quoteData);
  //Although the quotes db reads this quote the user db will not. (GUI ONLY). To fix this we add the quote to the data table since the user db reads from that after initial launch.
  //To clarify, the db is read when getall() of some sort is called and on app startup, not on every category click. Then it is data tables.
  for (let i = 0; i < arrayofUsers.length; i++) { //Checks every user till the quotename matches the user name. Then adds it to the user and table. It is already on the db. QuoteHandle.addquote(name,data)
    if (arrayofUsers[i][0] == quoteName) {
      console.log(
        "The quote " + quoteName + " is being added to the table."
      );
      arrayofUsers[i][6].push({quoteName: quoteName, quoteData, quoteData}) //Adds the quote to the user var.
      var filteredData = userTable
        .rows()
        .indexes()
        .filter(function (value, index) {
          return userTable.row(value).data()[0] == quoteName;
        }); //Finds the orrect row with our user.
      userTable.rows(filteredData).data([`${arrayofUsers[`${i}`].userName}`,
      `${arrayofUsers[`${i}`].points}`,
      `${arrayofUsers[`${i}`].watchTime}`,
      `${arrayofUsers[`${i}`].team}`,
      `${arrayofUsers[`${i}`].role}`,
      `${arrayofUsers[`${i}`].picture}`,
      arrayofUsers[`${i}`].quotes,]) //Adds the quote to the table. 
    }
  }
}

function addUser() { //Adds a user
  var user = document.getElementById("userAddInput").value.toLowerCase(); //must be lower case
  console.log(user);
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
    } else { //SUCCESS WOOOOOOOOOOOOOOOOOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
      document.getElementById("addUserMessageSuccess").innerHTML = "Success! User has been created!";
      //adds it to the table
      userTable.row.add([
        data.userName,
        data.points,
        data.watchTime,
        data.team,
        data.role,
        data.picture,
        data.quotes
      ])
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
      userTable.draw() //redraws the table to see our changes
      setTimeout(() => { //Resets the message
        document.getElementById("addUserMessageSuccess").innerHTML = "";
      }, 4000);
    }
  })
}

function removeUser() { //remoes the user
  var user = document.getElementById("userremoveInput").value.toLowerCase();
  //check if the user exists.
  var exists = UserHandle.findByUserName(user);
  exists.then(data => {
    if (data == "ADDUSER") {
      document.getElementById("removeUserMessage").innerHTML = "User not found. Pleae enter the correct name."
      setTimeout(() => {
        document.getElementById("removeUserMessage").innerHTML = ""
      }, 4000);
    } else  {
       UserHandle.removeUser(user).then(deletedUser => { //removes the user from the db. Shows us afterwords
         document.getElementById("removeUserMessage").innerHTML = "User Removed.";
         for (let i = 0; i < arrayofUsers.length; i++) {
          if (arrayofUsers[i][0] == deletedUser) {
            console.log(
              "The user " + deletedUser + " will now be deleted"
            );
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
      listItem.innerHTML = user[6][i].quoteData;

      // Add listItem to the listElement
      listElement.appendChild(listItem);
  }
}

//This is the points section. 
var arrayOfPoints = [];
var maxPoints = [];
var pointsTable;
function getPoints() {
    document.getElementById("StartingPoints").innerHTML = settings.Points.StartingAmount;
    document.getElementById("EarningPoints").innerHTML = settings.Points.accumalation;
    alreadyLoaded = true;
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
    console.log(pointsTable.rows.length);
    var skipOne = true;
    for (let i = 0; i < pointsTable.rows.length; i++) { //For every row
          pointsTable.rows[i+1].cells[0].innerHTML = i
          if (arrayOfPoints[i] == undefined) {} else {
          pointsTable.rows[i+1].cells[1].innerHTML = arrayOfPoints[i][0]
          pointsTable.rows[i+1].cells[2].innerHTML = arrayOfPoints[i][1]
          pointsTable.rows[i+1].cells[3].innerHTML = arrayOfPoints[i][2]
          }
        
      
    }
  })
}