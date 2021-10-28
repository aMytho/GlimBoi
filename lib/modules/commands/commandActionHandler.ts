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

    removeGeneratedVariables() {
        ActionResources.removeVariables(this.generateVariables)
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

    async run({activation, user}:RunChatMessage) {
        let chatMessage = await ActionResources.searchForVariables({activation: activation, user: user, message: this.message})
        ChatMessages.filterMessage(chatMessage, "glimboi");
        return
    }
}

/**
 * Sends a GET request to an API of the users choice
 * @param {string} url The url to send the request
 * @param {array} headers The headers to include with the request
 * @param {array} returns What variables we set and what data we search for in the response
 */
class ApiRequestGet extends ChatAction {
    url:string
    headers:any
    returns: any
    constructor({url, headers, returns}:BuildApiRequestGet) {
        super("ApiRequestGet", ["url", "headers", "path"], returns );
        this.url = url;
        this.headers = headers;
        this.returns = returns;
    }

    async run() {
        await ActionResources.ApiRequest({url: this.url, headers: this.headers, mode: "GET", request: null, path: this.returns, pathType: this.getPathType()})
        return this.generateVariables
    }

    getPathType() {
        if (this.returns[0].data == null) {
            return "text"
        } else return "json"
    }
}

/**
 * Plays a sound effect in the overlay
 * @param {string} source The audio file to be played
 */
class Audio extends ChatAction {
    source: mediaName
    constructor({source}:BuildAudio) {
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
    target: any
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
 * Plays an image/gif in the overlay.
 * @param {string} source The image/gif to display
 */
class ImageGif extends ChatAction {
    source: mediaName
    constructor({source}:BuildimageGif) {
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

    async run({activation, user}:RunChatMessage) {
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
    async checkForReplacedVariables(requestType:string, request, {activation, user}:RunChatMessage) {
        switch (requestType) {
            case "ToggleMute":
            case "SetMute":
            case "SetSourceSettings":
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
 * Plays a video in the overlay
 * @param {string} source The video file we are playing
 */
class Video extends ChatAction {
    source: mediaName
    constructor({source}:BuildVideo) {
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
    constructor({wait}:WaitType) {
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

export {ActionResources, ApiRequestGet, Audio, Ban,
    ChatMessage, ImageGif, ObsWebSocket, ReadFile, Timeout,
    Video, Wait, WriteFile}