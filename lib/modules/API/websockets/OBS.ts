import EventEmitter from "events";
import { IncomingMessage, OutgoingMessage, OutgoingMessageTypes, WebSocketOpCode } from "./types/obsProtocol";
import { OBSCache } from "./cache";
import { ObsRequest } from "./request";

// @ts-ignore
let host:WebSocket = {};

let ObsEmitter = new EventEmitter();

let cache = new OBSCache(ObsEmitter);
cache.setHost(host, false);
ObsEmitter.on("CacheNeedConnection", async () => {
    if (host.readyState === WebSocket.OPEN) {
        cache.setHost(host, true);
    } else {
        let isConnected = await connect();
        console.log(isConnected)
        if (isConnected == true) {
            console.log(true)
            cache.setHost(host, true);
        } else {
            cache.setHost(host, false);
        }
    }
})




/**
 * Connects to the OBS websocket
 */
function connect() {
    // make sure a connection doesn't already exist
    if (host.readyState === WebSocket.OPEN) {
        console.log("OBS connection already open");
        return;
    }
    host = new WebSocket(CacheStore.get("obsUrl", "ws://127.0.0.1:4444", true));
    return new Promise((resolve) => {
        host.onopen = async () => {
            console.log("OBS connection opened");
            let authSucceeded = await identify();
            if (authSucceeded.success) {
                resolve(true);
                cache.setHost(host, true);
            } else {
                resolve(false);
                errorMessage("OBS Error", authSucceeded.msg);
            }
        }

        host.onmessage = (event) => {
            const data: IncomingMessage = JSON.parse(event.data);
            console.log(data);
            
            //Check which type of event needs emitting based on response
            if (data.op == WebSocketOpCode.RequestResponse || data.op == WebSocketOpCode.RequestBatchResponse) {
                ObsEmitter.emit(data.d.requestId, data.d); // Emit response
            } else {
                ObsEmitter.emit(data.op.toString(), data.d); // Everything else
            }
        }

        host.onclose = (ev) => {
            console.log("OBS connection closed");
            console.log(ev);
            cache.setHost(host, false);
        }

        host.onerror = (event) => {
            console.log("OBS connection error");
            console.log(event);
            cache.setHost(host, false);
        }
    })
}

/**
 * Sends a message to the OBS websocket. If the response is needed, waits for the response.
 * @param data
 * @param dataToGet
 */
async function sendObsData(data: OutgoingMessage<WebSocketOpCode.Request>, dataToGet?: CommandActionVariables[], isRetry = false): Promise<false | any> {
    if (host.readyState === WebSocket.OPEN) {
        host.send(JSON.stringify(data));
        if (dataToGet) {
            return await waitForResponse(data.d.requestId, dataToGet);
        } else {
            return false;
        }
    } else {
        console.log("OBS connection not open");
        if (!isRetry) {
            console.log("Attempting to connect to obs since its not open.");
            await connect();
            return await sendObsData(data, dataToGet, true);
        }
    }
}

/**
 * Waits for a response from OBS. Handles creating variables and returning them to the command runner.
 * Throws error if property isn't found or if the reqiest is invalid.
 * @param messageToListenFor
 * @param dataToGet
 * @returns
 */
async function waitForResponse(messageToListenFor: string, dataToGet: CommandActionVariables[]) {
    return new Promise((resolve, reject) => {
        try {
            ObsEmitter.on(messageToListenFor, (obsResponse: IncomingMessage<WebSocketOpCode.RequestResponse>["d"]) => {
                console.log(obsResponse);
                try {
                    if (!obsResponse.requestStatus.result) throw `OBS request ${obsResponse.requestId} failed: ${obsResponse.requestStatus}`
                    
                    //TODO -- implement return results
                    // let dataToReturn:string[] = []
                    // for (let i = 0; i < dataToGet.length; i++) {
                    //     dataToReturn.push(obsResponse[dataToGet[i].variable]);
                    //     CommandHandle.ChatAction.ActionResources.addVariable({name: dataToGet[i].variable, data: obsResponse[dataToGet[i].data]});
                    // }
                    // resolve(obsResponse);
                } catch (error2) {
                    resolve("HUGE ERROR");
                    console.trace(error2);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}





/**
 * Identify to OBS. Add auth if needed
 */
async function identify(): Promise<{success: boolean, msg: string}> {
    return new Promise(resolve => {
        // The auth request
        let identifyRequest = new ObsRequest();
        identifyRequest.createRequest(WebSocketOpCode.Identify, {
            rpcVersion: 1,
        });

        // Wait for the response
        ObsEmitter.once("0", (data: IncomingMessage<WebSocketOpCode.Hello>["d"]) => {
            console.log("Received Hello from OBS")
            if (data.authentication) { // Auth is required, we hash a password and send it
                console.log("Auth is required, hashing password");
                let sha256 = require("crypto-js/sha256");
                let Base64 = require("crypto-js/enc-base64");

                let userPassword = CacheStore.get("obsPassword", "lol123");
                if (userPassword == "") {
                    console.log("They didn't enter a password")
                    resolve({success: false, msg: "OBS requested a password but you do not have one set. Change that in Glimboi settings!"});
                }

                //Generate the password
                const hash = Base64.stringify(sha256(CacheStore.get("obsPassword", "lol123") + data.authentication.salt)) as string;
                let password = Base64.stringify(sha256(hash + data.authentication.challenge)) as string;

                //Add the password to the request
                (identifyRequest.request.d as OutgoingMessageTypes[WebSocketOpCode.Identify]).authentication = password;
            }

            //Return when we get a response
            ObsEmitter.once("2", () => resolve({success: true, msg: ""}));
            
            //Handle auth or version failure
            host.addEventListener("close", (ev) => {
                if (ev.code == 4009) {
                    console.log("Auth failure!");
                    resolve({success: false, msg: "The password was incorrect. Please enter the correct password."});
                } else {
                    resolve({success: false, msg: "Unknown OBS error. Connection to OBS closed."});
                }
            })

            //Send the identify message
            host.send(JSON.stringify(identifyRequest.request));
        })
    })
}


export {cache, connect, ObsRequest, sendObsData};

// TO DO -- in requestinfo function, make sure usr is connected first!