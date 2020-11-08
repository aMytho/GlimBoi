//handles sending users to differen to parts of the app
var {
  BrowserWindow, app
} = require("electron").remote

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
                if (linkEl.id = "Commands") {loadCommandTable();} //Builds the data table
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

window.onbeforeunload = (e) => {
  /*var answer = confirm('Do you really want to close the application?');
  e.returnValue = answer;  // this will *prevent* the closing no matter what value is passed
  if(answer) { win.destroy(); }  // this will close the app
  */
 console.log('are you sure?')
 setTimeout(() => {
   
 }, 5000);
};