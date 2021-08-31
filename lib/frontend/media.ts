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
                {
                    title: "Position",
                    data: "position",
              },
      		],
            pageLength: 25
    	});
        $('#obsResources tbody').on('click', 'tr', async function () {
            let data = MediaTable.row( this ).data();
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
    if (await MediaHandle.getMediaByName(mName) == null && mName !== "null") {
        MediaHandle.addMedia(mName, media.files[0].path, media.files[0].type, (document.getElementById("addMediaPosition") as HTMLSelectElement).value);
        MediaTable.row.add({ name: mName.toLowerCase(), type: media.files[0].type, path: media.files[0].path, position: (document.getElementById("addMediaPosition") as HTMLSelectElement).value })
        MediaTable.draw(); //Show changes
        $("#addMediaModal").modal("hide");
        document.getElementById("mediaAddModalContent").innerHTML = addMediaModal()
    } else {
        document.getElementById("addMediaError").innerText = "That media is already added.";
    }
}

async function editMedia(name) {
    let mediaData = await MediaHandle.getMediaByName(name);
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
        MediaHandle.editMedia(newName, null, null, newPosition);
    } else {
        MediaHandle.editMedia(newName, newPath.files[0].path, newPath.files[0].type, newPosition);
    }
    let indexes = MediaTable
      	.rows()
      	.indexes()
      	.filter(function (value, index) {
	    	return newName === MediaTable.row(value).data().name;
      	});
    	let row = MediaTable.row(indexes[0]);
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
    } else if(content.type.startsWith("image")) {
        MediaHandle.activateMedia(content, "imageGif");
    } else if (content.type.startsWith("video")) {
        MediaHandle.activateMedia(content, "video");
    } else if (content.type.startsWith("audio")) {
        MediaHandle.activateMedia(content, "soundEffect");
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