import { ServerResponse } from "http";
import { Board } from "../companion/board";
import { ApiRequest } from "./request";



async function handleAPIRequest(req: ApiRequest, res: ServerResponse) {
    // Remove /api/
    req.href = req.href.slice(5);
    console.log(req);

    // Handle board request
    if (req.href.startsWith("boards")) {
        switch(req.method) {
            case "GET":
                let getResponse = await Companion.getBoards();
                res.end(JSON.stringify(getResponse));
                break;
            case "POST":
                if (checkForName(req, res)) {
                    let possibleResponse = await Companion.addBoard(req.body);
                    res.end(JSON.stringify(possibleResponse));
                }
                break;
            case "DELETE":
                if (checkForId(req, res)) {
                    let boardRemoved = await Companion.removeBoard(req.body.id);
                    res.end(JSON.stringify({
                        removed: boardRemoved
                    }));
                }
                break;
            case "PATCH":
                if (checkForName(req, res)) {
                    let boardUpdated = await Companion.editBoard(req.body as Board);
                    res.end(JSON.stringify({
                        updated: boardUpdated
                    }));
                }
                break;
            default:
                res.end(JSON.stringify({
                    result: false
                }))
        }
    } else if (req.href.startsWith("message")) {
        ChatMessages.sendMessage(req.body.message || "").then(_val => {
            res.end(JSON.stringify({
                requestRecieved: true
            }))
        })
    } else if (req.href.startsWith("media")) {
        let media = await MediaHandle.getMediaByName(req.body.media.mediaName);
        if (media) {
            Server.activateMedia(media, req.body.media.mediaType);
        }
        res.end(JSON.stringify({
            requestRecieved: null
        }))
    } else if (req.href.startsWith("command")) {
        CommandHandle.TriggerHelper.checkContext("Manual", {
            commandName: req.body.command.commandName
        });
        res.end(JSON.stringify({
            requestRecieved: true
        }))
    } else {
        res.end(JSON.stringify({
            requestRecieved: false
        }))
    }
}

function checkForName(req: ApiRequest, res: ServerResponse) {
    if (req.body.name && typeof req.body.name == "string" && req.body.name.length > 0) {
        return true
    }
    res.statusCode = 500;
    res.end(JSON.stringify({
        error: "Invalid Name"
    }))
}

function checkForId(req: ApiRequest, res: ServerResponse) {
    if (req.body.id != undefined && typeof req.body.id == "number") {
        return true
    }
    res.statusCode = 500;
    res.end(JSON.stringify({
        error: "Invalid ID"
    }))
}


export {handleAPIRequest}