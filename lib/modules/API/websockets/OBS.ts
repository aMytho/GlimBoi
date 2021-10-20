import EventEmitter from "events";

/**
 * The how many messages have been sent to the OBS websocket. The number is the last request. request-id
 */
let messageID = 0; // @ts-ignore
let host:WebSocket = {};

let ObsEmitter = new EventEmitter;

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
            let authSucceeded = await authenticate();
            if (authSucceeded) {
                resolve(true);
            } else {
                resolve(false);
                errorMessage("OBS Auth Error", `Glimboi was not able to authenticate with OBS Websocket.
                Please check that the password is correct and reload the bot.`);
                host.close(1000);
            }
        }

        host.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data[`message-id`]) {
                ObsEmitter.emit(`${data["message-id"]}`, data);
            }
        }

        host.onclose = () => {
            console.log("OBS connection closed");
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
 * @returns
 */
async function sendObsData(data: any, dataToGet?: CommandActionVariables[], isRetry = false): Promise<false | any> {
    if (host.readyState === WebSocket.OPEN) {
        host.send(JSON.stringify(data));
        if (dataToGet) {
            await connect();
            return await waitForRespone(data["message-id"], dataToGet);
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
async function waitForRespone(messageToListenFor: string, dataToGet: CommandActionVariables[]) {
    return new Promise((resolve, reject) => {
        try {
            ObsEmitter.once(`${messageToListenFor}`, (obsResponse) => {
                console.log(obsResponse);
                try {
                    let dataToReturn:string[] = []
                    for (let i = 0; i < dataToGet.length; i++) {
                        dataToReturn.push(obsResponse[dataToGet[i].variable]);
                        CommandHandle.ChatAction.ActionResources.addVariable({name: dataToGet[i].variable, data: obsResponse[dataToGet[i].data]});
                    }
                    resolve(obsResponse);
                } catch (error2) {
                    resolve("HUGE ERROR");
                    console.trace(error2);
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}



/**
 * The base OBS request. Contains the basic info and any extra user added data.
 */
class ObsRequest {
    request: { "request-type": string, "message-id": string };
    constructor(requestType: string, data: any) {
        this.request = {
            "request-type": requestType,
            "message-id": `Request-${messageID++}`,
        }
        this.mergeParams(data);
        this.handleSpecialRequests(this.request);
    }

    mergeParams(data: any) {
        this.request = Object.assign(this.request, data);
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
 * Checks if auth is needed and if so, sends it.
 * @returns
 */
async function authenticate() {
    return new Promise(resolve => {
        // The auth request
        let authNeededRequest = new ObsRequest("GetAuthRequired", {});
        // Wait for the response
        ObsEmitter.once(authNeededRequest.request["message-id"], (data: ClientAPIs.WebsSockets.OBS.isAuthRequired) => {
            if (data.authRequired) { // Auth is required, we hash a password and send it
                console.log("Auth is required, hashing password");
                let sha256 = require("crypto-js/sha256");
                let Base64 = require("crypto-js/enc-base64");

                let userPassword = CacheStore.get("obsPassword", "lol123");
                if (userPassword == "") {
                    console.log("They didn't enter a password")
                    resolve(false);
                }

                const hash = Base64.stringify(sha256(CacheStore.get("obsPassword", "lol123") + data.salt)) as string;
                let password = Base64.stringify(sha256(hash + data.challenge)) as string;

                let authRequest = new ObsRequest("Authenticate", {auth: password});
                // Wait for the response.
                ObsEmitter.once(authRequest.request["message-id"], (data: any) => {
                    if (data.status == "ok") {
                        resolve(true); // it worked
                    } else {
                        resolve(false); // oops
                    }
                })
                host.send(JSON.stringify(authRequest.request));
            } else {
                resolve(true);
            }
        })
        host.send(JSON.stringify(authNeededRequest.request));
    })
}

export {connect, ObsRequest, sendObsData};