// This file handles all obs actions
let websocketServer
let wss
let wsController = {}
let OBSDB
let OBSData = []


function updatePath(path) {
    OBSDB = new Datastore({ filename: `${path}/data/obs.db`, autoload: true });
}

function getAll() {
  OBSDB.find({}, function (err, docs) {
    OBSData = docs;
  });
}

function addMedia(name, path, type, position) {
    OBSDB.insert([{name: name, path: path, type: type, position: position}], function (err, newDocs) {
        OBSData.push({name: name, path: path, type: type, position: position});
    });
}

function editMedia(name, path, type, position) {
    console.log(name, path, position)
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
            console.log("Media updated" + numReplaced);
        });
    } else {
        OBSDB.update({ name: name }, { $set: { position: position } }, {}, function (err, numReplaced) {
            console.log("Media updated" + numReplaced);
        });
    }
}

function removeMedia(media) {
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

function getCurrentMedia() {
    return OBSData
}

function getMediaByName(name) {
    for (let index = 0; index < OBSData.length; index++) {
        if (OBSData[index].name == name) {
            return OBSData[index]
        }
    }
    return null
}

function getSounds() {
    let arrayOfSounds = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("audio")) {
            arrayOfSounds.push(OBSData[i])
        }
    }
    return arrayOfSounds
}

function getImages() {
    let arrayOfImages = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("image")) {
            arrayOfImages.push(OBSData[i])
        }
    }
    return arrayOfImages
}

function getVideos() {
    let arrayOfVideos = []
    for (let i = 0; i < OBSData.length; i++) {
        if (OBSData[i].type.startsWith("video")) {
            arrayOfVideos.push(OBSData[i])
        }
    }
    return arrayOfVideos
}

function playSound(sound) {
    try {
        wss.send(JSON.stringify({action: "soundEffect", data: sound}))
    } catch(e) {
        console.log(e)
    }
}

function displayImage(image) {
    try {
        wss.send(JSON.stringify({action: "imageGif", data: image}))
    } catch(e) {
        console.log(e)
    }
}

function playVideo(video) {
    try {
        wss.send(JSON.stringify({action: "video", data: video}))
    } catch(e) {
        console.log(e)
    }
}


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
                console.log(message)
                ws.send(JSON.stringify({ status: "connected" }))
            })
        })
    }
}


function stopServer() {
    wss.close()
    wss.removeAllListeners("connection")
}


module.exports = {addMedia, displayImage, editMedia, getAll, getCurrentMedia, getImages, getMediaByName, getSounds, getVideos, playSound, playVideo, removeMedia, startServer, stopServer, updatePath}