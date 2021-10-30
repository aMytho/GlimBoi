/**
 * Sens a follow message and alert if requested.
 * @param follower The user who followed
 */
function handleNewFollower(follower: string) {
    console.log(`${follower} has just followed the stream!`);
    if (CacheStore.get("followMessageEnabled", false)) {
        let message = CacheStore.get("followMessage", "Thanks for the follow $follower");
        message = message.replace("$follower", follower);
        console.log(message, follower);
        ChatMessages.sendMessage(message);
    }

    if (CacheStore.get("streamlabsEnabled", false)) {
        let message = CacheStore.get("streamlabsMessage", "Thanks for the follow $follower");
        message = message.replace("$follower", `*${follower}*`);
        console.log(message, follower);
        ApiHandle.triggerAlert(message, CacheStore.get("streamlabsToken", ""));
    }
}

export {handleNewFollower}