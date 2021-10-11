UserHandle.updatePath(appData[1]);
QuoteHandle.updatePath(appData[1]);
RankHandle.updatePath(appData[1]);

let userTable; //physical table showing user data

function loadUsers() {
    loadUserTable();
    prepUserModals()
}

function loadAllQuotes() { //loads all quotes and displays them under the table.
  	console.log("Loading Quotes.");
  	let quotes = QuoteHandle.getAll(); //Gets all thq quotes
  	let allQuotes = [];
  	quotes.then(function (data) {
    	console.log("Quote query complete.");
    	for (const property in data) { //For every quote we make a temp array and push its array to allQuotes. It is wiped when the function ends.
      		let tempArray = [
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
        if (numberOfListItems == 0) {
            listElement.innerHTML = "No quotes were found.";
        }
        window.scrollTo(0, document.body.scrollHeight)
  	})
}



function addQuote() { //Adds a quote to the db and table
  	let quoteName = (document.getElementById("userQuoteInputU") as HTMLInputElement).value.trim().toLowerCase();
  	let quoteData = (document.getElementById("userQuoteInputQ") as HTMLInputElement).value.trim().toLowerCase();
  	QuoteHandle.addquote(quoteName, quoteData);
}

function quoteSearch(user:userName) {
  	UserHandle.findByUserName(user.toLowerCase()).then(data => {
    	console.log(data);
    	if (data == "ADDUSER") {
      		document.getElementById('editQuoteError')!.innerHTML = "No user was found with that name."
    	} else {
      		let tempButtonUser = document.getElementById('userRemoveQuoteSearch')!;
      		tempButtonUser.innerText = 'Remove';
      		tempButtonUser.setAttribute('onclick', `removeQuote(document.getElementById('quoteRemoveSearch').value, '${user}')`)
      		document.getElementById("modalRemoveQuote")!.innerHTML = `
        		<div class="removeQuoteList"></div>
        		<div class="icon-input-container">
          			<input class="icon-input" type="text" placeholder="Quote ID" id="quoteRemoveSearch">
          			<p id="editUserMessage" class="errorMessage"></p>
        		</div>`;

    		document.getElementById('quoteRemoveSearch')!.focus();
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

function removeQuote(id, user:userName) {
  	UserHandle.removeQuoteByID(Number(id), user.toLowerCase()).then(data => {
    	if (data == "NOQUOTEFOUND") {
      		console.log("No quote was found with that ID.");
      		document.getElementById("errorQuoteExit")!.innerText = "No quote was found with that ID."
      		setTimeout(() => {
        		document.getElementById("errorQuoteExit")!.innerText = ""
      		}, 3500);
    	} else {
      		console.log("Quote was removed");
      		document.getElementById("errorQuoteExit")!.innerText = "Quote removed."
      		setTimeout(() => {
        		document.getElementById("errorQuoteExit")!.innerText = ""
      		}, 3500);
      		loadAllQuotes();
      		quoteSearch(user);
    	}
  	})
}

function searchAndAddUser() {
    let userToBeAdded = (document.getElementById("userAddInput") as HTMLInputElement)!.value.trim().toLowerCase();
    let newUser = UserHandle.addUser(userToBeAdded, true); //adds it to the DB.
    newUser.then(data => {
        if (data == "USEREXISTS") {
            document.getElementById("addUserMessage")!.innerHTML = "That user already exists."
            setTimeout(() => {
                resetAddUserBox();
            }, 4000);
        } else if (data == "INVALIDUSER") {
            console.log("The user cannot be created because the user doesn't exist on glimesh.");
            document.getElementById("addUserMessage")!.innerHTML = "The user does not exist on Glimesh. Ensure the username is correct."
            setTimeout(() => {
                resetAddUserBox();
            }, 4000);
        } else { //SUCCESS WOOOOOOOOOOOOOOOOOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            console.log("Showing the streamer the user");
            $("#modalUserAdd").modal("hide");
            successMessage("User added!", `${data.userName} has been added to Glimboi.`);
            addUserTable(data);
        }
    })
}

function resetAddUserBox() {
    document.getElementById("addUserMessage")!.innerHTML = ""
}

// Removes the user from a table. This only affects the table
function removeUserFromTable(deletedUser:userName) {
    console.log("The user " + deletedUser + " will now be deleted from the table.");
    try {
        let filteredData = userTable
        .rows()
        .indexes()
        .filter(function (value, index) {
            return userTable.row(value).data().userName == deletedUser;
        });
        userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
    } catch (e) {}
}

function makeList(user:UserType) { //Similir to above function, makes a list and displays it under the table.
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
      if (numberOfListItems == 0) {
        listElement.innerHTML = `No quotes found for specified user.`
      }
    window.scrollTo(0, document.body.scrollHeight);
}

//This is the points section.
let pointsTable;
async function getPoints() {
    let startingPoints = String(CacheStore.get("startingPoints", 0));
    let earningPoints = String(CacheStore.get("earningPoints", 15));
    let pointsName = CacheStore.get("pointsName", "Points");
    document.getElementById("pointName")!.innerHTML = `${pointsName} Leaderboard`; // above the table
  	document.getElementById("StartingPoints").innerHTML = startingPoints; // header
  	document.getElementById("EarningPoints").innerHTML = earningPoints; // header
    document.getElementById("TotalPoints").innerHTML = String(await UserHandle.getAllPoints()); // total points
    (document.getElementById("pointsNewName") as HTMLInputElement).value = pointsName; // name input
    (document.getElementById("pointValue") as HTMLInputElement).value = startingPoints; // points input
    (document.getElementById("pointRate") as HTMLInputElement).value = earningPoints; // points input
    document.getElementById("rateValueOutput").innerText = earningPoints; // slider value
    document.getElementById("pointValueOutput").innerText = startingPoints; // slider value;

    let arrayOfPoints = [];
    let topPoints = await UserHandle.getTopPoints();
    pointsTable = document.getElementById("pointsTable")! as HTMLTableElement;
    for (const property in topPoints) {
        let pointValue = [
            `${topPoints[`${property}`].userName}`,
            `${topPoints[`${property}`].points}`,
        ];
        arrayOfPoints.push(pointValue)
    }
    for (let i = 0; i < pointsTable.rows.length; i++) { //For every row
        if (pointsTable.rows[i + 1] === undefined) {
            continue;
        }

        pointsTable.rows[i + 1].cells[0].innerHTML = i;
        if (arrayOfPoints[i] !== undefined) {
            pointsTable.rows[i + 1].cells[1].innerHTML = arrayOfPoints[i][0];
            pointsTable.rows[i + 1].cells[2].innerHTML = arrayOfPoints[i][1];
        }
    }
}

function saveUserPointSettings() {
    let pointsName = (document.getElementById("pointsNewName") as HTMLInputElement).value;
    if (pointsName.length <= 0) {
        pointsName = "Points"
    }
    let migratedSettings = [
        {startingPoints: Number((document.getElementById("pointValue") as HTMLInputElement).value)},
        {earningPoints: Number((document.getElementById("pointRate") as HTMLInputElement).value)},
        {pointsName: pointsName},
    ]
    CacheStore.setMultiple(migratedSettings);
    successMessage("Settings Saved", "Point settings have been saved.");
    getPoints();
}

async function userSearch(user: userName, inModal: boolean) {
    let userExists = await UserHandle.findByUserName(user.toLowerCase())
    if (userExists == "ADDUSER") {
        if (inModal) {
            document.getElementById("editUserMessage")!.innerText = "No user was found with that name.";
            setTimeout(() => {
                document.getElementById("editUserMessage")!.innerText = "";
            }, 3500);
        } else {
            errorMessage("User Not Found", "That user was not found. Make sure you entered their username correctly.");
        }
    } else {
        console.log("Editing user");
        const UserUI = require(`${appData[0]}/frontend/users/modalManager.js`);
        await UserUI.loadUserModal(userExists)
        // Prevents non numbers from being entered.
        $("#editUserPoints").keypress(function (e) {
            // @ts-ignore
            if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
        });
        $("#editUserWatchTime").keypress(function (e) {
            // @ts-ignore
            if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
        });
        $("#modalUserEdit").modal("hide"); // close the modal
        $("#modalUserEditing").modal("show"); // open the user modal
    }
}

function validateUserInfo(user: string) {
    let userPoints = Number(strip(document.getElementById("editUserPoints")!.innerHTML));
    let userWatchTime = Number(strip(document.getElementById("editUserWatchTime")!.innerHTML));
    if (userPoints < 0 || userWatchTime < 0) {
        errorMessage("Invalid Points or Watch Time", "You cannot have a negative number of points or watch time.");
        return
    } else if (isNaN(userPoints) || isNaN(userWatchTime)) {
        errorMessage("Invalid Points or Watch Time", "You must enter a number for points and watch time.");
        return
    } else {
        UserHandle.editUserAll(user, userPoints, (document.getElementById("userEditRankChoice") as HTMLInputElement).value, userWatchTime);
        $("#modalUserEditing").modal("hide");
    }
}

function editUserTable(user: userName, role: rankName, points, watchTime) {
    try {
        points = Number(points);
        console.log(user, role, points);
        user = user.toLowerCase()
        // searches the table for the name of the user
        let indexes = userTable
            .rows()
            .indexes()
            .filter(function (value, index) {
                return user === userTable.row(value).data().userName;
            });
        // Get the row for indexes
        let row = userTable.row(indexes[0]);

        // Get the data for the row
        let data = row.data();
        // Change the row data
        data.points = points;
        data.role = role;
        data.watchTime = watchTime;
        // Update the table data and redraw the table
        row.data(data).draw();
    } catch (e) {
        //console.log(e)
    }
}

async function loadUserTable() {
    userTable = $("#userTable").DataTable({
        data: await UserHandle.getAll(),
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
                title: "Role",
                data: "role"
            },
            {
                title: "Link",
            },
            {
                title: "Quotes",
            },
            {
                title: "Delete",
            }
        ],
        columnDefs: [
            {
                targets: -1,
                data: null,
                defaultContent: "<button class='deletionIcon'><i class='fas fa-trash'></i></button>"
            },
            {
                targets: -2,
                data: null,
                defaultContent: "<button class='quoteIcon'>Open</button>"
            }, {
                targets: -3,
                data: null,
                render: function (data, type, row, meta) {
                    if (type === 'display') {
                        data = '<a href="javascript:void(0)" disabled>' + "Glimesh Profile" + '</a>';
                    }
                    return data;
                }
            }],
        pageLength: 25
    });
    $('#userTable').on('click', 'tbody tr .deletionIcon', async function (e) {
        e.stopPropagation();
        let data = userTable.row($(this).parents('tr')).data();
        removeUserFromTable(data.userName);
        UserHandle.removeUser(data.userName, false, "Glimboi");
    })
    $('#userTable').on('click', 'tbody tr .quoteIcon', async function (e) {
        e.stopPropagation();
        let data = userTable.row($(this).parents('tr')).data();
        let user = await UserHandle.findByUserName(data.userName) as UserType;
        console.log('Building quote list with ' + user.userName)
        makeList(data);
    })
    $('#userTable').on('click', ' tbody tr a', function (e) {
        e.stopPropagation();
        let data = userTable.row($(this).parents('tr')).data();
        console.log(data)
        loadLink("glimesh.tv/" + data.userName)
    });
    $('#userTable').on('click', ' tbody tr', async function (e) {
        console.log("zzz");
        let data = userTable.row($(this)).data();
        console.log(data);
        userSearch(data.userName, false);
    })
}

//adds it to the table
function addUserTable(data: UserType) {
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
    	document.getElementById("editUserModal")!.innerHTML = editUserReset()
  	})
  	$('#modalUserAdd').on('hidden.bs.modal', function (e) {
    	document.getElementById("adduserModal")!.innerHTML = addUserReset()
  	})
  	$('#modalUserRemove').on('hidden.bs.modal', function (e) {
    	document.getElementById("removeuserModal")!.innerHTML = removeUserReset()
  	})
  	$('#modalQuoteRemove').on('hidden.bs.modal', function (e) {
    	document.getElementById("removeQuoteModal")!.innerHTML = removeQuoteReset()
  	});
  	$('#modalQuoteAdd').on('hidden.bs.modal', function (e) {
    	document.getElementById("addQuoteModal")!.innerHTML = addQuoteReset()
  	})
  	$('#modalUserEditing').on('hidden.bs.modal', function (e) {
    	document.getElementById("modalUserEditing")!.innerHTML = ``
  	})
}

function syncQuotes(user:UserType | userName, quote, action) {
    // removes it from the list as well as the user quote list.
    try {
      if (action == "remove" && typeof user !== "string") {
            makeList(user);
      } else if (action == "add") {
            console.log(user);
            let filteredData = userTable
            .rows()
            .indexes()
            .filter(function (value, index) {
              if (userTable.row(value).data().userName == user) {
                    makeList(userTable.row(value).data());
                    return;
              }
            });
      }
    } catch (e) {
      console.log(e);
    }
}

function syncUsers(data:userName | UserType, action: "add" | string) {
    try {
      if (action == "add") {
            addUserTable(data as UserType);
      } else {
            console.log("The user " + data + " will now be deleted from the table.");
            let filteredData = userTable
            .rows()
            .indexes()
            .filter(function (value, index) {
              return userTable.row(value).data().userName == data;
            });
            userTable.rows(filteredData).remove().draw(); //removes user and redraws the table
      }
    } catch (e) {
      console.log(e)
    }
}