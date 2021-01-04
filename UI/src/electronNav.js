//handles sending users to differen to parts of the app
var {
  BrowserWindow, app, shell
} = require("electron").remote

function changeNavHighlight(highlight) { //Removes the old and highlights the new
  try {document.getElementsByClassName("active")[0].classList.remove("active")} catch(e) {}
  document.getElementById(highlight).classList.add("active");
}

window.onload = function() {

  var homePage = document.getElementsByClassName("pane")[0].innerHTML;

  document.getElementById("close").addEventListener("click", function(e) { //Closes the App.
      const win = BrowserWindow.getFocusedWindow()
      win.close();
  });

  document.getElementById("maximize").addEventListener("click", function(e) { //Closes the App.
    const win = BrowserWindow.getFocusedWindow()
    win.maximize();
  });

  document.getElementById("minimize").addEventListener("click", function(e) { //Closes the App.
    const win = BrowserWindow.getFocusedWindow()
    win.minimize();
  });

  // Get all the navigation links to an array
const naviLinks = Array.from(document.getElementsByClassName("nav-link"));
const contentEl = document.getElementsByClassName("pane")[0]

naviLinks.forEach((linkEl) => {
    // Listen click event for the navigation link
    linkEl.addEventListener("click", e => {
        // Prevent default behavior for the click-event
        e.preventDefault();
        // Get the path to page content file
        const href = linkEl.getAttribute("href");
        var id = linkEl.id
        if (href) {
            // Use node.js fs-module to read the file
            const fs = require("fs");
            fs.readFile(`${app.getAppPath()}/${href}`, (err, data) => {
                if (err) {
                    throw err;
                }
                // show the selected page
                contentEl.innerHTML = "";
                contentEl.insertAdjacentHTML("beforeend", data);
                changeNavHighlight(id) //Changes the highlight
                if (linkEl.id == "CommandLink") {loadCommandTable();} //Builds the data table
                if (linkEl.id == "GlimBoiHeader") {loadCharts(); rememberID();} //Builds the homepage charts and check for auth ino for the buttons
               // if (linkEl.id == "ChatLink") {openWindow()}
                if (linkEl.id == "UsersLink") {loadUsers()}
                if (linkEl.id == "PointsLink") {getPoints()}
                //if (linkEl.id = "Chat") {loadChatWindow();} //Builds the data table
            })
        }
    })
})

  /*
  document.getElementById("minimize").addEventListener("click", function (e) {
    var window = remote.getCurrentWindow();
    window.minimize(); 
  });

  document.getElementById("maxamize").addEventListener("click", function (e) {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
    window.unmaximize()} 
  })
  */
}
/*
window.onbeforeunload = (e) => {
  /*var answer = confirm('Do you really want to close the application?');
  e.returnValue = answer;  // this will *prevent* the closing no matter what value is passed
  if(answer) { win.destroy(); }  // this will close the app
  
 console.log('are you sure?')
 setTimeout(() => {
   
 }, 5000);
};
*/

//Opens a link in the users default browser.
function loadLink(link) {
  shell.openExternal("https://" + link)
}


// Shows an error message to the user in the form of a modal. 
function errorMessage(errorType, errorMessage) {
  document.getElementById("errorMessageText").innerHTML = errorType;
  document.getElementById("errorMessageSolution").innerHTML = errorMessage;
  $('#modalError').modal("show")
}


// Shows a success message to the user in the form of a modal. 
function successMessage(messageType, message) {
  document.getElementById("successMessageText").innerHTML = messageType;
  document.getElementById("successMessageSolution").innerHTML = message;
  $('#modalSuccess').modal("show");
}