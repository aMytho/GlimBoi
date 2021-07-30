// This file runs the glimrealm event.

let glimrealmUsers:userName[] = [];
let glimrealmStatus: glimRealmStatus = "ready";
let glimrealmTimer: NodeJS.Timeout = null
let glimrealmTimer2: NodeJS.Timeout = null
let glimrealmTimer3: NodeJS.Timeout = null

/**
 * Starts a glimrealm instance. Activated by !glimrealm
 */
 function startGlimrealm() {
    console.log("Opening the portal to the Glimrealm");
    glimrealmStatus = "active";
    let portalDuration = CacheStore.get("glimrealmDuration", 60000, true);
    glimrealmTimer = setTimeout(() => {
        if (!CacheStore.get("glimrealmQuiet", true, true)) {
            ChatMessages.filterMessage("The portal is beginning to destabilize...", "glimboi");
        }
        glimrealmTimer2 = setTimeout(() => {
            if (!CacheStore.get("glimrealmQuiet", true, true)) {
                ChatMessages.filterMessage("The portal is nearly closed. 20 seconds left!", "glimboi");
            }
            glimrealmTimer3 = setTimeout(() => {
                ChatMessages.filterMessage("Everyone has returned from the Glimrealm. Type !points to view your updated currency amount.", "glimboi");
                stopGlimrealm(false);
            }, portalDuration / 3);
        }, portalDuration / 3);
    }, portalDuration / 3);
}

/**
 * Gets the status of the portal.
 * @returns {glimRealmStatus}
 */
function getGlimrealmStatus(): glimRealmStatus {
    return glimrealmStatus
}
/**
 * See returns
 * @returns {array} Array of users who have entered the portal.
 */
function getGlimRealmUsers(): Array<string> {
    return glimrealmUsers
}

/**
 * Sets the users in glimrealm. This should be changed later
 * @param data Array of users who have entered the portal.
 */
function setGlimRealmUsers(data:userName[]) {
    glimrealmUsers = data
}

/**
 * Enters the world of the Glimdrops.
 * @param {string} user
 */
function glimDropRealm(user:userName, data:{points:number}) {
    var result = glimChance()!; // get a random effect
    console.log(result);
    ChatMessages.filterMessage(result.message, "glimboi"); // send the message to chat
    if (result.type == "add") {
        UserHandle.editUserPoints(user.toLowerCase(), data.points + result.result); // add the points
    } else {
        if (data.points - result.result <= 0) {
            UserHandle.editUserPoints(user.toLowerCase(), 0); // reset to 0
        } else {
            UserHandle.editUserPoints(user.toLowerCase(), data.points - result.result); // subtract points
        }
    }
}

/**
 * Opens a portal to glimrealm if no cooldown is active
 */
function openGlimRealm(fromUI?: boolean) {
    let portalStatus = getGlimrealmStatus();
    if (portalStatus == "active") {
        ChatMessages.filterMessage("The portal to the Glimrealm is already open! Type !portal to enter the world of the Glimdrops.");
        if (fromUI) {
            errorMessage("Glimrealm Error", "A session of Glimrealm is already active.");
        }
    } else if (portalStatus == "charging") {
        ChatMessages.filterMessage("The portal to Glimrealm is charging. You must wait until it finishes to enter the world of the Glimdrops.", "glimboi");
        if (fromUI) {
            errorMessage("Glimrealm Error", "Glimrealm is still on cooldown.")
        }
    } else if (portalStatus == "ready") {
        if (!EventHandle.isEventEnabled("glimrealm")) {
            ChatMessages.filterMessage("The portal to the Glimrealm is not enabled :glimcry: ...", "glimboi");
            if (fromUI) {
                errorMessage("Glimrealm Error", "The portal to the Glimrealm is not enabled. ...");
            }
            return
        }
        startGlimrealm();
        EventHandle.addEvent("glimrealm");
        ChatMessages.filterMessage("The portal to the Glimrealm has been opened! Type !portal to enter the world of the Glimdrops!", "glimboi");
        if (fromUI) {
            successMessage("Glimrealm Started", "The portal to the realm of the Glimdrops is now open.")
        }
    }
}

/**
 * Returns a random glimdrop event.
 */
function glimChance() {
    var number = Math.floor(Math.random()*35);
    switch (number) {
        case 0: return {message: "The Glimdrops are hiding. No adjustment in points.", result: 0, type: "add"}
        case 1: return {message: ":glimwow: got his Glimesh T-shirt! You gained 100 points.", result: 100, type: "add"}
        case 2: return {message: "You and :glimgype: got even more hyped! You gained 100 points!", result: 100, type: "add"}
        case 3: return {message: ":glimsad: is sad and you didn't do anything! You lost 50 points.", result: 50, type: "sub"}
        case 4: return {message: "You tripped over a Glimdrop. His friends didn't like that. You have lost 500 points!", result: 500, type: "sub"}
        case 5: return {message: "A Glimdrop hugs you. You have gained 100 points!", result: 100, type: "add"}
        case 6: return {message: ":glimsmile: You can't help but smile back. You gained 300 points!", result: 300, type: "add"}
        case 7: return {message: "A glimdrop won the lottery! He's feeling generous. You have gained 777 points!", result: 777, type: "add"}
        case 8: return {message: "A Glimdrop stole some points! You lost 100 points.", result: 100, type: "sub"}
        case 9: return {message: "A wild Glimdrop appears! He is friendly. You gained 200 points.", result: 200, type: "add"}
        case 10: return {message: "A wild Glimdrop appears! Oh no, he's coming straight toward you! ... You lost all your points.", result: 9000, type: "sub"}
        case 11: return {message: "You got a good nights rest. :glimsleepy: You gained 50 points.", result: 50, type: "sub"}
        case 12: return {message: "You watched your favorite streamer with your favorite Glimdrop. You gained 50 points! The other glimdrops were jealous. They [REDACTED]. Oh my... You lost a lot of points. ", result: 1000, type: "sub"}
        case 13: return {message: "A glimdrop is cozy next to the fire. You feel comforted. You gained 50 points.", result: 50, type: "add"}
        case 14: return {message: ":glimuwu: g o o d v i b e s You gained 50 points", result: 50, type: "add"}
        case 15: return {message: "You enjoyed some glimberry pie. The other Glimdrops didn't like that. You lost 100 points", result: 100, type: "sub"}
        case 16: return {message: "A group of Glimdrops got together and formed an alliance! You were not invited. You lost 200 points.", result: 200, type: "sub"}
        case 17: return {message: "A group of Glimdrops got together and formed an alliance! You joined them and took over the world. You gained 400 points!", result: 400, type: "add"}
        case 18: return {message: "The Glimdrops discovered glimberry pie, glimtaco, glimpizza, glimonade, glimcoffee, glimcake, and glimcheese! The glimdrops didn't like being turned into food. You lost 250 points.", result: 250, type: "sub"}
        case 19: return {message: "A Glimdrop discovered OBS. They became a top tier streamer! They made you a mod. You gained 100 points.", result: 100, type: "add"}
        case 20: return {message: "A Glimdrop is hungry. You were nearby. Oh no... You lost 300 points.", result: 300, type: "sub"}
        case 21: return {message: "A Glimdrop learned to fly! The Glimdrop didn't know how to land. You caught the Glimdrop and saved the day. You gained 300 points.", result: 300, type: "add"}
        case 22: return {message: "You introduce the Glimdrops to Glim-chan. You gained 200 points!", result: 200, type: "add"}
        case 23: return {message: "A Glimdrop evaporated! The other Glimdrops blame you. You lost 100 points.", result: 100, type: "sub"}
        case 24: return {message: "You became friends with a Glimdrop. You gained 75 points.", result: 75, type: "add"}
        case 25: return {message: "You teach a Glimdrop how to code and make a new feature for Glimesh! You gained 250 points", result: 250, type: "add"}
        case 26: return {message: ":glimtongue: You try some new food with Glimdrop. You gained 100 points.", result: 100, type: "add"}
        case 27: return {message: ":glimlove: You help two Glimdrops fall in love. After a year they get married and have more Glimdrops! You gain 500 points!", result: 500, type: "add"}
        case 28: return {message: ":glimangry: A Glimdrop is angry. You failed to calm it down. You lost 100 points", result: 100, type: "sub"}
        case 29: return {message: "A glimdrop discovered your stream and became a regular! You gained 100 points!", result: 100, type: "add"}
        case 30: return {message: ":glimcat: purrrrrrrrs softly next to you. You gain 200 points", result: 200, type: "add"}
        case 31: return {message: ":glimangry: enrages the other Glimdrops. They form a mob! Oh no, they don't like visitors... You lost 600 points", result: 600, type: "sub"}
        case 31: return {message: ":glimchicken: shows you chickencam! You spend the rest of the day watching together. You gained 300 points.", result: 300, type: "add"}
        case 32: return {message: ":glimlul: You lost :glimlul: points", result: 0, type: "add"}
        case 33: return {message: "You adopt :glimdog:! You gained 500 points", result: 500, type: "add"}
        case 34: return {message: ":glimdog: ran away! You lost 100 points", result: 100, type: "sub"}
    }
}

/**
 * Ends the game.
 * @param {boolean} manual Was this done manually?
 */
function stopGlimrealm(manual: boolean) {
    EventHandle.removeEvent("glimrealm");
    glimrealmUsers = [];
    clearTimeout(glimrealmTimer);
    clearTimeout(glimrealmTimer2);
    clearTimeout(glimrealmTimer3);
    glimrealmStatus = "ready"
    console.log("Glimrealm portal closed.");

    if (manual) {
        successMessage("Glimrealm Stopped", "Glimrealm has been stopped.");
        ChatMessages.filterMessage("Glimrealm has been stopped" ,"glimboi");
    }
}


export {glimDropRealm, getGlimrealmStatus, getGlimRealmUsers, openGlimRealm, setGlimRealmUsers, startGlimrealm, stopGlimrealm}