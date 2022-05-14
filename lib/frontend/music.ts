let musicPlaylist = [], isPlaying = false;
let currentSongIndex = 0, volume = 0.5, repeatEnabled = false, shuffleEnabled = false;

/**
 * Loads the music program. Changes all of the UI elements to match what is currently playing.
 */
function loadMusicProgram() {
    document.getElementById("musicVolumeSlider")!.addEventListener("change", event => {
        (document.getElementById("musicAudio") as HTMLAudioElement)!.volume = Number((event.target as HTMLInputElement).value);
        volume = Number((event.target as HTMLInputElement).value);
        CacheStore.set("musicVolume", volume)
    })
    volume = CacheStore.get("musicVolume", 0.5, true);
    (document.getElementById("musicVolumeSlider") as HTMLInputElement)!.value = `${volume}`;

    if (musicPlaylist[currentSongIndex]) {
        for (let i = 0; i < musicPlaylist.length; i++) {
            let newSong = document.createElement("div");
            newSong.className = "song";
            newSong.setAttribute("data-index", "3");
            let newIMG = document.createElement("img");
            newIMG.className = "thumb"
            if (musicPlaylist[i].cover) {
                newIMG.src = `data:${musicPlaylist[i].format};base64,${musicPlaylist[i].cover.toString('base64')}`;
            } else {
                newIMG.src = "../resources/img/music.png"
            }
            newSong.appendChild(newIMG);
            newSong.innerHTML += `
                                <div class="body">
                                    <h3 class="title">${musicPlaylist[i].name}</h3>
                                    <p class="author">${musicPlaylist[i].artists}</p>
                                    <i class="fas fa-play fa-md" aria-hidden="true" onclick="playSongFromFolder(this, true)"></i>
                                </div>`
            document.getElementById("musicPlaylist")!.appendChild(newSong)
        }
        if (isPlaying) {
            document.getElementById("playPauseIcon")!.className = "fas fa-pause fa-lg"
        } else {
            document.getElementById("playPauseIcon")!.className = "fas fa-play fa-lg"
        }
        updateInfo(musicPlaylist[currentSongIndex], false);
    }

    if (shuffleEnabled) {
        document.getElementById("shuffleButton")!.setAttribute("data-original-title", "Shuffle Enabled")
    }
    if (repeatEnabled) {
        document.getElementById("repeatButton")!.setAttribute("data-original-title", "Repeat Enabled")
    }

    document.getElementById("pathOfMusicOverlay")!.innerText = dirName.substring(0, dirName.indexOf('app.asar')) + 'app.asar.unpacked/src/overlays/musicOverlay.html';
    document.getElementById("musicNowPlayingPath")!.innerText = `${appData[1] + "/data/nowPlaying.txt"}`;
    viewOrChangeMusicSettings("view");
}

/**
 * Loads all of the songs.
 * @param {FileList} files The list of files
 */
async function loadSongs(files) {
    musicPlaylist = [];
    files = files;
    document.getElementById("musicPlaylist")!.innerHTML = ""
    let musicDirectory, lastSong
    for (let i = 0; i < files.length; i++) {
        let song = files[i]
        try {
            if (!files[i].type) {
                song.path = files[i].path
                song.name = files[i].fileName
            }
            musicDirectory = song.path
            lastSong = song.name
            let metadata = await mm.parseFile(song.path, { skipCovers: false });
            let artists, songCover;
            if (metadata.common.artists) {
                artists = metadata.common.artists.toString()
            } else {
                artists = ""
            }
            if (metadata.common.picture) {
                songCover = [metadata.common.picture[0].data, metadata.common.picture[0].format]
            } else {
                songCover = false
            }
            let newName = song.name.slice(0, song.name.lastIndexOf("."))
            let newSong = document.createElement("div");
            newSong.className = "song";
            newSong.setAttribute("data-index", "3");
            let newIMG = document.createElement("img");
            newIMG.className = "thumb"
            if (songCover) {
                newIMG.src = `data:${songCover[1]};base64,${songCover[0].toString('base64')}`;
            } else {
                newIMG.src = "../resources/img/music.png"
            }
            newSong.appendChild(newIMG);
            newSong.innerHTML += `
                                <div class="body">
                                    <h3 class="title">${newName}</h3>
                                    <p class="author">${artists}</p>
                                    <i class="fas fa-play fa-md" aria-hidden="true" onclick="playSongFromFolder(this, true)"></i>
                                </div>`
            document.getElementById("musicPlaylist")!.appendChild(newSong)
            musicPlaylist.push({ name: newName, path: song.path, artists: artists, cover: songCover[0], format: songCover[1] })
        } catch (e) {
            console.log(e);
        }
    }
    if (files.length > 0) {
        playSong(0, true);
        (document.getElementById("musicFolderUpload") as HTMLInputElement)!.value = ""
        CacheStore.set("lastPlayed", musicDirectory.substring(0, musicDirectory.lastIndexOf(lastSong) - 1))
    }
}

/**
 * Pauses or resumes the music.
 */
async function toggleMusic() {
    let audioExists = document.getElementById("musicAudio")! as HTMLAudioElement;
    try {
        let playPauseIcon = document.getElementById("playPauseIcon")!;
        let progressBar = document.getElementById("progressBarMusic")!;
        if (isPlaying) {
            audioExists.pause();
            progressBar.style.animationPlayState = "paused";
            playPauseIcon.className = "fas fa-play fa-lg";
            isPlaying = false
        } else if (isPlaying == false && audioExists.src !== "") {
            await audioExists.play();
            progressBar.style.animationPlayState = "running";
            playPauseIcon.className = "fas fa-pause fa-lg";
            isPlaying = true;
        }
    } catch (e) {
        if (isPlaying) {
            audioExists.pause();
            isPlaying = false
        } else if (isPlaying == false && audioExists.src !== "") {
            await audioExists.play();
            isPlaying = true;
        }
    }
}

/**
 * Plays the last or next song.
 * @param {string} direction "foward" or "backward"
 */
function nextOrPrevious(direction:skipOrPrevious) {
    let songToBePlayed = currentSongIndex;
    if (direction == "foward") {
        if (songToBePlayed + 1 >= musicPlaylist.length) {
            songToBePlayed = 0;
        } else {
            songToBePlayed = songToBePlayed + 1;
        }
    } else {
        if (songToBePlayed - 1 < 0) {
            songToBePlayed = 0;
        } else {
            songToBePlayed = songToBePlayed - 1;
        }
    }
    playSong(songToBePlayed);
}

/**
 * SHows the song info on the player and send info to the music settings.
 * @param {object} info The song info
 * @param {boolean} notMusicTab Is this function called because someone click on the tab?
 */
function updateInfo(info, notMusicTab) {
    let artistsMedia = info.artists ? `Now playing ${info.name} by ${info.artists}` : `Now playing ${info.name}`;
    let artistsDisplay = info.artists ? info.artists : `No artists in metadata`;
    try {
        let progressPercantage = document.getElementById("progressBarMusic")!;
        progressPercantage.classList.remove("prog-bar-inner");
        void progressPercantage.offsetWidth;
        progressPercantage.classList.add("prog-bar-inner");
        progressPercantage.style.animationDuration = `${Math.round((document.getElementById("musicAudio") as HTMLAudioElement)!.duration - (document.getElementById("musicAudio") as HTMLAudioElement)!.currentTime)}s`;
        progressPercantage.style.animationPlayState = "running"
        document.getElementById("songTitle")!.innerText = info.name
        document.getElementById("songAuthor")!.innerText = artistsDisplay
        try {
            (document.getElementById("artForMusic") as HTMLImageElement)!.src = `data:${info.format};base64,${info.cover.toString('base64')}`;
        } catch (e) {
            (document.getElementById("artForMusic") as HTMLImageElement)!.src = "../resources/img/music.png"
        }
        let allSongs = document.getElementsByClassName("song");
        for (let i = 0; i < allSongs.length; i++) {
            allSongs[i].classList.remove("active");
            if ((allSongs[i].children[1].children[0] as HTMLHeadElement).innerText == info.name) {
                allSongs[i].classList.add("active")
            }
        }
    } catch(e) {}
    Server.updateMusicOverlay({ name: info.name, artists: info.artists });
    if (CacheStore.get("musicAttribution", false) && ChatHandle.isConnected() && notMusicTab) {
        ChatMessages.sendMessage(artistsMedia, "glimboi");
    }
    if (CacheStore.get("musicFile", false) && notMusicTab) {
        fs.writeFile(appData[1] + '/data/nowPlaying.txt', artistsMedia);
    }
}

/**
 * Plays a new song.
 * @param {Element} info
 */
function playSongFromFolder(info) {
    let arrayIndex = Array.prototype.indexOf.call(info.parentElement.parentElement.parentElement.children, info.parentElement.parentElement)
    info.parentElement.parentElement.classList.add("active");
    playSong(arrayIndex)
}

/**
 * Plays a song
 * @param {number} songIndex The number that corresponds to the current song in a folder
 * @param {boolean} fadeIn Do we need to fade in as the song plays?
 */
async function playSong(songIndex:songIndex, fadeIn?:boolean) {
    currentSongIndex = songIndex;
    let musicAudio = document.getElementById("musicAudio")! as HTMLAudioElement;
    musicAudio.src = musicPlaylist[songIndex].path;
    musicAudio.volume = volume;
    await musicAudio.play();
    if (fadeIn && volume > 0) {
        musicAudio.volume = volume / 2 / 2;
        setTimeout(() => {
            musicAudio.volume = volume / 2;
        }, 400);
        setTimeout(() => {
            musicAudio.volume = volume;
        }, 800);
    }
    isPlaying = true
    musicAudio.removeEventListener("ended", musicEndedHandler);
    musicAudio.addEventListener("ended", musicEndedHandler);
    try {
        document.getElementById("playPauseIcon")!.className = "fas fa-pause fa-lg";
    } catch(e) {}
    updateInfo(musicPlaylist[songIndex], true);
}

/**
 * Runs when the song ends.
 */
function musicEndedHandler() {
    if (repeatEnabled) {
        playSong(currentSongIndex);
    } else if (shuffleEnabled) {
        playSong(Math.floor(Math.random()*musicPlaylist.length));
    } else {
        nextOrPrevious("foward");
    }
}

/**
 * Toggles shuffle or repeat
 * @param {HTMLElement} type HTML element to modif the toolip
 * @param {boolean} value What value the name needs to be
 * @param {string} name Whether it is a repeat or a shuffle change
 */
function toggleShuffleRepeat(type:HTMLElement, value:boolean, name: string) {
    if (value == false) {
        if (name == "Repeat") {
            repeatEnabled = !repeatEnabled
        } else {
            shuffleEnabled = !shuffleEnabled
        }
        try {
            type.setAttribute("data-original-title", name + " Disabled");
        } catch(e) {}
    } else {
        if (name == "Repeat") {
            repeatEnabled = !repeatEnabled
        } else {
            shuffleEnabled = !shuffleEnabled
        }
        try {
            type.setAttribute("data-original-title", name + " Enabled");
        } catch(e) {}
    }
}

/**
 * Loads the previous folder if we can pull it from the cache.
 */
async function loadPreviousFolder() {
    let previouslyPlayed = CacheStore.get("lastPlayed", null, false)
    if (previouslyPlayed) {
        try {
            let files = await fs.readdir(previouslyPlayed);
            let tempSongs = []
            files.forEach(file => {
                tempSongs.push({ path: previouslyPlayed + "/" + file, fileName: file })
            });
            console.log(tempSongs)
            if (tempSongs.length > 0) {
                loadSongs(tempSongs);
            } else {
                showToast("Glimboi was unable to find any songs in the folder.");
            }
        } catch (e) {
            errorMessage("Glimboi was unable to load the last folder.", "The last directory used was not found.");
            console.log(e);
        }
    } else {
        showToast("GlimBoi cannot detect which folder was last played. When you load a new folder it will be automatically saved and preloaded for next time.");
    }
}


function viewOrChangeMusicSettings(action: "view" | "change") {
    if (action == "view") {
        if (CacheStore.get("musicAttribution", false)) {
            document.getElementById("attributionMusicEnabled")!.toggleAttribute("checked");
        }
        if (CacheStore.get("musicFile", false, false)) {
            document.getElementById("fileMusicEnabled")!.toggleAttribute("checked");
        }
    } else {
        CacheStore.setMultiple([
            { musicAttribution: (document.getElementById("attributionMusicEnabled") as HTMLInputElement)!.checked },
            { musicFile: (document.getElementById("fileMusicEnabled") as HTMLInputElement)!.checked }
        ]);
    }
}