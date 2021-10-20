MediaHandle.updatePath(appData[1]);
let MediaTable;

function loadMediaTable() {
    $(document).ready(async function () {
        prepMediaModals()
        MediaTable = $("#obsResources").DataTable({
            data: await MediaHandle.getAll(), // returns all the commands
            columns: [
                {
                    title: "Asset Name",
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
            columnDefs: [
            ]
        });
        $('#obsResources').on('click', 'tbody tr', async function () {
            let data = MediaTable.row(this).data();
            let mediaToBeEditied = await MediaHandle.getMediaByName(data.name);
            const MediaUI: typeof import("../frontend/media/modalManager") = require(`${appData[0]}/frontend/media/modalManager.js`);
            MediaUI.loadEditModal(mediaToBeEditied);
            $('#editMediaModal').modal("show");
        });
    });
}

async function removeMedia(media) {
    media = media.trim().toLowerCase()
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
            $("#removeMediaModal").modal("hide");
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
        } else {
            document.getElementById("errorDisplayMedia").innerText = "The content type was not valid. Please select a video, image, or GIF.";
        }
    } else if (content.type.startsWith("image")) {
        Server.activateMedia(content, "imageGif");
    } else if (content.type.startsWith("video")) {
        Server.activateMedia(content, "video");
    } else if (content.type.startsWith("audio")) {
        Server.activateMedia(content, "soundEffect");
    }
}

async function prepMediaModals() {
    $('#addMediaButton').on('click', function (e) {
        const MediaUI: typeof import("../frontend/media/modalManager") = require(`${appData[0]}/frontend/media/modalManager.js`);
        MediaUI.loadAddModal();
    })
    $('#removeMediaModal').on('hidden.bs.modal', function (e) {
        document.getElementById("mediaRemoveModalContent").innerHTML = removeMediaModal();
    })
    $('#playAudioModal').on('hidden.bs.modal', function (e) {
        document.getElementById("audioBodyModal").innerHTML = audioResetModal()
    }).on('shown.bs.modal', async function (e) {
        let selectElement = document.getElementById("playAudioModalSelect");
        let audioItems = await MediaHandle.getMediaByType("audio");
        for (let i = 0; i < audioItems.length; i++) {
            let name = audioItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
    })
    $('#playImageModal').on('hidden.bs.modal', function (e) {
        document.getElementById("displayImageModalBody").innerHTML = imageResetModal();
    }).on('shown.bs.modal', async function (e) {
        let selectElement = document.getElementById("playImageModalSelect");
        let imageItems = await MediaHandle.getMediaByType("image");
        let videoItems = await MediaHandle.getMediaByType("video");
        imageItems = imageItems.concat(videoItems);
        for (let i = 0; i < imageItems.length; i++) {
            let name = imageItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
    })// Only works in production
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