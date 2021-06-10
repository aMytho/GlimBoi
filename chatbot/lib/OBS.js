// This file handles all obs actions
let websocketServer, wss, OBSDB
let wsController = {}
let OBSData = [];
let mediaWait = [];

/**
 * Sets the path to the database
 * @param {string} path The path to the db
 */
function updatePath(path) {
    OBSDB = new Datastore({ filename: `${path}/data/obs.db`, autoload: true });
}

/**
 * Gets all of the OBS data from the db and sets it to OBSDATA
 */
function getAll() {
  OBSDB.find({}, function (err, docs) {
    OBSData = docs;
  });
}

/**
 * Adds media to the database
 * @param {string} name The name of the media
 * @param {string} path Where the media is located
 * @param {string} type The type of media (img,gif,vid,etc)
 * @param {string} position The position to show it in the overlay (display elements only)
 */
function addMedia(name, path, type, position) {
    OBSDB.insert([{name: name.toLowerCase(), path: path, type: type, position: position}], function (err, newDocs) {
        OBSData.push({name: name.toLowerCase(), path: path, type: type, position: position});
    });
}

/**
 * Edits media
 * @param {string} name The name of the media
 * @param {string} path Where the media is located
 * @param {string} type The type of media (img,gif,vid,etc)
 * @param {string} position The position to show it in the overlay (display elements only)
 */
function editMedia(name, path, type, position) {
    console.log(name, path, position);
    name = name.toLowerCase();
    for (let i = 0; i < OBSData.length; i++) {
        if (name == OBSData[i].name) {
            OBSData[i].position = position;
            if (path !== null) {
                OBSData[i].path = path
                OBSData[i].type = type
            }
            break;
        }
    }
    if (path !== null) {
        OBSDB.update({ name: name }, { $set: { path: path, position: position, type: type } }, {}, function (err, numReplaced) {
            console.log("Media updated");
        });
    } else {
        OBSDB.update({ name: name }, { $set: { position: position } }, {}, function (err, numReplaced) {
            console.log("Media updated");
        });
    }
}

/**
 * Removes media from the database
 * @param {string} media The name of the media
 */
function removeMedia(media) {
    media = media.toLowerCase()
    for (let i = 0; i < OBSData.length; i++) {
        if (media == OBSData[i].name) {
            OBSData.splice(i, 1);
            OBSDB.remove({ name: media }, {}, function (err, numRemoved) {
                console.log("Media removed");
            })
            break;
        }
    }
}

/**
 * Retruns the current media
 * @returns {array} An array of the current media dataset
 */
function getCurrentMedia() {
    return OBSData
}

/**
 * Searches for media and returns it
 * @param {string} name The name to search for
 * @returns {object} Returns an object if found, else null
 */
function getMediaByName(name) {
    name = name.toLowerCase();
    for (let index = 0; index < OBSData.length; index++) {
        if (OBSData[index].name == name) {
            return OBSData[index]
        }
    }
    return null
}

/**
 * Retruns an array of sound media
 * @returns {array} Audio Media
 */
function getSounds() {
    let arrayOfSounds = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("audio")) {
            arrayOfSounds.push(OBSData[i])
        }
    }
    return arrayOfSounds
}

/**
 * Returns an array of images
 * @returns {array} Image Media
 */
function getImages() {
    let arrayOfImages = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("image")) {
            arrayOfImages.push(OBSData[i])
        }
    }
    return arrayOfImages
}

/**
 * Returns an array of videos
 * @returns {array} Video Media
 */
function getVideos() {
    let arrayOfVideos = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("video")) {
            arrayOfVideos.push(OBSData[i])
        }
    }
    return arrayOfVideos
}

/**
 * Sends a soundeffect event to the overlay
 * @param {object} sound The media to be played
 */
function playSound(sound) {
    console.log("attemtping to send audio and stuff", sound)
    try {
        wss.send(JSON.stringify({action: "soundEffect", data: sound}));
        mediaWait.push(sound)
    } catch(e) {
        console.log(e)
    }
}

/**
 * Sends an imageGif event to the overlay
 * @param {object} image The media to be shown
 */
function displayImage(image) {
    try {
        wss.send(JSON.stringify({action: "imageGif", data: image}));
        mediaWait.push(image);
    } catch(e) {
        console.log(e)
    }
}

/**
 * Sends a video event to the overlay
 * @param {object} video The media to be shown
 */
function playVideo(video) {
    try {
        wss.send(JSON.stringify({action: "video", data: video}));
        mediaWait.push(video)
    } catch(e) {
        console.log(e)
    }
}

function playSong(song) {
    try {
        wss.send(JSON.stringify({action: "newSong", data: song}))
    } catch(e) {
        //console.log(e)
    }
}

/**
 * Starts the server for overlays
 */
function startServer() {
    if (wss == undefined) {
        console.log("Starting overlay");
        websocketServer = require("ws");
        wss = new websocketServer.Server({ port: 8080 })
        wss.on("connection", function connection(ws) {
            wsController.ws = ws
            console.log("Client connected.");
            wss.send = function (data) {
                ws.send(data)
            }
            ws.on("message", function responseHandler(message) {
                try {
                    let parsedMessage = JSON.parse(message);
                    for (let i = 0; i < mediaWait.length; i++) {
                        console.log(mediaWait)
                        if (mediaWait[i].path == parsedMessage.file) {
                            mediaWait.splice(i);
                        }
                    }
                    if (isDev == true) {
                        console.log(parsedMessage);
                    }
                } catch(e) {console.log(e)}
            })
        })
        let overlayStatusBar = document.getElementById("overlayStatus");
        overlayStatusBar.title = "Overlay Active";
        overlayStatusBar.innerHTML = `<span style="color:  rgb(17, 92, 33);">Overlay: Active</span>`
        overlayStatusBar.style.color = "rgb(17, 92, 33)"
        let musicStatusBar = document.getElementById("musicStatus");
        musicStatusBar.title = "Music Active";
        musicStatusBar.innerHTML = `<span style="color:  rgb(17, 92, 33);"> Music: Active</span>`
        musicStatusBar.style.color = "rgb(17, 92, 33)"
    }
}

/**
 * Stops the server
 */
function stopServer() {
    wss.close()
    wss.removeAllListeners("connection")
}

function getMediaWait() {
    return mediaWait
}

module.exports = {getMediaWait, addMedia, displayImage, editMedia, getAll, getCurrentMedia, getImages, getMediaByName, getSounds, getVideos, playSong, playSound, playVideo, removeMedia, startServer, stopServer, updatePath}