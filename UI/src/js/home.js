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

function saveAuth() {
    var replacement = JSON.stringify({token: "", clientID: document.getElementById("clientID").value, refresh: null})
    fs.writeFileSync(`${app.getAppPath()}/chatbot/data/auth.JSON`, replacement);
    console.log("done")
}

function auth() {
    let authSchema = JSON.parse(fs.readFileSync(`${app.getAppPath()}/chatbot/data/auth.JSON`))
    AuthHandle.updatePath(app.getAppPath());
    AuthHandle.Auth(authSchema) //runs the webserver so we can get the token needed to connect to chat.
}




