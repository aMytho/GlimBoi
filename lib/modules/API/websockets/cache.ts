//Cache for OBS data.

import EventEmitter from "events";
import { ObsRequest } from "./request";
import { IncomingMessage, OBSResponseTypes, ResponseBatchMessage, Scene, WebSocketOpCode } from "./types/obsProtocol";

/**
 * Stores data and makes system requests
 */
export class OBSCache {
    private ObsEmitter: EventEmitter
    private host: WebSocket;
    private active: boolean = false;

    private items = {};

    constructor(ObsEmitter: EventEmitter) {
        this.ObsEmitter = ObsEmitter;
        console.log(this.host);
    };

    public setHost(host:WebSocket, isActive: boolean) {
        this.host = host;
        this.active = isActive;
        this.ObsEmitter.emit("CacheStateChanged", isActive);
    }

    public checkConnection() {
        return new Promise(async (resove) => {
            if (this.active) {
                //We are connected, continue
                return true;
            } else {
                this.ObsEmitter.once("CacheStateChanged", (val) => {
                    //Return when we are connected, or fail to connect
                    resove(val);
                });
                //Request reconnect
                this.ObsEmitter.emit("CacheNeedConnection");
            }
        })
    }

    public setItems(items: Scene[]) {
        items.forEach(item => {
            if (this.items[`${item.sceneName}`] == undefined) {
                this.items[`${item.sceneName}`] = [];
            }
            this.items[`${item.sceneName}`].push(item);
        });
    }

    public getItems() {
        return this.items;
    }

    public getSceneInfo(): Promise<Scene[]> {
        return new Promise(( async resolve => {
            if (!(await this.checkConnection())) {
                resolve([]);
                return;
            }
            let request = new ObsRequest();
            request.setRequestParams("SceneRequest", "GetSceneList", {});
        
            this.ObsEmitter.once("SceneRequest", (data: IncomingMessage<WebSocketOpCode.RequestResponse>["d"]) => {
                if (data.requestStatus.result) {
                    let sceneList = (data.responseData as OBSResponseTypes["GetSceneList"]).scenes;
        
                    // For each scene, request its items
                    let itemRequest = new ObsRequest();
                    itemRequest.setBatchRequestParams("ItemRequest", []);
                    sceneList.forEach(scn => {
                        itemRequest.addBatchToRequestList({
                            requestType: "GetSceneItemList",
                            requestData: {sceneName: scn.sceneName as string},
                            requestId: scn.sceneName as string // Pass the scene so we know which item belongs to which scene
                        });
                    });
        
                    //Once the items are returned...
                    this.ObsEmitter.once("ItemRequest", (data: ResponseBatchMessage) => {
                        let items: Scene[] = [];
                        data.results.forEach(res => {
                            if (res.requestStatus.result) {
                                (res.responseData as OBSResponseTypes["GetSceneItemList"]).sceneItems.forEach((item) => {
                                    items.push({
                                        sceneItemId: item.sceneItemId as number,
                                        sourceName: item.sourceName as string,
                                        sceneName: res.requestId
                                    });
                                });
                            }
                        });
                        console.log(items);
                        this.setItems(items);
                        resolve(items);
                    })
                    this.host.send(JSON.stringify(itemRequest.request));
                }
            })
        
            this.host.send(JSON.stringify(request.request));
        }));
    }


}