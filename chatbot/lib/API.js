// Handles some of the API requests to GLimesh. 
var request = require('request'); //Import the library
//Define the data we want from Glimesh. 
//Define the data we want from Glimesh

function APIrequest(data, optionalData) {
var options = {
    method: 'POST',
    body: data,
    url: 'https://glimesh.tv/api',
    headers: {
        'Authorization': 'Bearer Token_Here' //If you are using a client ID use 'Authorization': 'Client-ID qwertyuiop123456789'
    }
};

//Callback function runs when the data is recieved. We convert it to an object on arrival.
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body); //The unfiltered response
        var convertedResponse = JSON.parse(body); //Convert the response
        console.log(`You are ${convertedResponse.data.myself.username} and your ID is ${convertedResponse.data.myself.id}`);
    } else {
        console.log(error); //log any errors
        console.log(body);
    }
  }
  request(options,callback)
}



async function getStreamCategory() {
    var data = `
    query {
        channel(username: "Mytho") {
          stream {
            category {
              name,
              slug,
              tagName
            }
          }
        }
      }`
    APIrequest(data, null)
}

module.exports = {getStreamCategory}