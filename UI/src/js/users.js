var UserHandle = require(app.getAppPath() + "/chatbot/lib/users.js");
var QuoteHandle = require(app.getAppPath() + "/chatbot/lib/quotes.js");

var arrayofUsers = [];
var arrayofQuotes = []
var userTable;
var usersActive = false;

function loadUsers() {
  if(usersActive == false) {
    console.log("Loading users.");
    UserHandle.updatePath(app.getAppPath());
    var x = UserHandle.getAllUsers()
    x.then(function(data) {
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
            $('#userTable tbody').on( 'click', 'button', function () {
              var data = userTable.row( $(this).parents('tr') ).data();
              //alert( data[0] +"'s salary is: "+ data[ 5 ] );
              console.log('doing it' + data)
              makeList(data)
            } );
          });
          usersActive = true;
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
            title: "Quotes",
          },
        ],
        "columnDefs": [ {
          "targets": -1,
          "data": null,
          "defaultContent": "<button>Open</button>"
      } ]
      });
      $('#userTable tbody').on( 'click', 'button', function () {
        var data = userTable.row( $(this).parents('tr') ).data();
        //alert( data[0] +"'s salary is: "+ data[ 5 ] );
        console.log('doing it' + data)
        makeList(data)
      } );
    });

  }
}

function loadAllQuotes() {
  console.log("Loading Quotes.");
  QuoteHandle.updatePath(app.getAppPath());
  var quotes = QuoteHandle.getAll();
  quotes.then(function(data) {
    console.log("Quote query complete.");
    for (const property in data) {
      var tempArray = [
        `${data[`${property}`].userName}`,
        ` ${data[`${property}`].points}`,
        ` ${data[`${property}`].watchTime}`,
        ` ${data[`${property}`].team}`,
        ` ${data[`${property}`].role}`,
        ` ${data[`${property}`].picture}`,
        ` ${data[`${property}`].quotes}`,
      ];
      arrayofUsers.push(tempArray); //Pushes the commands to a variable which we use to build the table
    }
  })
}




function viewQuoteModal(user) {
  console.log("Showing " + user + "s quotes");

}

function makeList(user) {
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

// Usage
//makeList(user);