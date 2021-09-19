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
    host = new WebSocket(CacheStore.get("obsUrl", "ws://127.0.0.1:4444", true));
    return new Promise((resolve, reject) => {
        host.onopen = () => {
            console.log("OBS connection opened");
            resolve(true);
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
        getws().send(JSON.stringify(data));
        if (dataToGet) {
            await connect();
            return await waitForRespone(data["message-id"], dataToGet);
        } else {
            return false;
        }
    } else {
        console.log("OBS connection not open");
        if (!isRetry) {
            console.log("Attempting to connect to obs since its not open.")
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
    request: {"request-type": string, "message-id": string};
    constructor(requestType:string, data: any) {
        this.request = {
            "request-type": requestType,
            "message-id": `Request-${messageID++}`,
        }
        this.mergeParams(data);
    }

    mergeParams(data: any) {
        this.request = Object.assign(this.request, data);
    }
}

function getws() {
    return host
}


export {connect, ObsRequest, sendObsData, getws};