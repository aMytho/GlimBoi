
async function loadAddModal() {
    let data = await fs.readFile(dirName + `/html/media/addMedia.html`);
    document.getElementById(`mediaContent`)!.innerHTML = data.toString();
    preventText("add");
    prepareMedia("add")
}

async function loadEditModal(media: MediaType) {
    let data = await fs.readFile(dirName + `/html/media/editMedia.html`);
    document.getElementById(`mediaContentEdit`)!.innerHTML = data.toString();
    preventText("edit");
    prepareMedia("edit");

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
 * Make sure the user can't enter text into number fields
 * @param mode
 */
function preventText(mode) {
    $(`#${mode}MediaPositionX`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
    });
    $(`#${mode}MediaPositionY`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
    });
    $(`#${mode}MediaDuration`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    $(`#${mode}MediaVolume`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    $(`#${mode}MediaHeight`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    $(`#${mode}MediaWidth`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    $(`#${mode}MediaScale`).keypress(function (e) {
        // @ts-ignore
        if (isNaN(String.fromCharCode(e.which)) && e.which !== 46) e.preventDefault();
    });
    setTimeout(() => {
        $(`#${mode}OpenMenu`).click()
    }, 700);
}


function prepareMedia(mode) {
    // Activates all bootstrap tooltips
    $('[data-toggle-second="tooltip"]').tooltip();
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
                $(`#${mode}MediaModal`).modal("hide");
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
                $(`#${mode}MediaModal`).modal("hide");
            }
        } else {
            console.log("Media is not valid.");
            return
        }
    }
}

export { loadAddModal, loadEditModal }