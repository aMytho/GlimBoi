// This file handles all obs actions
let MediaDB:Nedb;

/**
 * Sets the path to the database
 * @param {string} updatedPath The path to the db
 */
function updatePath(updatedPath:string) {
    MediaDB = new Datastore({ filename: `${updatedPath}/data/obs.db`, autoload: true });
}

/**
 * Gets all of the Media data from the database
 */
function getAll(): Promise<MediaType[]> {
    return new Promise(resolve => {
        MediaDB.find({}, function (err: Error | null, docs: MediaType[]) {
            resolve(docs);
        });
    })
}

/**
 * Adds media to the database
 */
function addMedia({ name = "Default", path = "", type = "img/png", duration = undefined,
volume = 0.5, speed = 1, height = 0, width = 0, scale = 1, coordinates = [0,0], center = false } = {}) {
    if (duration == 0) {
        duration = undefined;
    }
    MediaDB.insert([
        {
            name: name.toLowerCase(), path: path, type: type, duration: duration,
            volume: volume, speed: speed, height: height, width: width, scale: scale,
            coordinates: coordinates, center: center
        }
    ], function (err, newDocs) {
        console.log(newDocs)
        console.log("Media added");
    });
}

/**
 * Edits media in the database
 */
function editMedia({ name = "Default", path = "", type = "img/png", duration = undefined,
    volume = 0.5, speed = 1, height = 0, width = 0, scale = 1, coordinates = [0, 0], center = false} = {}) {
    name = name.toLowerCase();
        if (duration == 0) {
            duration = undefined;
        }
    MediaDB.update({ name: name }, {
        $set: {
            path: path, type: type, duration: duration,
            volume: volume, speed: speed, height: height, width: width, scale: scale,
            coordinates: coordinates, center: center
        }
    }, {}, function (err, numReplaced) {
        console.log("Media updated");
    });
}

/**
 * Converts the media to the modern version 2.0+
 * @param param0
 * @returns
 */
function convertMedia({ name = "Default", path = "", type = "img/png", duration = undefined,
    volume = 0.5, speed = 1, height = 0, width = 0, scale = 1, coordinates = [0, 0], center = false} = {}) {
    return new Promise(resolve => {
        name = name.toLowerCase();
        MediaDB.update({ name: name }, {
            $set: {
                duration: duration, volume: volume, speed: speed, height: height, width: width,
                scale: scale, coordinates: coordinates, center: center
            }
        }, {}, function (err, numReplaced) {
            console.log("Media Converted");
            resolve(true)
        });
    })
}

/**
 * Removes media from the database
 * @param {string} media The name of the media
 */
function removeMedia(media: mediaName) {
    media = media.toLowerCase()
    MediaDB.remove({ name: media }, {}, function (err, numRemoved) {
        console.log("Media removed");
    })
}

/**
 * Searches for media and returns it
 * @param {string} name The name to search for
 * @returns {object} Returns an object if found, else null
 */
function getMediaByName(name: mediaName): Promise<MediaType> {
    name = name.toLowerCase();
    return new Promise(resolve => {
        MediaDB.find({ name: name }, function (err, docs: MediaType[]) {
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].name === name) {
                    resolve(docs[i]);
                }
            }
            resolve(null)
        });
    })
}

/**
 * Returns all the media that match the search term
 * @param type The type of media to search for
 */
function getMediaByType(type: mediaType): Promise<MediaType[]> {
    return new Promise(resolve => {
        let mediaArray = [];
        MediaDB.find({}, function (err, docs: MediaType[]) {
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].type.startsWith(type)) {
                    mediaArray.push(docs[i])
                }
            }
            resolve(mediaArray);
        });
    })
}

export {addMedia, convertMedia, editMedia, getAll, getMediaByName, getMediaByType, removeMedia, updatePath}