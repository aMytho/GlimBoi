import EventEmitter from "events";
import { IncomingMessage, OBSRequestTypes, OutgoingMessage, OutgoingMessageTypes, WebSocketOpCode } from "./types/obsProtocol";

/**
 * The how many messages have been sent to the OBS websocket. The number is the last request. request-id
 */
let messageID = 0; // @ts-ignore
let host:WebSocket = {};

let ObsEmitter = new EventEmitter();

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
            } else {
                resolve(false);
                errorMessage("OBS Error", authSucceeded.msg);
            }
        }

        host.onmessage = (event) => {
            const data: IncomingMessage = JSON.parse(event.data);
            console.log(data);
            
            //Check which type of event needs emitting based on response
            if (data.op == WebSocketOpCode.RequestResponse) {
                ObsEmitter.emit(data.d.requestId, data.d); // Emit response
            } else {
                ObsEmitter.emit(data.op.toString(), data.d); // Everything else
            }
        }

        host.onclose = (ev) => {
            console.log("OBS connection closed");
            console.log(ev)
        }

        host.onerror = (event) => {
            console.log("OBS connection error");
            console.log(event);
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
 * The base OBS request. Contains the basic info and any extra user added data.
 */
class ObsRequest {
    public request: OutgoingMessage = {
        op: 1,
        d: {}
    }
    constructor() {}

    createRequest<Type extends keyof OutgoingMessageTypes>(op: Type, d: OutgoingMessageTypes[typeof op]) {
        this.request = {
            op: op,
            d: d
        } as OutgoingMessage;

        this.handleSpecialRequests(this.request);
    }

    setRequestParams<_, reqType extends keyof OBSRequestTypes>(id: string, type: keyof OBSRequestTypes, request: OBSRequestTypes[reqType]) {
        (this.request.d as OutgoingMessageTypes[6]).requestId = id;
        (this.request.d as OutgoingMessageTypes[6]).requestType = type;
        (this.request.d as OutgoingMessageTypes[6]).requestData = request;
        this.request.op = 6;
    }

    handleSpecialRequests(data: any) {
        let keys = Object.keys(data);
        keys.forEach(key => {
            switch (key) {
                case "embedPictureFormat":
                    this.request["saveToFilePath"] = `${appData[1]}/screenshots/${Date.now()}.png`
                    break;
            }
        })
    }
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

export {connect, ObsRequest, sendObsData};