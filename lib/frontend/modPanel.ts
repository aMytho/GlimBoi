// File controls the mod panel UI

function addBannedWords(words:string) {
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement;
    document.getElementById("addWordSuccessMessage").innerText = "";
    document.getElementById("addWordErrorMessage").innerText = "";
    words = strip(words).replace(/\s{2,}/g, ' ').trim();
    if (words.length == 0) {
        document.getElementById("addWordErrorMessage").innerText = "No words were added.";
        return
    }
    let wordsToAdd = [...new Set(words.split(" "))]
    for (let i = 0; i < wordsToAdd.length; i++) {
        console.log(wordsToAdd);
        let resultOfListModification = ModHandle.checkBannedWordAndModify(wordsToAdd[i].trim(), "add");
        if (resultOfListModification !== true) {
            document.getElementById("addWordErrorMessage").innerText = resultOfListModification;
            return
        } else {
            let listItem = document.createElement("li");
            listItem.innerText = wordsToAdd[i];
            wordList.appendChild(listItem);
            (document.getElementById("wordAddInput") as HTMLInputElement).value = (document.getElementById("wordAddInput") as HTMLInputElement).value.replace(wordsToAdd[i], "");
            wordList.scrollTo(0, wordList.scrollHeight);
        }
    }
    document.getElementById("addWordSuccessMessage").innerText = "Words added to filter."
}

function removeBannedWords(words:string) {
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement
    document.getElementById("removeWordSuccessMessage").innerText = ""
    document.getElementById("removeWordErrorMessage").innerText = ""
    words = strip(words).replace(/\s{2,}/g, ' ').trim();
    if (words.length == 0) {
        document.getElementById("removeWordErrorMessage").innerText = "No words were removed."
        return
    }
    let wordsToRemove = [...new Set(words.split(" "))]
    for (let i = 0; i < wordsToRemove.length; i++) {
        console.log(wordsToRemove);
        let resultOfListModification = ModHandle.checkBannedWordAndModify(wordsToRemove[i], "remove");
        if (resultOfListModification !== true) {
            document.getElementById("removeWordErrorMessage").innerText = resultOfListModification;
            return
        } else {
            for (let j = 0; j < wordList.childElementCount; j++) {
                if ((wordList.children[j] as HTMLLIElement).innerText == wordsToRemove[i]) {
                    wordList.children[j].remove();
                    break;
                }
            }
            (document.getElementById("wordRemoveInput") as HTMLInputElement).value = (document.getElementById("wordRemoveInput") as HTMLInputElement).value.replace(wordsToRemove[i], "");
        }
    }
    document.getElementById("removeWordSuccessMessage").innerText = "Words removed."
}


function loadModPanel() {
    // Loads the warnings
    (document.getElementById("warning1") as HTMLInputElement)!.value = CacheStore.get("modWarning1", "none");
    (document.getElementById("warning2") as HTMLInputElement)!.value = CacheStore.get("modWarning2", "none");
    (document.getElementById("warning3") as HTMLInputElement)!.value = CacheStore.get("modWarning3", "none");
    (document.getElementById("warningMore") as HTMLInputElement)!.value = CacheStore.get("modWarningMax", "none");
    // Load logs
    LogHandle.getLogByType(["Ban User", "Delete Message", "Long Timeout User", "Short Timeout User", "UnBan User"]).then(data => {
        if (data !== null) {
            data.forEach(logItem => {
                logModAction(logItem);
            })
        }
    })
    $('#modalWordAdd').on('hidden.bs.modal', function (e) {
        (document.getElementById("wordAddInput") as HTMLInputElement).value = "";
    });
    $('#modalWordRemove').on('hidden.bs.modal', function (e) {
        (document.getElementById("wordRemoveInput") as HTMLInputElement).value = "";
    });
    $('#toggleFilter').on('show.bs.modal', function (e) {
        let filterStatusMessageSpan = document.getElementById("filterStatusTextModal")!;
        if (CacheStore.get("modFilterEnabled", false)) {
            filterStatusMessageSpan.style.color = "#7fffa0";
            filterStatusMessageSpan.innerText = "Enabled"
        } else {
            filterStatusMessageSpan.style.color = "#ff7f7f";
            filterStatusMessageSpan.innerText = "Disabled"
        }
    });
    // Loads the banned words
    return Promise.resolve().then(displayBannedWords);
}

function saveWarnings() {
    let warning1 = (document.getElementById("warning1") as HTMLInputElement)!.value as warningAction;
    let warning2 = (document.getElementById("warning2") as HTMLInputElement)!.value as warningAction;
    let warning3 = (document.getElementById("warning3") as HTMLInputElement)!.value as warningAction;
    let warningMax = (document.getElementById("warningMore") as HTMLInputElement)!.value as warningAction;
    CacheStore.setMultiple([
        {modWarning1: warning1},
        {modWarning2: warning2},
        {modWarning3: warning3},
        {modWarningMax: warningMax}
    ]);
}

function logModAction(action:LogType) {
    let modListActions = document.getElementById("musicPlaylist");
    let newModLog = document.createElement("div");
    newModLog.classList.add("song");
    newModLog.innerHTML = `
    <div class="body">
        <h3 class="title" style="color: red;">${action.event}</h3>
        <p class="author whiteText">${action.description}</p>
    </div>`
    modListActions.appendChild(newModLog);
}

function toggleFilter(toggle:boolean) {
    CacheStore.set("modFilterEnabled", toggle);
}

function displayBannedWords() {
    // Loads the list of words
    let wordList = document.getElementById("bannedWordListElement") as HTMLUListElement;
    wordList.innerHTML = "";
    let currentWords = ModHandle.getBannedWords();
    currentWords.forEach(function (word) {
        let listItem = document.createElement("li")
        listItem.innerText = word;
        wordList.appendChild(listItem);
    });
}