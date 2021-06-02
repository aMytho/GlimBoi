// File creates and runs actions for commands.

const ActionResources = require(appData[0] + "/chatbot/lib/commands/actionResources.js")

/**
 * A ChatAction is a class with instructions on what to do based on the action.
 * @param action The action that we need to build
 * @param effect What the action will accomplish
 */
class ChatAction {
    constructor(action, effect, info) {
        this.action = action;
        this.effect = effect;
        this.info = info;
    }
}

/** Chatmessage action. Sends a message to chat.
 * @param {string} message The message that will be sent to chat
 */
class ChatMessage extends ChatAction {
    constructor({message}) {
        super("ChatMessage", "Sends a message to chat", "message")
        this.message = message;
    }

    async run({activation, user}) {
        let chatMessage = await ActionResources.searchForVariables({activation: activation, user: user, message: this.message})
        ChatMessages.filterMessage(chatMessage, "glimboi");
        return chatMessage
    }
}

class Audio extends ChatAction {
    constructor({source}) {
        super("Audio", "Plays audio in the overlay", "source");
        this.source = source;
    }

    run(data) {
        let toBePlayed = OBSHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            OBSHandle.playSound(toBePlayed);
        }
        return data
    }
}

class ImageGif extends ChatAction {
    constructor({source}) {
        super("ImageGif", "Shows an image/GIF in the overlay", "source");
        this.source = source;
    }

    run(data) {
        let toBeShown = OBSHandle.getMediaByName(this.source);
        if (toBeShown !== null) {
            OBSHandle.displayImage(toBeShown);
        }
        return data
    }
}

class Video extends ChatAction {
    constructor({source}) {
        super("Video", "Plays a video in the overlay", "source");
        this.source = source;
    }

    run(data) {
        let toBePlayed = OBSHandle.getMediaByName(this.source);
        if (toBePlayed !== null) {
            OBSHandle.playVideo(toBePlayed);
        }
        return data
    }
}


/**
 * Wait action. Waits a specified duration.
 * @param {number} time How long should we wait?
 */
 class Wait extends ChatAction {
    constructor({wait}) {
        super("Wait", "Waits a specific amount of time", "wait")
        this.wait = Number(wait);
    }

    async run(data) {
        let wait = this.wait
        return new Promise(function(resolve) {
            setTimeout(resolve, wait * 1000);
        })
    }
}

module.exports = {Audio, ChatMessage, ImageGif, Video, Wait}