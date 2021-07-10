const ModPowers: typeof import("../modules/moderation/modPowers") = require(appData[0] + "/modules/moderation/modPowers.js")

let bannedWordsDB:Nedb
let bannedWords: string[] = [];

/**
 * Function loads the filter and imports the default set if none exists.
 * @param {string} updatedPath The path to the DB
 */
function loadFilter(updatedPath:string) {
    bannedWordsDB = new Datastore({ filename: `${updatedPath}/data/bannedWordList.db`, autoload: true })
    bannedWordsDB.find({}, function(err: any, data:bannedWordsDB) {
        if (data.length == 0) {
            bannedWordsReset()
        } else {
            bannedWords = data[0].words
        }
    })
}

/**
 * Resets the list of banned words to the default set. Removes all user words.
 */
function bannedWordsReset() {
    return new Promise(resolve => {
        console.log(dirName, __dirname);
        fs.readFile(dirName + "\\../resources/json/defaultBannedWords.json", 'utf-8', function (err:NodeJS.ErrnoException, data:string) {
            if (err) {
                console.log("We couldn't get the default banned word file. " + err);
                errorMessage(err, "Failed to import the default list of banned words. Filter is not active.");
                resolve(null)
                return
            }
            // Removes all the entries from the database
            bannedWordsDB.remove({}, { multi: true }, function (err, numRemoved) {
                // Adds the new entries
                bannedWordsDB.insert({words: JSON.parse(data)}, function(err, data) {
                    console.log("Default banned word list imported and saved.");
                    bannedWords = data.words;
                    resolve(true)
                })
            });
        });
    })
}

/**
 * Adds or removes a word from the filter list
 * @param word The word to add/remove
 * @param wordAction add or remove
 * @returns Returns true if operation succeeded, and an error message if not
 */
function checkBannedWordAndModify(word: string, wordAction: bannedWordAction): true | string {
    if (wordAction == "add") {
        if (!bannedWords.includes(word)) {
            bannedWords.push(word);
            console.log(`Adding ${word} to the banned list`)
            bannedWordsDB.update({}, { $push: { words: word } }, {}, function () { })
            return true
        } else {
            return `${word} has already been added to the list.`
        }
    } else if (wordAction == "remove") {
        for (let i = 0; i < bannedWords.length; i++) {
            if (word == bannedWords[i]) {
                bannedWords.splice(i, 1);
                console.log(`Removing ${word} from the banned list.`)
                bannedWordsDB.update({}, { $pull: { words: word } }, {}, function () { })
                return true
            }
        }
        return `${word} does not exist in the list.`
    }
}

/**
 * Returns the banned words list.
 * @returns The list of banned words
 * @type string[]
 */
function getBannedWords(): string[] {
    return bannedWords
}

export {bannedWordsReset, checkBannedWordAndModify, getBannedWords, loadFilter, ModPowers}