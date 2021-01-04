// Handles some of the API requests to GLimesh. 
var request = require('request'); //Import the library
var token = ""

//Updates the token so we can send requests as the user. 
function updatePath(accessToken) {
  token = accessToken;  
}


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


//Gets the channel ID.
async function getChannelID(channel) {
  console.log(channel)
  var ID = await new Promise(resolve => {
    request({method: "POST", body: `query {channel (username: "${channel}"){id}}`, url: `https://glimesh.tv/api`, headers: {'Authorization': `Bearer ${token}`}}, function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the data
      var data = JSON.parse(body)
      console.log(data)
      try { //if it is null and nested this will prevent a crash.
      console.log("The ID of " + channel + " is " + data.data.channel.id)
      resolve(data.data.channel.id)
      } catch(e) {
        try {
          resolve({data: data.errors[0].message, status: "AUTHNEEDED"})
        } catch(e2) {
          resolve(null)
        }
      }
  })
});
return ID
}

module.exports = { getChannelID, getStreamCategory, updatePath}