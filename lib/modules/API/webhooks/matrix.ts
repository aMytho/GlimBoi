/**
 * Sends a message to a room in matrix.
 * @param message The message to send. Default going live.
 * @param room The room to send the message to. Defaults to the room in integrations.
 */
async function sendMessage(message?: string, room?: string) {
    let accessToken = CacheStore.get("matrixToken", "");
    let roomName = room || CacheStore.get("matrixRoom", "");
    message = message || CacheStore.get("matrixMessage", "$streamer just went live at https://glimesh.tv/$streamer");
    message = message.replace(/\$streamer/g, ApiHandle.getStreamerName());
    const BASE_URL = `https://matrix.org/_matrix/client/r0/rooms/${roomName}/send/m.room.message?access_token=${accessToken}`;

    if (accessToken && roomName) {
        let request = await fetch(BASE_URL, {
            method: "POST",
            body: JSON.stringify({
                msgtype: "m.text",
                body: message,
            })
        });

        if (request.status == 200) {
            console.log("Matrix message sent successfully");
            showToast(`Matrix message sent successfully! Message: ${message}`)
        } else {
            console.log("Message failed", request);
            errorMessage("Matrix Error", "Message failed. Ensure you have entered a valid token, room, and userID.");
        }
    } else {
        errorMessage("Matrix Error",
        "Ensure the token, room, and user are saved. Add it on the integrations page!");
    }
}

export {sendMessage}