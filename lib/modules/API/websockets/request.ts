import { OutgoingMessage, OutgoingMessageTypes, OBSRequestTypes, RequestBatchRequest } from "./types/obsProtocol";

/**
 * The base OBS request. Contains the basic info and any extra user added data.
 */
export class ObsRequest {
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
    
    setBatchRequestParams(id: string, requests: RequestBatchRequest[]) {
        (this.request.d as OutgoingMessageTypes[8]).requestId = id;
        (this.request.d as OutgoingMessageTypes[8]).haltOnFailure = true;
        (this.request.d as OutgoingMessageTypes[8]).requests = requests;
        this.request.op = 8;
    }

    addBatchToRequestList(request: RequestBatchRequest) {
        (this.request.d as OutgoingMessageTypes[8]).requests.push(request);
        console.log(`Adding ${request.requestType} with ID ${request.requestId} to the request list.`);
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