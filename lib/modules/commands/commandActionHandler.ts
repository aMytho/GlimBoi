// File creates and runs actions for commands.

const ActionResources:typeof import("../commands/actionResources") = require(appData[0] + "/modules/commands/actionResources.js")

/**
 * A ChatAction is a class with instructions on what to do based on the action.
 * @param action The action that we need to build
 * @param effect What the action will accomplish
 * @param info What properties we read to use the action
 * @param varsToSet What variables the return value will be in
 */
class ChatAction implements ChatActionType {
    action: actionName
    info: actionInfo
    generateVariables: actionVariables
    constructor(action:actionName, info:actionInfo, varsToSet:CommandActionVariables[] = []) {
        this.action = action;
        this.info = info;
        this.generateVariables = this.parseGenerateVariables(varsToSet);
    }

    parseGenerateVariables(variables) {
        let toBeGenerated = [];
        for (let i = 0; i < variables.length; i++) {
            toBeGenerated[i] = variables[i].variable
        }
        console.log(toBeGenerated);
        return toBeGenerated;
    }
}

/** Chatmessage action. Sends a message to chat.
 * @param {string} message The message that will be sent to chat
 */
class ChatMessage extends ChatAction {
    message:string
    constructor({message}:BuildChatMessage) {
        super("ChatMessage", "message", undefined)
        this.message = message;
    }

    async run({activation, user}:any) {
        let chatMessage = await ActionResources.searchForVariables({activation: activation, user: user, message: this.message})
        await ChatMessages.sendMessage(chatMessage);
        return
    }
}

/**
 * Sends a GET request to an API of the users choice
 * @param {string} url The url to send the request
 * @param {array} headers The headers to include with the request
 * @param {array} returns What variables we set and what data we search for in the response
 */
class ApiRequest extends ChatAction {
    url:string
    headers:any
    returns: any
    body:any
    httpRequest: string
    constructor({url, headers, returns, body, httpRequest}) {
        super("ApiRequest", ["url", "headers", "path"], returns );
        this.url = url;
        this.headers = headers;
        this.returns = returns;
        this.body = body;
        this.httpRequest = httpRequest;
    }

    async run({activation, user}) {
        [this.url, this.body] = await Promise.all([
            ActionResources.searchForVariables({activation: activation, user: user, message: this.url || ""}),
            ActionResources.searchForVariables({activation: activation, user: user, message: this.body || ""})
        ]);

        const request:typeof import("../API/request") = require(appData[0] + "/modules/API/request.js");
        await request.default({url: this.url, headers: this.headers, mode: this.httpRequest || "GET",
        request: null, path: this.returns, pathType: this.getPathType(), body: this.body});
        return this.generateVariables;
    }

    getPathType() {
        if (this.returns[0].data == null) {
            return "text"
        } else return "json"
    }
}

// Legay API Request
class ApiRequestGet extends ApiRequest {
    constructor({url, headers, returns}) {
        super({url: url, headers: headers, returns: returns, body: null, httpRequest: "GET"});
    }
}

/**
 * Plays a sound effect in the overlay
 * @param {string} source The audio file to be played
 */
class Audio extends ChatAction {
    source: string
    constructor({source}) {
        super("Audio", "source", undefined);
        this.source = source;
    }

    async run() {
        let toBePlayed = await MediaHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            Server.activateMedia(toBePlayed, "soundEffect");
        }
        return
    }
}

/**
 * Bans a user from the channel. Use with caution
 */
class Ban extends ChatAction {
    target: string;
    constructor({target}) {
        super("Ban", "target", undefined)
        this.target = target
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.target, activation: activation, user: user})
        let result = await ModHandle.ModPowers.banByUsername(target);
        if (typeof result == "string") {
            LogHandle.logEvent({event: "Ban User", users: [user.username, target]})
        }
        return
    }
}

/**
 * Follows or unfollows a user.
 */
class Follow extends ChatAction {
    target: string;
    follow: boolean;
    liveNotifications: boolean;
    constructor({target, follow, liveNotifications}) {
        super("Follow", ["target", "follow", "liveNotifications"], undefined)
        this.target = target;
        this.follow = follow;
        this.liveNotifications = liveNotifications;
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.target, activation: activation, user: user});
        let streamerID = await ApiHandle.getUserID(target);
        if (streamerID !== false && streamerID !== "INVALID") {
            let result = await ApiHandle.followUser(streamerID, !this.follow, this.liveNotifications);
            if (result) {
                if (this.follow) {
                    LogHandle.logEvent({event: "Follow User", users: [user.username, target]})
                } else {
                    LogHandle.logEvent({event: "Unfollow User", users: [user.username, target]})
                }
            }
        } else {
            showToast(`Follow CMD Action: Could not find channel ${target}`);
        }
    }
}

/**
 * Plays an image/gif in the overlay.
 * @param {string} source The image/gif to display
 */
class ImageGif extends ChatAction {
    source: string
    constructor({source}) {
        super("ImageGif", "source", undefined);
        this.source = source;
    }

    async run() {
        let toBeShown = await MediaHandle.getMediaByName(this.source);
        if (toBeShown !== null) {
            Server.activateMedia(toBeShown, "imageGif");
        }
        return
    }
}

/**
 * Send a message to the matrix network.
 */
class Matrix extends ChatAction {
    message: string
    room: string
    constructor({message, room}) {
        super("Matrix", ["message", "room"], undefined)
        this.message = message;
        this.room = room;
    }

    async run({activation, user}) {
        let message = await ActionResources.searchForVariables({message: this.message, user: user, activation: activation});
        await ApiHandle.Webhooks.MatrixWebhook.sendMessage(message, this.room);
        return
    }
}

/**
 * Send a message to yourself via the bot notification tools
 */
class Notification extends ChatAction {
    target: "toast" | "info" | "error";
    message: string;

    constructor({message, target}) {
        super("Notification", ["message", "target"], undefined);
        this.target = target;
        this.message = message;
    };

    async run({activation, user}) {
        let message = await ActionResources.searchForVariables({message: this.message, user: user, activation: activation});
        if (this.target == "toast") {
            showToast(message);
        } else if (this.target == "info") {
            successMessage(message, "");
        } else if (this.target == "error") {
            errorMessage(message, "");
        }
        return;
    }
}

/**
 * Trigger an action in OBS.
 */
class ObsWebSocket extends ChatAction {
    requestType: string
    data: any
    returns: any
    instruction: string
    constructor({requestType, data, variables, instruction}:BuildObsWebSocket) {
        super("ObsWebSocket", "data", variables);
        this.requestType = requestType;
        this.data = data;
        this.returns = variables;
        this.instruction = instruction
    }

    async run({activation, user}:any) {
        let obsPacket = new ApiHandle.WebSockets.OBSWebSocket.ObsRequest(this.requestType, this.data);
        obsPacket = await this.checkForReplacedVariables(this.requestType, obsPacket, {activation: activation, user: user});
        console.log(obsPacket);
        let result = await ApiHandle.WebSockets.OBSWebSocket.sendObsData(obsPacket.request, this.checkforVariables());
        console.log(result);
        return result
    }

    checkforVariables() {
        if (this.returns) {
            return this.returns
        } else {
            return false
        }
    }

    /**
     * Checks if any data needs to have variables replaced
     * @param requestType The type of request that we are sending
     * @param request The OBS packet that we are sending
     * @param param2 Data about the command
     * @returns The OBS packet with replaced variables
     */
    async checkForReplacedVariables(requestType:string, request, {activation, user}:any) {
        switch (requestType) {
            case "ToggleMute":
            case "SetMute":
            case "SetSceneItemRender":
            case "SetSourceSettings":
            case "SetVolume":
                request.request["source"] = await ActionResources.searchForVariables({activation: activation, user: user, message: request.request["source"]});
                return request
            case "SetCurrentScene":
                request.request["scene-name"] = await ActionResources.searchForVariables({activation: activation, user: user, message: request.request["scene-name"]});
                return request
            default: return request
        }
    }
}

/**
 * Adds or removes points from a user.
 */
class Points extends ChatAction {
    target: string
    points: number
    constructor({target, points}) {
        super("Points", ["target", "points"], undefined)
        this.target = target;
        this.points = points;
    }

    async run({activation, user}:any) {
        let target = await ActionResources.searchForVariables({message: this.target, activation: activation, user: user});
        // Remove $ if it exists. Would break queries
        target = target.replace(/\$/g, "");
        let userExists = await UserHandle.findByUserName(target);
        if (userExists == "ADDUSER") {
            await UserHandle.addUser(target, false, user);
        }
        if (this.points > 0) {
            UserHandle.addPoints(target, this.points);
        } else if (this.points < 0) {
            UserHandle.removePointsAboveZero(target, this.points);
        }
    }
}

/**
 * Reads a file and sets variable for the data.
 */
class ReadFile extends ChatAction {
    file: string
    returns: CommandActionVariables[]
    constructor({file, returns}) {
        super("ReadFile", ["file"], returns)
        this.file = file;
        this.returns = returns;
    }

    async run() {
        let fileModule:typeof import("../files/fileManager") = require(appData[0] + "/modules/files/fileManager.js");
        let fileData = await fileModule.readDataFromFile(this.file);
        ActionResources.addVariable({data: fileData, name: this.returns[0].variable});
        return this.generateVariables;
    }
}

/**
 * Times out a user, preventing them from speaking for 5 or 15 minutes
 */
class Timeout extends ChatAction {
    target: any
    duration: timeout
    constructor({target, duration}) {
        super("Timeout", ["target", "duration"], undefined)
        this.target = target
        this.duration = duration;
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.target, activation: activation, user: user})
        let result = await ModHandle.ModPowers.timeoutByUsername(target, this.duration);
        if (this.duration == "short" && typeof result == "string") {
            LogHandle.logEvent({event: "Short Timeout User", users: [user.username, target]})
        } else if (this.duration == "long" && typeof result == "string") {
            LogHandle.logEvent({event: "Long Timeout User", users: [user.username, target]})
        }
        return
    }
}

/**
 * Sends a tweet to twitter
 */
class Twitter extends ChatAction {
    tweetMessage: string
    constructor({tweetMessage}) {
        super("Twitter", ["tweetMessage"], undefined);
        this.tweetMessage = tweetMessage;
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.tweetMessage, activation: activation, user: user});
        ApiHandle.Webhooks.TwitterWebhook.sendTweet(target);
    }
}

/**
 * Update the stream info of your own stream.
 */
class UpdateStreamInfo extends ChatAction {
    whatToUpdate: string;
    title: string;
    constructor({whatToUpdate, title}) {
        super("UpdateStreamInfo", ["whatToUpdate", "title"], undefined);
        this.whatToUpdate = whatToUpdate;
        this.title = title;
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.title, activation: activation, user: user});
        ApiHandle.changeTitle(target);
    }
}

/**
 * Plays a video in the overlay
 * @param {string} source The video file we are playing
 */
class Video extends ChatAction {
    source: string
    constructor({source}) {
        super("Video", "source", undefined);
        this.source = source;
    }

    async run() {
        let toBePlayed = await MediaHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            Server.activateMedia(toBePlayed, "video");
        }
        return
    }
}


/**
 * Wait action. Waits a specified duration.
 * @param {number} time How long should we wait?
 */
class Wait extends ChatAction {
    wait: number
    constructor({wait}) {
        super("Wait", "wait", undefined)
        this.wait = Number(wait);
    }

    async run() {
        let wait = this.wait
        await new Promise(function(resolve) {
            setTimeout(resolve, wait * 1000);
        })
        return
    }
}

/**
 * Writes to a file.
 */
class WriteFile extends ChatAction {
    file: string
    data: string
    constructor({file, data}: {file: string, data: string}) {
        super("WriteFile", ["file", "data"], undefined)
        this.file = file;
        this.data = data;
    }

    async run({user, activation}) {
        let fileModule:typeof import("../files/fileManager") = require(appData[0] + "/modules/files/fileManager.js");
        let data = await ActionResources.searchForVariables({message: this.data, user: user, activation: activation});
        console.log(data);
        fileModule.writeDataToFile(this.file, data);
    }
}

export {ActionResources, ApiRequest, ApiRequestGet, Audio, Ban, ChatMessage, Follow, ImageGif, Matrix,
Notification, ObsWebSocket, Points, ReadFile, Timeout, Twitter, UpdateStreamInfo, Video, Wait, WriteFile}