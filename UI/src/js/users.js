var UserHandle = require(appData[0] + "/chatbot/lib/users.js");
UserHandle.updatePath(appData[1]);

var QuoteHandle = require(appData[0] + "/chatbot/lib/quotes.js");
QuoteHandle.updatePath(appData[1]);

var RankHandle = require(appData[0] + "/chatbot/lib/users/userRank.js");
RankHandle.updatePath(appData[1]);

var userTable; //physical table showing user data
var tempUser;

function loadUsers() { //Runs at startup (on page load (on page click (only the first time )))
  	$(document).ready(function () {
    	loadUserTable();
    	prepUserModals()
    	//makes clicking the button in the quotes column show the quotes under the table
    	$('#userTable tbody').on('click', 'button', function () {
      		var data = userTable.row($(this).parents('tr')).data();
      		UserHandle.findByUserName(data.userName).then(user => {
        		console.log('Building quote list with ' + user.userName)
        		makeList(data) //Builds the list of the users quotes.
      		})
    	});
    	$('#userTable tbody').on('click', 'a', function () {
      		var data = userTable.row($(this).parents('tr')).data();
      		loadLink("glimesh.tv/" + data.userName)
    	});
  	});
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
    	document.getElementsByClassName('userList')[0].innerHTML = "";

    	if (allQuotes.length === 0) {
      		document.getElementsByClassName('userList')[0].innerHTML = "No Quotes found";
      		return;
    	}
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



function addQuote() { //Adds a quote to the db and table
  	var quoteName = document.getElementById("userQuoteInputU").value.trim().toLowerCase(); //All db values are lower case
  	var quoteData = document.getElementById("userQuoteInputQ").value.trim().toLowerCase(); //^^
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
        		</div>`;

    		document.getElementById('quoteRemoveSearch').focus();
    		document.getElementsByClassName('removeQuoteList')[0].innerHTML = "";
    		let listContainer = document.createElement('div'),
    		listElement = document.createElement('ul'),
    		// Set up a loop that goes through the items in listItems one at a time
    		numberOfListItems = data.quotes.length,
    		listItem,
    		i;
    		if (numberOfListItems == 0) {
        		document.getElementsByClassName('removeQuoteList')[0].innerHTML = "That user does not have any quotes to delete!"
    		} else {
    			// Add it to the page
    			document.getElementsByClassName('removeQuoteList')[0].appendChild(listContainer);
    			listContainer.appendChild(listElement);

    			for (i = 0; i < numberOfListItems; ++i) {
        			// create an item for each one
        			listItem = document.createElement('li');

        			// Add the item text
        			listItem.innerHTML = `${data.quotes[i].quoteID}: ${data.quotes[i].quoteData}`;

        			// Add listItem to the listElement
        			listElement.appendChild(listItem);
    			}
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
      		loadAllQuotes();
      		quoteSearch(user);
    	}
  	})
}

function addUser() { //Adds a user
  	var user = document.getElementById("userAddInput").value.trim().toLowerCase(); //must be lower case
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
      		addUserTable(data)
      		setTimeout(() => { //Resets the message
        		document.getElementById("addUserMessageSuccess").innerHTML = "";
      		}, 4000);
    	}
  	})
}

function removeUser() { //removes the user
  	var user = document.getElementById("userremoveInput").value.trim().toLowerCase();
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
        		removeUserFromTable(deletedUser)
        		setTimeout(() => {
          			document.getElementById("removeUserMessage").innerHTML = ""
        		}, 4000);
      		})
    	}
  	})
}

// Removes the user from a table. This only affects the table
function removeUserFromTable(deletedUser) {
    console.log("The user " + deletedUser + " will now be deleted from the table.");
    try {
        var filteredData = userTable
        .rows()
        .indexes()
        .filter(function (value, index) {
            return userTable.row(value).data().userName == deletedUser;
        });
        userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
    } catch (e) {

    }
}

function makeList(user) { //Similir to above function, makes a list and displays it under the table.
  	document.getElementsByClassName('userList')[0].innerHTML = ""
  	// Make a container element for the list
  	let listContainer = document.createElement('div'),
  	// Make the list
  	listElement = document.createElement('ul'),
  	// Set up a loop that goes through the items in listItems one at a time
  	numberOfListItems = user.quotes.length,
  	listItem,
  	i;

  	// Add it to the page
  	document.getElementsByClassName('userList')[0].appendChild(listContainer);
  	listContainer.appendChild(listElement);

  	for (i = 0; i < numberOfListItems; ++i) {
      	// create an item for each one
      	listItem = document.createElement('li');

      	// Add the item text
      	listItem.innerHTML = `ID: ${user.quotes[i].quoteID} | ${user.quotes[i].quoteData}`

      	// Add listItem to the listElement
      	listElement.appendChild(listItem);
  	}
}

//This is the points section.
var pointsTable;
function getPoints() {
  	var arrayOfPoints = []
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
      		if (pointsTable.rows[i + 1] === undefined) {
        		continue;
      		}

      		pointsTable.rows[i + 1].cells[0].innerHTML = i;
      		if (arrayOfPoints[i] !== undefined) {
        		pointsTable.rows[i + 1].cells[1].innerHTML = arrayOfPoints[i][0];
        		pointsTable.rows[i + 1].cells[2].innerHTML = arrayOfPoints[i][1];
        		pointsTable.rows[i + 1].cells[3].innerHTML = arrayOfPoints[i][2];
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
      		document.getElementById("modalEditBody").innerHTML = setModalEditBody(data, RankHandle.getCurrentRanks());
      		// Prevents non numbers from being entered.
      		$("#editUserPoints").keypress(function (e) {
        		if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
      		});
      		var q = setModalEditButtons();
      		document.getElementById("userEditSearchButton").setAttribute('onclick', q);
      		document.getElementById("userEditSearchButton").innerText = "Edit";
    	}
  	})
}

function editUserTable(user, role, points) {
  	try {
    	points = Number(points);
    	console.log(user, role, points);
    	user = user.toLowerCase()
    	// searches the table for the name of the user
    	var indexes = userTable
      	.rows()
      	.indexes()
      	.filter(function (value, index) {
	    	return user === userTable.row(value).data().userName;
      	});
    	console.log(indexes)
    	// Get the row for indexes
    	var row = userTable.row(indexes[0]);

    	// Get the data for the row
    	var data = row.data();
    	// Change the row data
    	data.points = points;
    	data.role = role;

    	// Update the table data and redraw the table
    	row.data(data).draw();
    	// loadUserTable()
  	} catch (e) {
    	console.log(e)
  	}
}

function editUserWatchTime(user, watchTime) {
    try {
      	watchTime = Number(watchTime);
      	user = user.toLowerCase()
      	var indexes = userTable
        .rows()
        .indexes()
        .filter(function (value, index) {
          	return user === userTable.row(value).data().userName;
        });
      	var row = userTable.row(indexes[0]);
      	var data = row.data();
      	data.watchTime = watchTime;
      	row.data(data).draw();
    } catch (e) {
      	console.log(e)
    }
}

function loadUserTable() {
  	userTable = $("#userTable").DataTable({
    	data: UserHandle.getCurrentUsers(),
    	columns: [
      		{
        		title: "User",
        		data: "userName"
    	  	},
	      	{
        		title: "Points",
        		data: "points"
    	  	},
	      	{
        		title: "Watch Time",
        		data: "watchTime"
    	  	},
	      	{
	        	title: "Team",
    		    data: "team"
    	  	},
	      	{
        		title: "Role",
    	    	data: "role"
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
            	if (type === 'display'){
                	data = '<a href="javascript:void(0)" disabled>' + "View Profile" + '</a>';
            	}
            	return data;
         	}
  		}]
  	});
}

//adds it to the table
function addUserTable(data) {
  	userTable.row.add({
    	userName: data.userName,
    	points: data.points,
    	watchTime: data.watchTime,
    	team: data.team,
    	role: data.role,
    	link: data.picture,
    	quotes: data.quotes
  	})
  	userTable.draw() //redraws the table to see our changes
}

/**
 * Prepares the modals for resetting thier info on close.
 */
function prepUserModals() {
  	$('#modalUserEdit').on('hidden.bs.modal', function (e) {
    	console.log("Resetting user edit modal.");
    	document.getElementById("editUserModal").innerHTML = editUserReset()
  	})
  	$('#modalUserAdd').on('hidden.bs.modal', function (e) {
    	console.log("Resetting user removal modal.");
    	document.getElementById("adduserModal").innerHTML = addUserReset()
  	})
  	$('#modalUserRemove').on('hidden.bs.modal', function (e) {
    	console.log("Resetting user removal modal.");
    	document.getElementById("removeuserModal").innerHTML = removeUserReset()
  	})
  	$('#modalQuoteRemove').on('hidden.bs.modal', function (e) {
    	console.log("Resetting quote removal modal.");
    	document.getElementById("removeQuoteModal").innerHTML = removeQuoteReset()
  	});
  	$('#modalQuoteAdd').on('hidden.bs.modal', function (e) {
    	console.log("Resetting add quote modal.");
    	document.getElementById("addQuoteModal").innerHTML = addQuoteReset()
  	})
}
