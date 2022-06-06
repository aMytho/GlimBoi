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

function handleNewSubscriber(subscriber: string) {
    console.log(`${subscriber} has just subscribed to the stream!`);
    CommandHandle.TriggerHelper.checkContext("Subscribe", {user: subscriber});
    LogHandle.logEvent(
        {event: "New Subscriber", users: [subscriber],notification: `${subscriber} has just subscribed!`}
    );
}

function handleGiftSub(user: string, recipient) {
    recipient = recipient.slice(0, -1);
    console.log(`${user} has gifted a sub to ${recipient}`);
    CommandHandle.TriggerHelper.checkContext("Gift Sub", {user: user, recipient: recipient});
    LogHandle.logEvent(
        {event: "Gift Sub", users: [user, recipient], notification: `${user} has gifted a sub to ${recipient}!`}
    );
}

function handleDonation(user: string, amount) {
    amount = amount.slice(0, -1);
    console.log(`${user} just donated ${amount}. How very kind of them :)`);
    CommandHandle.TriggerHelper.checkContext("Donate", {user: user, amount: amount});
    LogHandle.logEvent(
        {event: "Donation", users: [user], data: {amount: amount}, notification: `${user} just donated ${amount}!`}
        );
}

function handleMoney(moneyEvent:Glimesh.ChatMessage) {
    let message = moneyEvent.message;
    if (message.includes("just subscribed")) {
        handleNewSubscriber(moneyEvent.user.username)
    } else if (message.includes("just gifted")) {
        let recipient = message.trim().split(" ")[5]
        handleGiftSub(moneyEvent.user.username, recipient)
    } else if (message.includes("just donated")) {
        let amount = message.trim().split(" ")[2];
        handleDonation(moneyEvent.user.username, amount)
    }
}

export {handleNewFollower, handleMoney}