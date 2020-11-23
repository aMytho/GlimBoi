//Handles the charts for the homepage and the auth.
var {
    BrowserView, BrowserWindow, app
  } = require("electron").remote
var fs = require('fs')

var serverisOn = false;
var AuthHandle = require(app.getAppPath() + "/chatbot/lib/auth.js");

function loadCharts() {
    var introChart = new ApexCharts(document.querySelector("#chart"), introChartOptions);
    introChart.render();
}

function rememberID() {
    console.log("Getting thier stored ID.");
    try {
       var possibleID = JSON.parse(fs.readFile(`${app.getAppPath()}/chatbot/data/auth.JSON`, function(err, data) {
        possibleID = JSON.parse(data)
        console.log(possibleID)
        if (possibleID.clientID !== "" && possibleID.clientID !== undefined) {
            document.getElementById("clientID").setAttribute("disabled", "");
            document.getElementById("clientID").setAttribute("placeholder", "ID Saved!")
            document.getElementById("saveAuth").setAttribute("onclick", "editAuth()")
            document.getElementById("saveAuth").innerHTML = "Edit Auth";
        } else {throw err}
       } ))
    } catch(e) {
        console.log(e)
        document.getElementById("clientID").removeAttribute("disabled");
        document.getElementById("saveAuth").setAttribute("onclick", "saveAuth()")
        document.getElementById("saveAuth").innerHTML = "Save";
    }
}

function saveAuth() {
    var replacement = JSON.stringify({token: "", clientID: document.getElementById("clientID").value, refresh: null})
    fs.writeFileSync(`${app.getAppPath()}/chatbot/data/auth.JSON`, replacement);
    document.getElementById("clientID").setAttribute("disabled", "");
    document.getElementById("clientID").setAttribute("placeholder", "ID Saved!")
    document.getElementById("clientID").value = "ID Saved!"
    document.getElementById("saveAuth").setAttribute("onclick", "editAuth()")
    document.getElementById("saveAuth").innerHTML = "Edit Auth";
}

function editAuth() {
    document.getElementById("clientID").removeAttribute("disabled");
    document.getElementById("saveAuth").setAttribute("onclick", "saveAuth()")
    document.getElementById("saveAuth").innerHTML = "Save";
}

function auth() {
    let authSchema = JSON.parse(fs.readFileSync(`${app.getAppPath()}/chatbot/data/auth.JSON`))
    AuthHandle.updatePath(app.getAppPath());
    AuthHandle.Auth(authSchema) //runs the webserver so we can get the token needed to connect to chat.
}




