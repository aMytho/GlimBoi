// File hosts the glimboi server for media, songs, and other data.

let host:import("ws").Server;

/**
 * Starts the server. Pulls the address and port fromt the cache.
 */
function startServer() {
    // make sure the server isn't already running
    if (host !== undefined) {
        console.log("Server already running.");
        return;
    }
    let {Server} = require('ws');
    // Create the server.
    let serverInfo = {
        port: CacheStore.get("serverPort", 3000),
        host: CacheStore.get("serverUrl", "localhost")
    }
    host = new Server(serverInfo);
    setupListeners();
}

/**
 * Set up the listeners for the server (msg, close, etc)
 */
function setupListeners() {
    host.on("connection", function() {
        console.log("A user connected to the server.");
    })

    host.on("close", function() {
        console.log("A user disconnected from the server.");
    });

    host.on("error", function(err) {
        console.log("Error: " + err);
        restartServer();
    });

    host.on("message", function(data) {
        console.log("Message: " + data);
    });
}

/**
 * Sends a message to all clients on the server.
 * @param message
 * @param secondTry
 */
function emit(message: string, secondTry = false) {
    try {
        host.clients.forEach(function(client) {
            client.send(message);
        });
    } catch (e) {
        console.log(e);
        console.log("Server not started yet, starting");
        if (!secondTry) { // wait 2 seconds just in case
            setTimeout(() => {
                startServer();
                emit(message, true);
            }, 2000);
        }
    }
}

/**
 * Closes the serer.
 */
function close() {
    console.log("Closing the server")
    host.clients.forEach(function(client) {
        client.close();
    });
    host.removeAllListeners();
    host.close();
}

/**
 * Returns the server.
 */
function restartServer() {
    close();
    setTimeout(() => {
        startServer();
    }, 7000);
}


/**
 * Sends media to the overlay
 * @param {MediaType} media The media to send
 * @param {mediaWSSName} action The action we are sending
 */
async function activateMedia(media: MediaType, action: mediaWSSName) {
    if (media.coordinates === undefined) {
        await MediaHandle.convertMedia(media);
        media = await MediaHandle.getMediaByName(media.name);
    }
    try {
        let packet = JSON.stringify({ action: action, data: media })
        console.log(packet);
        emit(packet);
    } catch (e) { }
}

/**
 * Sends details to the overlay so it can play a song
 */
function updateMusicOverlay(song: any) {
    try {
        let packet = JSON.stringify({ action: "newSong", data: song });
        emit(packet);
    } catch (e) { }
}

export {activateMedia, close, emit, restartServer, startServer, updateMusicOverlay}