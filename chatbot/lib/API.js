// Handles some of the API requests to GLimesh. 
var clientID = ""
var token = ""
var channelID = ""
var streamer = "";

//Updates the token so we can send requests as the user. 
function updatePath(accessToken) {
  token = accessToken;  
}

function updateID() {
  AuthHandle.getID().then(data => {
    if (data == null) {
      console.log("No ID exists yet.");
      errorMessage("Auth Missing", "Please authenticate before doing anything in the bot. Some functions require the API to work properly. GlimBoi cannont use the API without the proper authentication")
    } else {
    clientID = data
    }
  })
}


//Gets the channel ID.
async function getChannelID(channel) {
  var ID = await new Promise(resolve => {
    fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel (username: "${channel}"){id, streamer {displayname}}}`, headers: { Authorization: `Bearer ${token}` }})
      .then((res) => {
        res.json().then((data) => {
          try {
            console.log(data);
            channelID = data.data.channel.id;
            streamer = data.data.channel.streamer.displayname; // We can use the streamer name now.
            resolve(data.data.channel.id);
          } catch (e) {
            try {
              resolve({ data: data.errors[0].message, status: "AUTHNEEDED" });
            } catch (e2) {
              resolve(null);
            }
          }
        });
      })
      .catch((err) => console.error(err));
  })
return ID
}

//Returns the user ID
async function getUserID(user) {
 var ID = await new Promise(resolve => {
  fetch("https://glimesh.tv/api", { method: "POST", body: `query {user(username: "${user}") {id}}`, headers: { Authorization: `Client-ID ${clientID}` }})
  .then((res) => {
    res.json().then((data) => {
      try {
        console.log("The ID of " + user + " is " + data.data.user.id)
        resolve(data.data.user.id)
        } catch(e) {
          try {
            resolve({data: data.errors[0].message, status: "AUTHNEEDED"})
          } catch(e2) {
            resolve(null)
          }
        }
    });
  })
  .catch((err) => console.error(err));
 });
 console.log("Completed user id request");
return ID
}


async function getCurrentGame() {
  var category = await new Promise(resolve => {
    fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel(username: "mytho") {stream {category {slug}}}}`, headers: { Authorization: `Client-ID ${clientID}` }})
   .then((res) => {
    res.json().then((data) => {
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
    });
  })
  .catch((err) => console.error(err));
});
return category
}



async function getStats() {
  var viewers = await new Promise(resolve => {
    fetch("https://glimesh.tv/api", { method: "POST", body: `query {channel(id:${channelID}) {stream {countViewers,newSubscribers}},followers(streamerUsername: "${streamer}") {id}}`, headers: { Authorization: `Client-ID ${clientID}` }})
      .then((res) => {
        res.json().then((data) => {
          try { //if it is null and nested this will prevent a crash.
            console.log(data)
            console.log("Current viewcount:" + data.data.channel.stream.countViewers + " Subscribers: " + data.data.channel.stream.newSubscribers + " Followers: " + data.data.followers.length)
            resolve(data.data)
            } catch(e) {
              try {
                resolve({data: data.errors[0].message, status: "NOSTREAMFOUND"})
              } catch(e2) {
                resolve(null)
              }
            }
        });
      })
      .catch((err) => console.error(err));
});
return viewers
}

module.exports = { getChannelID, getStats, getUserID, updateID, updatePath}