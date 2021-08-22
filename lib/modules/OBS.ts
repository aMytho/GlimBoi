// This file handles all obs actions
let websocketServer;
let wss:any;
let OBSDB:Nedb;
let wsController = {};
let mediaWait:any = [];

/**
 * Sets the path to the database
 * @param {string} updatedPath The path to the db
 */
function updatePath(updatedPath:string) {
    OBSDB = new Datastore({ filename: `${updatedPath}/data/obs.db`, autoload: true });
}

/**
 * Gets all of the OBS data from the db and sets it to OBSDATA
 */
function getAll(): Promise<MediaType[]> {
    return new Promise(resolve => {
        OBSDB.find({}, function (err: Error | null, docs: MediaType[]) {
            resolve(docs);
        });
    })
}

/**
 * Adds media to the database
 * @param {string} name The name of the media
 * @param {string} path Where the media is located
 * @param {string} type The type of media (img,gif,vid,etc)
 * @param {string} position The position to show it in the overlay (display elements only)
 */
function addMedia(name:mediaName, path:mediaPath, type:mediaType, position:mediaPosition) {
    OBSDB.insert([{name: name.toLowerCase(), path: path, type: type, position: position}], function (err, newDocs) {});
}

/**
 * Edits media
 * @param {string} name The name of the media
 * @param {string} path Where the media is located
 * @param {string} type The type of media (img,gif,vid,etc)
 * @param {string} position The position to show it in the overlay (display elements only)
 */
function editMedia(name:mediaName, path:mediaPath, type:mediaType, position:mediaPosition) {
    console.log(name, path, position);
    name = name.toLowerCase();
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
function removeMedia(media: mediaName) {
    media = media.toLowerCase()
    OBSDB.remove({ name: media }, {}, function (err, numRemoved) {
        console.log("Media removed");
    })
}

/**
 * Searches for media and returns it
 * @param {string} name The name to search for
 * @returns {object} Returns an object if found, else null
 */
function getMediaByName(name: mediaName): Promise<MediaType> {
    name = name.toLowerCase();
    return new Promise(resolve => {
        OBSDB.find({ name: name }, function (err, docs: MediaType[]) {
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].name === name) {
                    resolve(docs[i]);
                }
            }
            resolve(null)
        });
    })
}

/**
 * Returns all the media that match the search term
 * @param type The type of media to search for
 */
function getMediaByType(type: mediaType): Promise<MediaType[]> {
    return new Promise(resolve => {
        let mediaArray = [];
        OBSDB.find({}, function (err, docs: MediaType[]) {
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].type.startsWith(type)) {
                    mediaArray.push(docs[i])
                }
            }
            resolve(mediaArray);
        });
    })
}

/**
 * Sends media to the overlay
 * @param {MediaType} media The media to send
 * @param {mediaWSSName} action The action we are sending
 */
function activateMedia(media: MediaType, action: mediaWSSName) {
    try {
        wss.send(JSON.stringify({action: action, data: media}));
        mediaWait.push(media);
    } catch(e) {}
}

/**
 * Sends details to the overlay so it can play a song
 */
function playSong(song:any) {
    try {
        wss.send(JSON.stringify({action: "newSong", data: song}))
    } catch(e) {}
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
            // @ts-ignore
            wsController.ws = ws
            console.log("Client connected.");
            wss.send = function (data:JSON) {
                ws.send(data)
            }
            ws.on("message", function responseHandler(message:string) {
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
        let overlayStatusBar = document.getElementById("overlayStatus")!;
        overlayStatusBar.title = "Overlay Active";
        overlayStatusBar.innerHTML = `<span style="color:  rgb(17, 92, 33);">Overlay: Active</span>`
        overlayStatusBar.style.color = "rgb(17, 92, 33)"
        let musicStatusBar = document.getElementById("musicStatus")!;
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
    wss.removeAllListeners("connection");
}

export {activateMedia, addMedia, editMedia, getAll, getMediaByName, getMediaByType, playSong, removeMedia, startServer, stopServer, updatePath}