const OBSHandle = require(appData[0] + "/chatbot/lib/OBS.js");
OBSHandle.updatePath(appData[1]);
let OBSTable

function loadOBSData() {
    $(document).ready(function () {
        prepMediaModals()
    	OBSTable = $("#obsResources").DataTable({
      		data: OBSHandle.getCurrentMedia(), // returns all the commands
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
    	});
  	});
}


function addMedia() {
    let mName = document.getElementById("addMediaName").innerText.trim()
    let media = document.getElementById("addMediaInput");
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
    if (OBSHandle.getMediaByName(mName) == null && mName !== "null") {
        OBSHandle.addMedia(mName, media.files[0].path, media.files[0].type, document.getElementById("addMediaPosition").value);
        OBSTable.row.add({ name: mName.toLowerCase(), type: media.files[0].type, path: media.files[0].path, position: document.getElementById("addMediaPosition").value })
        OBSTable.draw(); //Show changes
        $("#addMediaModal").modal("hide");
        document.getElementById("mediaAddModalContent").innerHTML = addMediaModal()
    } else {
        document.getElementById("addMediaError").innerText = "That media is already added.";
    }
}

function editMedia(name) {
    let mediaData = OBSHandle.getMediaByName(name);
    if (mediaData !== null) {
        document.getElementById("editMediaBody").innerHTML = fillMediaEdit(mediaData);
    } else {
        document.getElementById("editMediaError").innerText = "That media file does not exist."
    }
}

function editMediaCheck() {
    let newName = document.getElementById("mediaEditName").innerText.substring(4).trim().toLowerCase()
    let newPosition = document.getElementById("editMediaFileInput").value
    let newPath = document.getElementById("editMediaInput");
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

function removeMedia(media) {
    media = media.trim().toLowerCase()
    if (media.length == 0) {
        document.getElementById("RemoveMediaError").innerText = "You must enter a media name!"
        return
    } else {
        let deletedMedia = OBSHandle.getMediaByName(media);
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

function prepMediaModals() {
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
  	}).on('shown.bs.modal', function (e) {
    	let selectElement = document.getElementById("playAudioModalSelect");
        let audioItems = OBSHandle.getSounds();
        for (var i = 0; i < audioItems.length; i++) {
            let name = audioItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
  	})
    $('#playImageModal').on('hidden.bs.modal', function (e) {
    	document.getElementById("displayImageModalBody").innerHTML = imageResetModal()
  	}).on('shown.bs.modal', function (e) {
    	let selectElement = document.getElementById("playImageModalSelect");
        let imageItems = OBSHandle.getImages();
        let videoItems = OBSHandle.getVideos();
        imageItems = imageItems.concat(videoItems);
        for (var i = 0; i < imageItems.length; i++) {
            let name = imageItems[i].name
            selectElement.innerHTML += "<option value=\"" + name + "\">" + name + "</option>";
        }
  	})
}