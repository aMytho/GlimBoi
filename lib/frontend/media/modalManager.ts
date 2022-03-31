
async function loadAddModal(modal: Modal) {
    let data = await fs.readFile(dirName + `/html/media/addMedia.html`);
    document.getElementById(`addMediaContent`)!.innerHTML = data.toString();
    prepareModals("add", modal);
    prepareMedia("add", modal);
}

async function loadEditModal(media: MediaType, modal: Modal) {
    let data = await fs.readFile(dirName + `/html/media/editMedia.html`);
    document.getElementById(`editMediaContent`)!.innerHTML = data.toString();
    prepareModals("edit", modal);
    prepareMedia("edit", modal);

    // Set the media name
    (document.getElementById(`editMediaName`) as HTMLInputElement)!.value = media.name;

    if (media.coordinates) {
        (document.getElementById(`editMediaPositionX`) as HTMLInputElement)!.value = media.coordinates[0].toString();
        (document.getElementById(`editMediaPositionY`) as HTMLInputElement)!.value = media.coordinates[1].toString();
    } else {
        (document.getElementById(`editMediaPositionX`) as HTMLInputElement)!.value = "0";
        (document.getElementById(`editMediaPositionY`) as HTMLInputElement)!.value = "0";
    }

    if (media.duration) {
        (document.getElementById(`editMediaDuration`) as HTMLInputElement)!.value = media.duration.toString();
    } else {
        (document.getElementById(`editMediaDuration`) as HTMLInputElement)!.value = "7";
    }

    if (typeof media.volume === "number") {
        (document.getElementById(`editMediaVolume`) as HTMLInputElement)!.value = media.volume.toString();
        document.getElementById(`editMediaVolumeLabel`)!.innerText = media.volume.toString();
    } else {
        (document.getElementById(`editMediaVolume`) as HTMLInputElement)!.value = "5";
    }

    if (media.height) {
        (document.getElementById(`editMediaHeight`) as HTMLInputElement)!.value = media.height.toString();
    }

    if (media.width) {
        (document.getElementById(`editMediaWidth`) as HTMLInputElement)!.value = media.width.toString();
    }

    if (media.speed) {
        (document.getElementById(`editMediaSpeed`) as HTMLInputElement)!.value = media.speed.toString();
    } else {
        (document.getElementById(`editMediaSpeed`) as HTMLInputElement)!.value = "1";
    }

    let mediaCenterSelect = document.getElementById(`editMediaCenter`) as HTMLSelectElement;
    if (media.center) {
        mediaCenterSelect.innerHTML += "<option value=\"" + "true" + "\" selected>" + "Enabled" + "</option>";
        mediaCenterSelect.innerHTML += "<option value=\"" + "false" + "\">" + "Disabled (Default)" + "</option>";
    } else {
        mediaCenterSelect.innerHTML += "<option value=\"" + "false" + "\" selected >" + "Disabled (Default)" + "</option>";
        mediaCenterSelect.innerHTML += "<option value=\"" + "true" + "\">" + "Enabled" + "</option>";
    }
}

/**
 * Modal preparation work
 * @param mode
 */
function prepareModals(mode, modal: Modal) {
    document.getElementById(`${mode}CloseMediaModal`).addEventListener("click", () => modal.hide());
    setTimeout(() => {
        document.getElementById(`${mode}OpenMenu`).click();
    }, 700);
}


function prepareMedia(mode, modal: Modal) {
    // Adds media
    document.getElementById(`${mode}MediaButtonModal`)!.onclick = async function () {
        // First we check to make sure all the command settings are valid
        const mediaValidator: typeof import("../media/mediaValidator") = require(appData[0] + "/frontend/media/mediaValidator.js");
        let mediaSettings = await mediaValidator.validateSettings(mode);
        console.log(mediaSettings);
        if (mediaSettings) {
            console.log("All media settings are valid.");
            if (mode == "add") {
                MediaHandle.addMedia(mediaSettings);
                MediaTable.row.add({ name: mediaSettings.name.toLowerCase(), type: mediaSettings.type, path: mediaSettings.path})
                MediaTable.draw(); //Show changes
                modal.hide();
            } else {
                console.info("Media Edit Finished");
                MediaHandle.editMedia(mediaSettings);
                let indexes = MediaTable
                    .rows()
                    .indexes()
                    .filter(function (value, index) {
                        return (mediaSettings as MediaType).name === MediaTable.row(value).data().name;
                    });
                let row = MediaTable.row(indexes[0]);
                let data = row.data();
                data = { ...data, ...mediaSettings };
                console.log(data);
                row.data(data).draw();
                modal.hide();
            }
        } else {
            console.log("Media is not valid.");
            return
        }
    }
}

export { loadAddModal, loadEditModal }