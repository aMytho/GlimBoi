// File controls the mod panel UI

function addBannedWords(words:string) {
    words = strip(words).trim();
    if (words.length == 0) {
        document.getElementById("addWordErrorMessage").innerText = "No words were added."
        return
    }
    let wordsToAdd = new Set(words.split(" "));
    wordsToAdd.forEach(function(value) {
        if (!ModHandle.checkBannedWordAndModify(value, "add")) {
            document.getElementById("addWordErrorMessage").innerText = "One or more of the words was not added."
        }
    })
    document.getElementById("addWordSuccessMessage").innerText = ""
    document.getElementById("addWordSuccessMessage").innerText = "Words added to filter."
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement
    ModHandle.getFilter().forEach(function(word) {
        let listItem = document.createElement("li")
        listItem.innerText = word
        wordList.appendChild(listItem)
    })
}

function removeBannedWords(words:string) {
    words = strip(words).trim();
    if (words.length == 0) {
        document.getElementById("removeWordErrorMessage").innerText = "No words were removed."
        return
    }
    let wordsToRemove = new Set(words.split(" "));
    wordsToRemove.forEach(function(value) {
        if (!ModHandle.checkBannedWordAndModify(value, "remove")) {
            document.getElementById("removeWordErrorMessage").innerText += "\n" + value + " was not found";
        }
    })
    document.getElementById("removeWordSuccessMessage").innerText = "Words removed."
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement
    ModHandle.getFilter().forEach(function(word) {
        let listItem = document.createElement("li")
        listItem.innerText = word
        wordList.appendChild(listItem)
    })
}


function loadModPanel() {
    // Loads the warnings
    (document.getElementById("warning1") as HTMLInputElement)!.value = settings.Moderation.warning1;
    (document.getElementById("warning2") as HTMLInputElement)!.value = settings.Moderation.warning2;
    (document.getElementById("warning3") as HTMLInputElement)!.value = settings.Moderation.warning3;
    (document.getElementById("warningMore") as HTMLInputElement)!.value = settings.Moderation.warningAbove;
    // Loads the list of words
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement
    let currentWords = ModHandle.getFilter();
    currentWords.forEach(function(word) {
        let listItem = document.createElement("li")
        listItem.innerText = word
        wordList.appendChild(listItem)
    });
    LogHandle.getLogByType(["Ban User", "Delete Message", "Long Timeout User", "Short Timeout User", "UnBan User"]).then(data => {
        if (data !== null) {
            data.forEach(logItem => {
                logModAction(logItem);
            })
        }
    })
    $('#modalWordAdd').on('hidden.bs.modal', function (e) {
        document.getElementById("addWordModal").innerHTML = bannedWordAddReset()
    });
    $('#modalWordRemove').on('hidden.bs.modal', function (e) {
        document.getElementById("removeWordModal").innerHTML = bannedWordRemoveReset();
    });
    $('#toggleFilter').on('show.bs.modal', function (e) {
        let filterStatusMessageSpan = document.getElementById("filterStatusTextModal")!;
        if (settings.Moderation.filterEnabled) {
            filterStatusMessageSpan.style.color = "#7fffa0";
            filterStatusMessageSpan.innerText = "Enabled"
        } else {
            filterStatusMessageSpan.style.color = "#ff7f7f";
            filterStatusMessageSpan.innerText = "Disabled"
        }
    });
}

function saveWarnings() {
    let warning1 = (document.getElementById("warning1") as HTMLInputElement)!.value as warningAction;
    let warning2 = (document.getElementById("warning2") as HTMLInputElement)!.value as warningAction;
    let warning3 = (document.getElementById("warning3") as HTMLInputElement)!.value as warningAction;
    let warningMore = (document.getElementById("warningMore") as HTMLInputElement)!.value as warningAction;
    settings.Moderation.warning1 = warning1;
    settings.Moderation.warning2 = warning2;
    settings.Moderation.warning3 = warning3;
    settings.Moderation.warningAbove = warningMore;
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function () { });
}

function logModAction(action:LogType) {

}

function toggleFilter(toggle:boolean) {
    settings.Moderation.filterEnabled = toggle;
    fs.writeFile(appData[1] + '/data/settings.json', JSON.stringify(settings), function () { });
}