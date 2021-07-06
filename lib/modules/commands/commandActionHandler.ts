// File creates and runs actions for commands.

const ActionResources:ActionResources = require(appData[0] + "/modules/commands/actionResources.js")

/**
 * A ChatAction is a class with instructions on what to do based on the action.
 * @param action The action that we need to build
 * @param effect What the action will accomplish
 * @param info What properties we read to use the action
 * @param varsToSet What variables the return value will be in
 */
class ChatAction implements ChatActionType {
    action: actionName
    effect: actionEffect
    info: actionInfo
    generateVariables: actionVariables
    constructor(action:actionName, effect:actionEffect, info:actionInfo, varsToSet:any = []) {
        this.action = action;
        this.effect = effect;
        this.info = info;
        this.generateVariables = this.parseGenerateVariables(varsToSet);
    }

    removeGeneratedVariables() {
        ActionResources.removeVariables(this.generateVariables)
    }

    parseGenerateVariables(variables) {
        let toBeGenerated = []
        for (let i = 0; i < variables.length; i++) {
            toBeGenerated[i] = variables[i].variable
        }
        return toBeGenerated;
    }
}

/** Chatmessage action. Sends a message to chat.
 * @param {string} message The message that will be sent to chat
 */
class ChatMessage extends ChatAction implements ChatMessageType {
    message:string
    constructor({message}:BuildChatMessage) {
        super("ChatMessage", "Sends a message to chat", "message", undefined)
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
class ApiRequestGet extends ChatAction implements ApiRequestGetType {
    url:string
    headers:any
    returns: any
    constructor({url, headers, returns}:BuildApiRequestGet) {
        let returnsData = returns
        super("ApiRequestGet", "Requests data from an API", ["url", "headers", "path"], returns );
        this.url = url;
        this.headers = headers;
        this.returns = returnsData;
    }

    async run() {
        let requestData = await ActionResources.ApiRequest({url: this.url, headers: this.headers, mode: "GET", request: null, path: this.returns, pathType: this.getPathType()})
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
class Audio extends ChatAction implements AudioType {
    source: mediaName
    constructor({source}:BuildAudio) {
        super("Audio", "Plays audio in the overlay", "source", undefined);
        this.source = source;
    }

    run() {
        let toBePlayed = OBSHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            OBSHandle.playSound(toBePlayed);
        }
        return
    }
}

/**
 * Plays an image/gif in the overlay.
 * @param {string} source The image/gif to display
 */
class ImageGif extends ChatAction implements ImageGifType {
    source: mediaName
    constructor({source}:BuildimageGif) {
        super("ImageGif", "Shows an image/GIF in the overlay", "source", undefined);
        this.source = source;
    }

    run() {
        let toBeShown = OBSHandle.getMediaByName(this.source);
        if (toBeShown !== null) {
            OBSHandle.displayImage(toBeShown);
        }
        return
    }
}


class Timeout extends ChatAction {
    target: any
    duration: timeout
    constructor({target, duration}) {
        super("Timeout", "Times a user out for 5 minutes", ["target", "duration"], undefined)
        this.target = target
        this.duration = duration;
    }

    async run({activation, user}) {
        let target = await ActionResources.searchForVariables({message: this.target, activation: activation, user: user})
        await ModHandle.timeoutByUsername(target, this.duration);
        return
    }
}

/**
 * Plays a video in the overlay
 * @param {string} source The video file we are playing
 */
class Video extends ChatAction implements VideoType {
    source: mediaName
    constructor({source}:BuildVideo) {
        super("Video", "Plays a video in the overlay", "source", undefined);
        this.source = source;
    }

    run() {
        let toBePlayed = OBSHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            OBSHandle.playVideo(toBePlayed);
        }
        return
    }
}


/**
 * Wait action. Waits a specified duration.
 * @param {number} time How long should we wait?
 */
class Wait extends ChatAction implements WaitType {
     wait: number
    constructor({wait}:WaitType) {
        super("Wait", "Waits a specific amount of time", "wait", undefined)
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

export {ActionResources, ApiRequestGet, Audio, ChatMessage, ImageGif, Timeout, Video, Wait}