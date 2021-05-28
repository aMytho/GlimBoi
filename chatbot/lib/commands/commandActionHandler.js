// File creates and runs actions for commands.

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

    run(data) {
        ChatMessages.filterMessage(this.message, "glimboi");
        return this.message
    }
}

/**
 * Wait action. Waits a specified duration.
 * @param {number} time How long should we wait?
 */
class Wait extends ChatAction {
    constructor({time}) {
        super("Wait", "Waits a specific amount of time", "wait")
        this.wait = Number(time) * 1000;
    }

    async run(data) {
        await setTimeout(() => {}, this.wait);
        return data
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
            OBSHandle.playSound(toBeShown);
        }
        return data
    }
}

module.exports = {Audio, ChatMessage, ImageGif, Wait}