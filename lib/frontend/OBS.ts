OBSHandle.updatePath(appData[1]);
let OBSTable

function loadOBSData() {
    $(document).ready(async function () {
        prepMediaModals()
    	OBSTable = $("#obsResources").DataTable({
      		data: await OBSHandle.getAll(), // returns all the commands
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
                {
                    title: "Position",
                    data: "position",
              },
      		],
            pageLength: 25
    	});
        $('#obsResources tbody').on('click', 'tr', async function () {
            let data = OBSTable.row( this ).data();
            editMedia(data.name);
            $('#editMediaModal').modal("show");
        } );
  	});
}


async function addMedia() {
    let mName = document.getElementById("addMediaName").innerText.trim()
    let media = (document.getElementById("addMediaInput") as HTMLFormElement)
    if (mName == "" || mName == undefined || mName == null) {
        document.getElementById("addMediaError").innerText = "You must add a media name."
        document.getElementById("addMediaName").parentElement.classList.add("errorClass")
        return
    }
    if (media.files[0] == undefined || media.files[0] == null ) {
        document.getElementById("addMediaError").innerText = "You must add a media file."
        document.getElementById("addMediaInput").parentElement.classList.add("errorClass")
        return
    }
    console.log(mName, media);
    if (await OBSHandle.getMediaByName(mName) == null && mName !== "null") {
        OBSHandle.addMedia(mName, media.files[0].path, media.files[0].type, (document.getElementById("addMediaPosition") as HTMLSelectElement).value);
        OBSTable.row.add({ name: mName.toLowerCase(), type: media.files[0].type, path: media.files[0].path, position: (document.getElementById("addMediaPosition") as HTMLSelectElement).value })
        OBSTable.draw(); //Show changes
        $("#addMediaModal").modal("hide");
        document.getElementById("mediaAddModalContent").innerHTML = addMediaModal()
    } else {
        document.getElementById("addMediaError").innerText = "That media is already added.";
    }
}

async function editMedia(name) {
    let mediaData = await OBSHandle.getMediaByName(name);
    if (mediaData !== null) {
        document.getElementById("editMediaBody").innerHTML = fillMediaEdit(mediaData);
    } else {
        document.getElementById("editMediaError").innerText = "That media file does not exist."
    }
}

function editMediaCheck() {
    let newName = document.getElementById("mediaEditName").innerText.substring(4).trim().toLowerCase()
    let newPosition = (document.getElementById("editMediaFileInput") as HTMLInputElement).value
    let newPath = (document.getElementById("editMediaInput") as HTMLFormElement)
    console.log(newPosition, newPath)
    if (newName == "" || newName == undefined || newName == null) {
        document.getElementById("editMediaError").innerText = "You must have a media name."
        document.getElementById("editMediaName").parentElement.classList.add("errorClass")
        return
    }
    if (newPath.files[0] == undefined || newPath.files[0] == null ) {
        OBSHandle.editMedia(newName, null, null, newPosition);
    } else {
        OBSHandle.editMedia(newName, newPath.files[0].path, newPath.files[0].type, newPosition);
    }
    let indexes = OBSTable
      	.rows()
      	.indexes()
      	.filter(function (value, index) {
	    	return newName === OBSTable.row(value).data().name;
      	});
    	let row = OBSTable.row(indexes[0]);
    	let data = row.data();
    	data.position = newPosition;
        if (newPath.files[0] !== undefined && newPath.files[0] !== null) {
            data.path = newPath.files[0].path;
            data.type = newPath.files[0].type
        }
    	row.data(data).draw();
    $("#editMediaModal").modal("hide");
}

async function removeMedia(media) {
    media = media.trim().toLowerCase()
    if (media.length == 0) {
        document.getElementById("RemoveMediaError").innerText = "You must enter a media name!"
        return
    } else {
        let deletedMedia = await OBSHandle.getMediaByName(media);
        if (deletedMedia !== null) {
            OBSHandle.removeMedia(media);
            let filteredData = OBSTable
            .rows()
            .indexes()
            .filter(function (value, index) {
                return OBSTable.row(value).data().name == media;
            });
            OBSTable.rows(filteredData).remove().draw();
            $("#removeMediaModal").modal("hide");
        } else {
            document.getElementById("RemoveMediaError").innerText = "No media was found with that name."
        }
    }
}

async function displayMedia(media, source) {
    let content = await OBSHandle.getMediaByName(media);
    if (content == null) {
        if (source == "audio") {
            document.getElementById("errorDisplayMedia2").innerText = "The content type was not valid. Please select an audio file.";
        } else {
            document.getElementById("errorDisplayMedia").innerText = "The content type was not valid. Please select a video, image, or GIF.";
        }
    } else if(content.type.startsWith("image")) {
        OBSHandle.activateMedia(content, "imageGif");
    } else if (content.type.startsWith("video")) {
        OBSHandle.activateMedia(content, "video");
    } else if (content.type.startsWith("audio")) {
        OBSHandle.activateMedia(content, "soundEffect");
    }
}

async function prepMediaModals() {
    $('#addMediaModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("mediaAddModalContent").innerHTML = addMediaModal();
  	})
    $('#editMediaModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("mediaEditModalContent").innerHTML = editMediaModal();
  	})
    $('#removeMediaModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("mediaRemoveModalContent").innerHTML = removeMediaModal();
  	})
    $('#playAudioModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("audioBodyModal").innerHTML = audioResetModal()
  	}).on('shown.bs.modal', async function (e) {
    	let selectElement = document.getElementById("playAudioModalSelect");
        let audioItems = await OBSHandle.getMediaByType("audio");
        for (let i = 0; i < audioItems.length; i++) {
            let name = audioItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
  	})
    $('#playImageModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("displayImageModalBody").innerHTML = imageResetModal();
  	}).on('shown.bs.modal', async function (e) {
    	let selectElement = document.getElementById("playImageModalSelect");
        let imageItems = await OBSHandle.getMediaByType("image");
        let videoItems = await OBSHandle.getMediaByType("video");
        imageItems = imageItems.concat(videoItems);
        for (let i = 0; i < imageItems.length; i++) {
            let name = imageItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
  	})// Only works in production
    document.getElementById("pathOfOverlay").innerText = appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/index.html")
}