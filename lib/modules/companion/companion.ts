// This file manages commands

import Nedb from "@seald-io/nedb";
import { OutgoingPacket, requestType } from "../server/packet";
import { Board, BoardAction } from "./board";

let companionDB:Nedb<Board>; //Database of commands.


/**
 * Sets the correct filepath for the database
 * @param {string} updatedPath The file path before /data/commands.db
 */
function updatePath(updatedPath:string) {
    companionDB = new Datastore({ filename: `${updatedPath}/data/companion.db`, autoload: true });
}

function addBoard(board:string) {
    return new Promise(async resolve => {
        let boardExisits = await getBoardByName(board);
        if (!boardExisits) {
            companionDB.insert({
                buttons: [],
                id: 1,
                name: board
            }, function(err, boardLocal) {
                resolve(boardLocal);
            });
        } else {
            resolve(false);
        }
    })
}

function getBoards() {
    return new Promise((resolve, reject) => {
        companionDB.find({}, (err, boards) => {
            if (err) {
                reject(err);
            } else {
                resolve(boards);
            }
        });
    });
}

function getBoardByName(name: string) {
    return new Promise(resolve => {
        companionDB.findOne({name: name}, {}, function(err, board) {
            if (board == undefined) {
                resolve(false);
            } else {
                resolve(board);
            }
        })
    })
}

function removeBoard(name: string) {
    return new Promise(resolve => {
        companionDB.remove({name: name}, {}, (err, numRemoved) => {
            if (numRemoved > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    })
}

function editBoard(board:Board) {
    return new Promise(resolve => {
        companionDB.update({name: board.name}, board, {}, (err, numReplaced) => {
            if (numReplaced > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    })
}

function reset() {
    companionDB.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) {
            throw err;
        }
    });
}

async function handleBoard(action: requestType, board: Board) {
    switch (action) {
        case "addBoard":
            addBoard(board.name);
            break;
        case "removeBoard":
            removeBoard(board.name);
            break;
        case "editBoard":
            editBoard(board);
            break;
        case "reset":
            reset();
            break;
        case "getBoards":
            let boards: OutgoingPacket = await getBoards();
            return {
                boards: boards
            }
        default:
            return;
    }
}

export { updatePath, addBoard, getBoards, removeBoard, editBoard, reset, handleBoard };