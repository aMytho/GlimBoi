// A $( document ).ready() block.
$(document).ready(function() { //Oh yea, we have jquery. Feel free to use it.
    getSettings()
});
var fs = require("fs")
var settings = {}

function getSettings() {
    var raw = fs.readFileSync(app.getAppPath() + '/chatbot/settings/settings.JSON');
    var parsed = JSON.parse(raw);
    console.log(parsed)
    settings = parsed;
}

function updatePoints(value) {
    settings.Points.StartingAmount = value.start;
    settings.Points.accumalation = value.earn;
    settings.Points.name = value.name;
    fs.writeFileSync(app.getAppPath() + '/chatbot/settings/settings.JSON', JSON.stringify(settings));
    console.log("Point settings updated!");
}



