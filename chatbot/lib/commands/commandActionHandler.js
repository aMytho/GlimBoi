// File creates and runs actions for commands.

const ActionResources = require(appData[0] + "/chatbot/lib/commands/actionResources.js")

/**
 * A ChatAction is a class with instructions on what to do based on the action.
 * @param action The action that we need to build
 * @param effect What the action will accomplish
 * @param info What properties we read to use the action
 * @param varsToSet What variables the return value will be in
 */
class ChatAction {
    constructor(action, effect, info, varsToSet = []) {
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
class ChatMessage extends ChatAction {
    constructor({message}) {
        super("ChatMessage", "Sends a message to chat", "message", undefined)
        this.message = message;
    }

    async run({activation, user}) {
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
    constructor({url, headers, returns}) {
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
class Audio extends ChatAction {
    constructor({source}) {
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
class ImageGif extends ChatAction {
    constructor({source}) {
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

/**
 * Plays a video in the overlay
 * @param {string} source The video file we are playing
 */
class Video extends ChatAction {
    constructor({source}) {
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
 class Wait extends ChatAction {
    constructor({wait}) {
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

module.exports = {ActionResources, ApiRequestGet, Audio, ChatMessage, ImageGif, Video, Wait}