async function validateSettings(mode: "add" | "edit"): Promise<MediaType | false> {
    // Declares and obtains all the media settings
    let mediaName = (document.getElementById(`${mode}MediaName`) as HTMLInputElement).value.trim().toLowerCase();
    let mediaFile = (document.getElementById(`${mode}MediaInput`) as HTMLInputElement);
    let mediaPositionX: number | false | string = (document.getElementById(`${mode}MediaPositionX`) as HTMLInputElement).value.trim();
    let mediaPositionY: number | false | string = (document.getElementById(`${mode}MediaPositionY`) as HTMLInputElement).value.trim();
    let mediaDuration: number | false | string = (document.getElementById(`${mode}MediaDuration`) as HTMLInputElement).value.trim();
    let mediaVolume: number | false | string = (document.getElementById(`${mode}MediaVolume`) as HTMLInputElement).value;
    let mediaHeight: number | false | string = (document.getElementById(`${mode}MediaHeight`) as HTMLInputElement).value;
    let mediaWidth: number | false | string = (document.getElementById(`${mode}MediaWidth`) as HTMLInputElement).value;
    let mediaSpeed: number | false | string = (document.getElementById(`${mode}MediaSpeed`) as HTMLInputElement).value;

    // First we check the media name.
    mediaName = mediaName.replace(new RegExp("^[!]+"), "").trim(); // Removes the ! if it exists
    // Make sure they actually entered something
    if ((mediaName.length == 0 || mediaName == "!") && mode !== "edit") {
        errorMessageMediaModal("You must enter a media name", document.getElementById(`${mode}MediaName`), mode);
        return;
    } // Check to see if they are adding a media that already exists.
    let mediaExists = await MediaHandle.getMediaByName(mediaName);
    if (mediaExists !== null && mode !== "edit") {
        console.log(`The media ${mediaName} already exists`);
        errorMessageMediaModal("The media already exists", document.getElementById(`${mode}MediaName`), mode)
        return;
    }
    resetMessageMediaModal(document.getElementById(`${mode}MediaName`), mode);

    if (mediaFile.files[0] == undefined && mode !== "edit") {
        errorMessageMediaModal("You must select a media", document.getElementById(`${mode}MediaInput`), mode);
        return false;
    }
    resetMessageMediaModal(document.getElementById(`${mode}MediaInput`), mode);

    mediaPositionX = simpleNumberTest(mediaPositionX, "MediaPositionX", mode, false);
    if (mediaPositionX === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaPositionX`), mode);

    mediaPositionY = simpleNumberTest(mediaPositionY, "MediaPositionY", mode, false);
    if (mediaPositionY === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaPositionY`), mode);

    mediaDuration = simpleNumberTest(mediaDuration, "MediaDuration", mode, true, true);
    if (mediaDuration === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaDuration`), mode);

    mediaVolume = simpleNumberTest(mediaVolume, "MediaVolume", mode, true);
    if (mediaVolume === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaVolume`), mode);

    mediaHeight = simpleNumberTest(mediaHeight, "MediaHeight", mode, true, true);
    if (mediaHeight === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaHeight`), mode);

    mediaWidth = simpleNumberTest(mediaWidth, "MediaWidth", mode, true, true);
    if (mediaWidth === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaWidth`), mode);

    mediaSpeed = simpleNumberTest(mediaSpeed, "MediaSpeed", mode, true, true);
    if (mediaSpeed === false) return false;
    resetMessageMediaModal(document.getElementById(`${mode}MediaSpeed`), mode);

    // If we get here, we know that the media is valid.
    if (mode === "add") {
        return {
            name: mediaName, coordinates: [mediaPositionX, mediaPositionY], duration: mediaDuration, volume: mediaVolume,
            type: mediaFile.files[0].type, path: mediaFile.files[0].path, height: mediaHeight, width: mediaWidth, speed: mediaSpeed
        };
    } else {
        let existingMedia = await MediaHandle.getMediaByName(mediaName.toLowerCase());
        if (mediaFile.files[0] !== undefined) {
            existingMedia.type = mediaFile.files[0].type;
            existingMedia.path = mediaFile.files[0].path;
        }
        return {
            name: mediaName, coordinates: [mediaPositionX, mediaPositionY], duration: mediaDuration, volume: mediaVolume,
            type: existingMedia.type, path: existingMedia.path, height: mediaHeight, width: mediaWidth, speed: mediaSpeed
        };
    }
}


// Highlights the part that has the error
function errorMessageMediaModal(message: string, errLocation: HTMLElement, mode: "add" | "edit") {
    try {
        let mediaErrorMessage = document.createElement("li");
        mediaErrorMessage.innerHTML = message;
        document.getElementById(`${mode}MediaErrors`)!.appendChild(mediaErrorMessage);
        let partWithError = errLocation.parentElement;
        partWithError!.classList.add("errorClass");
    } catch (e) {
        console.log("error displaying source of error, probably fine")
    }
}


// Resets the error list
function resetMessageMediaModal(toBeReset: HTMLElement, mode: "add" | "edit") {
    try {
        toBeReset.parentElement!.classList.remove("errorClass");
        document.getElementById(`${mode}MediaErrors`)!.innerHTML = "";
    } catch (error) {
        console.log(error);
    }
}

/**
 * Tests if the number is a number
 */
function simpleNumberTest(varToTest: any, friendlyName: string, mode: "add" | "edit", optional: boolean, cannotBeZero?: boolean): number | false {
    if (optional && varToTest === "") return 0;
    varToTest = Number(varToTest);
    if (isNaN(varToTest) == true) { // Make sure it is a number
        errorMessageMediaModal(`${friendlyName} must be a number`, document.getElementById(`${mode}${friendlyName}`), mode);
        return false
    } else if (Math.sign(varToTest) == -1) { // Make sure it is positive
        errorMessageMediaModal(`${friendlyName} cannot be negative`, document.getElementById(`${mode}${friendlyName}`), mode);
        return false
    } else if (cannotBeZero && Math.sign(varToTest) == 0) { // Make sure it is positive
        errorMessageMediaModal(`${friendlyName} cannot be zero`, document.getElementById(`${mode}${friendlyName}`), mode);
        return false
    }
    return varToTest;
}

export { validateSettings }