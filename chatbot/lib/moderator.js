// This file handles filtering and mod actions.

var filterLevel = false;
var warnings = {};

function timeoutByUsername(type, user, origin, ID) {
    console.log(type + "timeout sent to " + user);
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        // The main difference is we have the ID and respond to the tm in chat.
        if (origin == "chat") {
            ApiHandle.timeoutUser(type, channelID, ID).then(data => handleTimeout(user, origin, data))
        } else {
        ApiHandle.getUserID(user).then(data => {
            if (typeof data == "number") {
                ApiHandle.timeoutUser(type, channelID, data).then(data => handleTimeout(user, origin, data))
            } else if (data == null) {
                console.log("The user doesn't exist.");
                errorMessageTM("Error: The user does not exist or you do not have permission to moderate.")
            } else {
                console.log("Error with timeout");
                errorMessageTM("Error: The user does not exist or you do not have permission to moderate.")
            }
        })
    }
    } else {
        console.log("No channel ID for timeout");
        errorMessageTM("You must be in a channel to use this feature.")
    }
    function errorMessageTM(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        }
    }
}

function handleTimeout(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with timeout");
        timeoutResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        timeoutResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Timeout Successful.");
        timeoutResult(user + " has been timed out.")
    }
    function timeoutResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {
            ChatHandle.filterMessage(user + " has been timed out for 5 minutes.", "glimboi")
        }
    }
}

function timeoutByUserID(type, ID, modal) {
    console.log(type + "timeout sent to user" + ID);
}

function banByUsername(user, origin) {
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
            if (typeof data == "number") {
                ApiHandle.banUser(channelID, data).then(data => handleBan(user, origin, data))
            } else if (data == null) {
                console.log("The user doesn't exist.");
                errorMessageBan("Error: The user does not exist or you do not have permission to moderate.")
            } else {
                console.log("Error with timeout");
                errorMessageBan("Error: The user does not exist or you do not have permission to moderate.")
            }
        })
    } else {
        console.log("No channel ID for ban");
        errorMessageBan("You must be in a channel to use this feature.")
    }
    function errorMessageBan(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        }
    }
}

function handleBan(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with ban");
        banResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        banResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Ban Successful.");
        banResult(user + " has been banned.")
    }
    function banResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {

        }
    }
}

function unBanByUsername(user, origin) {
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
            if (typeof data == "number") {
                ApiHandle.unBanUser(channelID, data).then(data => handleUnBan(user, origin, data))
            } else if (data == null) {
                console.log("The user doesn't exist.");
                errorMessageUB("Error: The user does not exist or you do not have permission to moderate.")
            } else {
                console.log("Error with unabn");
                errorMessageUB("Error: The user does not exist or you do not have permission to moderate.")
            }
        })
    } else {
        console.log("No channel ID for unban");
        errorMessageUB("You must be in a channel to use this feature.")
    }
    function errorMessageUB(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 4500);
        }
    }
}

function handleUnBan(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with unban");
        unBanResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        unBanResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Unban Successful.");
        unBanResult(user + "'s ban has been removed.")
    }
    function unBanResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {

        }
    }
}


var badWords = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];

/**
 * 
 * @param {string} user 
 * @param {string} message 
 */
function scanMessage(user, message, userID) {
    if (filterLevel == true) {
        // The user exists, in the future we would get their rank to determine the filter to check against
        message = message.split(" ");
        var badWordFound = false;
        // for every word...
        for (let index = 0; index < message.length && badWordFound == false; index++) {
            // compare against every bad word.
            for (let badWordArray = 0; badWordArray < badWords.length; badWordArray++) {
                if (message[index] == badWords[badWordArray]) {
                    console.log("Getting a bar of soap for " + user);
                    badWordFound = true;
                    timeoutByUsername("short", user, "chat", userID)
                    break
                }
            }
        }
    }
}

function updateFilter(status) {
    filterLevel = status;
    console.log("Filter status: " + status);
}

module.exports = { banByUsername, scanMessage, timeoutByUsername, timeoutByUserID, unBanByUsername, updateFilter }