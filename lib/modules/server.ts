// File hosts the glimboi server for media, songs, and other data.

import { IncomingMessage, ServerResponse } from "http";
import { Http2Server } from "http2";
import { IncomingPacket, OutgoingPacket } from "./server/packet";

let websocketServer: import("ws").Server;
let httpServer: Http2Server;

/**
 * Starts the server. Pulls the address and port from the cache.
 */
function startServer() {
    // Setup websocket server if it isn't already running
    if (websocketServer == undefined) {
        let { Server } = require('ws');
        // Create the server.
        let serverInfo = {
            port: CacheStore.get("serverPort", 3000),
            host: CacheStore.get("serverUrl", "localhost")
        }
        websocketServer = new Server(serverInfo);
        setupListeners();
    } else {
        console.log("Websocket server already running.");
    }

    // Setup HTTP server if it isn't already running
    if (httpServer == undefined) {
        const http: typeof import("http") = require('http');
        httpServer = http.createServer(async function (req: IncomingMessage, res: ServerResponse) {
            // Load companion DB
            Companion = require(appData[0] + "/modules/companion/companion.js");
            Companion.updatePath(appData[1]);
            const url: typeof import("url") = require('url');
            const queryObject = url.parse(req.url, true);
            console.log(queryObject);
            let tryToConvertRequest = (body) => {
                try {
                    return JSON.parse(body)
                } catch(e) {
                    return ""
                }
            }

            if (queryObject.href.startsWith("/api")) {
                // Read and await for the body data
                const buffers = [];
                for await (const chunk of req) {
                    buffers.push(chunk);
                }
                const body = Buffer.concat(buffers).toString();

                const httpModule: typeof import("./server/http") = require(appData[0] + "/modules/server/http.js")
                res.writeHead(200);
                httpModule.handleAPIRequest({
                    href: queryObject.href,
                    method: req.method,
                    body: tryToConvertRequest(body)
                }, res);
            } else {
                res.writeHead(404);
                res.end('Not found.');
            }
        });
        httpServer.listen(4200);
    } else {
        console.log("HTTP server already running.")
    }
}

/**
 * Set up the listeners for the server (msg, close, etc)
 */
function setupListeners() {
    websocketServer.on("connection", function (ws) {
        ws.on("message", function (message) {
            handleIncomingRequest(message);
        });
        console.log("A user connected to the server.");
        showToast("A user connected to your server.");
    })

    websocketServer.on("close", function () {
        console.log("A user disconnected from the server.");
        showToast("A user disconnected from your server.");
    });

    websocketServer.on("error", function (err) {
        console.log("Error: " + err);
        restartServer();
    });
}

/**
 * Sends a message to all clients on the server.
 * @param message
 * @param secondTry
 */
function emit(message: string | OutgoingPacket, secondTry = false) {
    try {
        websocketServer.clients.forEach(function (client) {
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
    websocketServer.clients.forEach(function (client) {
        client.close();
    });
    websocketServer.removeAllListeners();
    websocketServer.close();
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

async function handleIncomingRequest(request) {
    console.log("Incoming request: " + request);
    // Parse the data. If actioncompleted it is a response and can be ignored
    try {
        let data: IncomingPacket = JSON.parse(request);
        if (data.actionCompleted) return

        // Handle the request
        switch (data.action) {
            case "runCommand":
                console.log("Request to run command: " + data.command.name);// @ts-ignore
                CommandHandle.TriggerHelper.checkContext(data.command.trigger, data.command.context);
                break;
            case "runMedia":
                console.log("Request to run media: " + data.media.name);
                let media = await MediaHandle.getMediaByName(data.media.name);
                if (media) {// @ts-ignore
                    activateMedia(media, data.media.type);
                } else {
                    console.log("Media not found: " + data.media.name);
                }
                break;
            case "sendMessage":
                console.log("Request to send message: " + data.message.message);
                ChatMessages.sendMessage(data.message.message);
                break;
            case "board":
                console.log("Board request");
                let response = await Companion.handleBoard(data.request.type, data.board);
                if (response) {
                    let packet: OutgoingPacket = {
                        ID: data.ID,
                    };
                    let final = Object.assign(packet, response);
                    emit(JSON.stringify(final));
                }
                break;
            default:
                console.log("Unknown request: " + data);
                break;
        }
    } catch (e) {
        console.log(e);
    }
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

export { activateMedia, close, emit, restartServer, startServer, updateMusicOverlay }