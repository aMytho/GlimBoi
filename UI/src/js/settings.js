var ApiHandle = require(appData[0] + "/chatbot/lib/api.js");
ApiHandle.updateID()
var fs = require("fs");
var settings = {}

function getSettings() {
    var raw = fs.readFileSync(appData[0] + '/chatbot/settings/settings.JSON');
    var parsed = JSON.parse(raw);
    console.log(parsed)
    settings = parsed;
}

function updatePoints(value) {
    settings.Points.StartingAmount = value.start;
    settings.Points.accumalation = value.earn;
    settings.Points.name = value.name;
    fs.writeFileSync(appData[0] + '/chatbot/settings/settings.JSON', JSON.stringify(settings));
    console.log("Point settings updated!");
}

getSettings()