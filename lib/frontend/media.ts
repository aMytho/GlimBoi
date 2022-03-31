MediaHandle.updatePath(appData[1]);
let MediaTable;
let MediaAddModal:Modal, MediaEditModal:Modal, MediaRemoveModal:Modal;

async function loadMediaTable() {
    prepMediaModals();
    MediaTable = $("#obsResources").DataTable({
        data: await MediaHandle.getAll(), // returns all the commands
        columns: [
            {
                title: "Media Name",
                data: "name",
            },
            {
                title: "Type",
                data: "type",
            },
            {
                title: "File Path",
                data: "path",
            },
        ],
        pageLength: 25,
    });
    $('#obsResources').on('click', 'tbody tr', async function () {
        let data = MediaTable.row(this).data();
        let mediaToBeEditied = await MediaHandle.getMediaByName(data.name);
        const MediaUI: typeof import("../frontend/media/modalManager") = require(`${appData[0]}/frontend/media/modalManager.js`);
        MediaUI.loadEditModal(mediaToBeEditied, MediaEditModal);
        MediaEditModal.show();
    });
}

async function removeMedia(media: string) {
    if (media.length == 0) {
        document.getElementById("RemoveMediaError").innerText = "You must enter a media name!"
        return
    } else {
        let deletedMedia = await MediaHandle.getMediaByName(media);
        if (deletedMedia !== null) {
            MediaHandle.removeMedia(media);
            let filteredData = MediaTable
                .rows()
                .indexes()
                .filter(function (value, index) {
                    return MediaTable.row(value).data().name == media;
                });
            MediaTable.rows(filteredData).remove().draw();
            MediaRemoveModal.hide();
        } else {
            document.getElementById("RemoveMediaError").innerText = "No media was found with that name."
        }
    }
}

async function displayMedia(media, source) {
    let content = await MediaHandle.getMediaByName(media);
    if (content == null) {
        if (source == "audio") {
            document.getElementById("errorDisplayMedia2").innerText = "The content type was not valid. Please select an audio file.";
            setTimeout(() => {
                document.getElementById("errorDisplayMedia2").innerText = "";
            }, 3500);
        } else {
            document.getElementById("errorDisplayMedia").innerText = "The content type was not valid. Please select a video, image, or GIF.";
            setTimeout(() => {
                document.getElementById("errorDisplayMedia").innerText = "";
            }, 3500);
        }
    } else if (content.type.startsWith("image")) {
        Server.activateMedia(content, "imageGif");
    } else if (content.type.startsWith("video")) {
        Server.activateMedia(content, "video");
    } else if (content.type.startsWith("audio")) {
        Server.activateMedia(content, "soundEffect");
    }
}

function prepMediaModals() {
    MediaAddModal = new Modal(document.getElementById("addMediaModal"), {
        onShow: () => {
            const MediaUI: typeof import("../frontend/media/modalManager") = require(`${appData[0]}/frontend/media/modalManager.js`);
            MediaUI.loadAddModal(MediaAddModal);
        },
        onHide: () => {
            document.getElementById("addMediaContent").innerHTML = "";
        }
    });
    MediaEditModal = new Modal(document.getElementById("editMediaModal"), {
        onHide: () => {
            document.getElementById("editMediaContent").innerHTML = "";
        }
    });
    MediaRemoveModal = new Modal(document.getElementById("removeMediaModal"), {
        onHide: () => {
            (document.getElementById("mediaRemoveInput") as HTMLSelectElement).value = "";
            document.getElementById("RemoveMediaError").innerText = "";
        }
    });

    document.getElementById("activateAddModal").addEventListener("click", () => MediaAddModal.show());
    document.getElementById("activateRemoveModal").addEventListener("click", () => MediaRemoveModal.show());
    document.getElementById("closeRemoveModal").addEventListener("click", () => MediaRemoveModal.hide());

    document.getElementById("activateAudioModal").addEventListener("click", async () => {
        let selectElement = document.getElementById("playAudioModalSelect");
        let audioItems = await MediaHandle.getMediaByType("audio");
        for (let i = 0; i < audioItems.length; i++) {
            let name = audioItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
    });
    document.getElementById("closeAudioModal").addEventListener("click", async () => {
        (document.getElementById("playAudioModalSelect") as HTMLSelectElement).innerHTML = "";
        // Add the default option
        let defaultOption = document.createElement("option");
        defaultOption.text = "Select audio";
        defaultOption.value = null;
        (document.getElementById("playAudioModalSelect") as HTMLSelectElement).add(defaultOption);
    });
    document.getElementById("closeImageModal").addEventListener("click", () => {
        (document.getElementById("playImageModalSelect") as HTMLSelectElement).innerHTML = "";
        // Add the default option
        let defaultOption = document.createElement("option");
        defaultOption.text = "Select an image, GIF, or video";
        defaultOption.value = null;
        (document.getElementById("playImageModalSelect") as HTMLSelectElement).add(defaultOption);
    });
    document.getElementById("activateImageModal").addEventListener("click", async () => {
        let selectElement = document.getElementById("playImageModalSelect");
        let imageItems = await MediaHandle.getMediaByType("image");
        let videoItems = await MediaHandle.getMediaByType("video");
        imageItems = imageItems.concat(videoItems);
        for (let i = 0; i < imageItems.length; i++) {
            let name = imageItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
    });

    // Only works in production
    document.getElementById("pathOfOverlay").innerText = appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/index.html")
}

async function saveMediaSettings(reset: boolean) {
    if (reset) {
        CacheStore.setMultiple([
            { serverPort: 3000 },
            { serverUrl: "localhost" },
        ])
    } else {
        CacheStore.setMultiple([
            { serverPort: parseInt((document.getElementById("mediaPort") as HTMLInputElement).value.trim()) },
            { serverUrl: (document.getElementById("mediaUrl") as HTMLInputElement).value.trim() },
        ])
    };

    let defaultFile = await fs.readFile(appData[0] + "/frontend/templates/connection.js");
    let defaultFileData = defaultFile.toString();
    try {
        let position = defaultFileData.indexOf("\n"); // Find the first new line
        if (position !== -1) {
            defaultFileData = defaultFileData.substr(position + 1);
            defaultFileData = "let url = `ws://" + CacheStore.get("serverUrl", "localhost") + ":" + CacheStore.get("serverPort", 3000) + "`;\n" + defaultFileData;
            console.log(defaultFileData);
            fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
        } else {
            throw "error with new line replacement in media file";
        }
    } catch (error) {
        console.log(error);
        fs.writeFile(appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
    }
}

function showMediaSettings() {
    (document.getElementById("mediaPort") as HTMLInputElement).value = CacheStore.get("serverPort", 3000).toString();
    (document.getElementById("mediaUrl") as HTMLInputElement).value = CacheStore.get("serverUrl", "localhost").toString();
}