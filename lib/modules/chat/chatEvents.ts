/**
 * Sens a follow message and alert if requested.
 * @param follower The user who followed
 */
function handleNewFollower(follower: string) {
    console.log(`${follower} has just followed the stream!`);
    if (CacheStore.get("followMessageEnabled", false)) {
        let message = CacheStore.get("followMessage", "Thanks for the follow $follower");
        message = message.replace("$follower", follower);
        ChatMessages.sendMessage(message);
    }

    if (CacheStore.get("streamlabsEnabled", false)) {
        let message = CacheStore.get("streamlabsMessage", "Thanks for the follow $follower");
        message = message.replace("$follower", `*${follower}*`);
        let StreamLabsModule:typeof import("../API/webhooks/streamlabs") = require(`${appData[0]}/modules/API/webhooks/streamlabs.js`);
        StreamLabsModule.triggerAlert(message, CacheStore.get("streamlabsToken", ""));
    }

    let message = CacheStore.get("followMessage", "Thanks for the follow $follower");
    message = message.replace("$follower", follower);
    CommandHandle.TriggerHelper.checkContext("Follow", {user: follower, message: message});
    LogHandle.logEvent({event: "New Follower", users: [follower], notification: `${follower} has just followed the stream!`});
}

export {handleNewFollower}