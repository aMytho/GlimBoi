const mm = require("music-metadata");
let musicPlaylist = [], isPlaying = false;
let currentSongIndex = 0, volume = 0.5, repeatEnabled = false, shuffleEnabled = false;

/**
 * Loads the music program. Changes all of the UI elements to match what is currently playing.
 */
function loadMusicProgram() {
    document.getElementById("musicVolumeSlider").addEventListener("change", event => {
        document.getElementById("musicAudio").volume = Number(event.target.value);
        volume = Number(event.target.value);
        CacheStore.set("musicVolume", volume)
    })

    volume = CacheStore.get("musicVolume", 0.5, true)
    document.getElementById("musicVolumeSlider").value = volume

    if (musicPlaylist[currentSongIndex]) {
        for (let i = 0; i < musicPlaylist.length; i++) {
            let newSong = document.createElement("div");
            newSong.classList = "song";
            newSong.setAttribute("data-index", "3");
            let newIMG = document.createElement("img");
            newIMG.classList = "thumb"
            if (musicPlaylist[i].cover) {
                newIMG.src = `data:${musicPlaylist[i].format};base64,${musicPlaylist[i].cover.toString('base64')}`;
            } else {
                newIMG.src = "resIcons/music.png"
            }
            newSong.appendChild(newIMG);
            newSong.innerHTML += `
                                <div class="body">
                                    <h3 class="title">${musicPlaylist[i].name}</h3>
                                    <p class="author">${musicPlaylist[i].artists}</p>
                                    <i class="fas fa-play fa-md" aria-hidden="true" onclick="playSongFromFolder(this, true)"></i>
                                </div>`
            document.getElementById("musicPlaylist").appendChild(newSong)
        }
        if (isPlaying) {
            document.getElementById("playPauseIcon").classList = "fas fa-pause fa-lg"
        } else {
            document.getElementById("playPauseIcon").classList = "fas fa-play fa-lg"
        }
        updateInfo(musicPlaylist[currentSongIndex])
    }


    $('[data-toggle="tooltip"]').tooltip()
    if (shuffleEnabled) {
        document.getElementById("shuffleButton").setAttribute("data-original-title", "Shuffle Enabled")
    }
    if (repeatEnabled) {
        document.getElementById("repeatButton").setAttribute("data-original-title", "Repeat Enabled")
    }

    document.getElementById("pathOfMusicOverlay").innerText = appData[0] + "\\chatbot\\lib\\OBS\\musicOverlay.html"
}

/**
 * Loads all of the songs.
 * @param {FileList} files The list of files
 */
async function loadSongs(files) {
    musicPlaylist = [];
    files = files;
    document.getElementById("musicPlaylist").innerHTML = ""
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
            let newName = song.name.slice(0, song.name.indexOf("."))
            let newSong = document.createElement("div");
            newSong.classList = "song";
            newSong.setAttribute("data-index", "3");
            let newIMG = document.createElement("img");
            newIMG.classList = "thumb"
            if (songCover) {
                newIMG.src = `data:${songCover[1]};base64,${songCover[0].toString('base64')}`;
            } else {
                newIMG.src = "resIcons/music.png"
            }
            newSong.appendChild(newIMG);
            newSong.innerHTML += `
                                <div class="body">
                                    <h3 class="title">${newName}</h3>
                                    <p class="author">${artists}</p>
                                    <i class="fas fa-play fa-md" aria-hidden="true" onclick="playSongFromFolder(this, true)"></i>
                                </div>`
            document.getElementById("musicPlaylist").appendChild(newSong)
            musicPlaylist.push({ name: newName, path: song.path, artists: artists, cover: songCover[0], format: songCover[1] })
        } catch (e) {
            console.log(e);
        }
    }
    if (files.length > 0) {
    playSong(0, true);
    document.getElementById("musicFolderUpload").value = ""
    CacheStore.set("lastPlayed", musicDirectory.substring(0, musicDirectory.lastIndexOf(lastSong) - 1))
    }
}

/**
 * Pauses or resumes the music.
 */
async function toggleMusic() {
    try {
    let audioExists = document.getElementById("musicAudio");
    let playPauseIcon = document.getElementById("playPauseIcon");
    let progressBar = document.getElementById("progressBarMusic");
    if (isPlaying) {
        audioExists.pause();
        progressBar.style.animationPlayState = "paused"
        playPauseIcon.classList = "fas fa-play fa-lg";
        isPlaying = false
    } else if (isPlaying == false && audioExists.src !== "") {
        await audioExists.play();
        progressBar.style.animationPlayState = "running"
        playPauseIcon.classList = "fas fa-pause fa-lg";
        isPlaying = true;
    }
    } catch(e) {
        if (isPlaying) {
            document.getElementById("musicAudio").pause();
            isPlaying = false
        } else if (isPlaying == false && audioExists.src !== "") {
            await document.getElementById("musicAudio").play();
            isPlaying = true;
        }
    }
}

/**
 * Plays the last or next song.
 * @param {string} direction "Foward" or "Backward"
 */
function nextOrPrevious(direction) {
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
 */
function updateInfo(info) {
    let artistsMedia = info.artists ? `Now playing ${info.name} by ${info.artists}` : `Now playing ${info.name}`;
    let artistsDisplay = info.artists ? info.artists : `No artists in metadata`;
    try {
        let progressPercantage = document.getElementById("progressBarMusic");
        progressPercantage.classList.remove("prog-bar-inner");
        void progressPercantage.offsetWidth;
        progressPercantage.classList.add("prog-bar-inner");
        progressPercantage.style.animationDuration = `${Math.round(document.getElementById("musicAudio").duration - document.getElementById("musicAudio").currentTime)}s`;
        progressPercantage.style.animationPlayState = "running"
        document.getElementById("songTitle").innerText = info.name
        document.getElementById("songAuthor").innerText = artistsDisplay
        try {
            document.getElementById("artForMusic").src = `data:${info.format};base64,${info.cover.toString('base64')}`;
        } catch (e) {
            document.getElementById("artForMusic").src = "resIcons/music.png"
        }
        let allSongs = document.getElementsByClassName("song");
        for (let i = 0; i < allSongs.length; i++) {
            allSongs[i].classList.remove("active");
            if (allSongs[i].children[1].children[0].innerText == info.name) {
                allSongs[i].classList.add("active")
            }
        }
    } catch(e) {}
    OBSHandle.playSong({ name: info.name, artists: info.artists });
    if (settings.music.chatAttribution && ChatHandle.isConnected()) {
        ChatMessages.filterMessage(artistsMedia, "glimboi");
    }
    if (settings.music.writeToFile) {
        fs.writeFile(appData[1] + '/data/nowPlaying.txt', artistsMedia, function (err, data) { });
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
async function playSong(songIndex, fadeIn) {
    currentSongIndex = songIndex;
    let musicAudio = document.getElementById("musicAudio");
    musicAudio.src = musicPlaylist[songIndex].path;
    musicAudio.volume = volume;
    await musicAudio.play()
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
        document.getElementById("playPauseIcon").classList = "fas fa-pause fa-lg";
    } catch(e) {}
    updateInfo(musicPlaylist[songIndex]);
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
function toggleShuffleRepeat(type, value, name) {
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
function loadPreviousFolder() {
    let previouslyPlayed = CacheStore.get("lastPlayed", null, false)
    if (previouslyPlayed) {
        try {
            fs.readdir(previouslyPlayed, (err, files) => {
                let tempSongs = []
                files.forEach(file => {
                  tempSongs.push({path: previouslyPlayed + "/" + file, fileName: file})
                });
                console.log(tempSongs)
                if (tempSongs.length > 0) {
                    loadSongs(tempSongs)
                } else {
                    errorMessage("Glimboi was unable to find any songs in the folder.", "")
                }
              })
        } catch(e) {
            errorMessage("Glimboi was unable to load the last folder.", "The last directory used was not found.")
            console.log(e)
        }
    } else {
        errorMessage("GlimBoi cannot detect which folder was last played.", "Try playing a new folder. It will be automatically saved and preloaded for next time.")
    }
}