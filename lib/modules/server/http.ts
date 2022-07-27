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
                    let possibleResponse = await Companion.addBoard(req.body.name);
                    res.end(JSON.stringify(possibleResponse));
                }
                break;
            case "DELETE":
                if (checkForName(req, res)) {
                    let boardRemoved = await Companion.removeBoard(req.body.name);
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
        }
    }
}

function checkForName(req: ApiRequest, res: ServerResponse) {
    if (req.body.name && typeof req.body.name == "string" && req.body.name.length > 0) {
        return true
    }
    res.end("Invalid Name")
}


export {handleAPIRequest}