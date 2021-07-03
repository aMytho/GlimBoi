interface MediaType {
    name: mediaName;
    path: mediaPath;
    type: mediaType;
    position: mediaPosition;
}

/**
 * The name of the media
 */
type mediaName = string
/**
 * The path to the media
 */
type mediaPath = string;
type mediaType = string;
type mediaPosition = string

declare module "OBSHandle" {
    /**
     * Searches for media and returns it. If none exist returns null
     * @param name The name of the media
     */
    export function getMediaByName(name: mediaName): MediaType | null
    /**
     * Returns the current media
     */
    export function getCurrentMedia(): Array<MediaType>
    /**
     * Loads the media DB
     */
    export function getAll(): MediaType[]
    /**
     * Returns all the videos
     */
    export function getVideos(): MediaType[]
    /**
     * Returns all the images/gifs
     */
    export function getImages(): MediaType[]
    /**
     * Returns all the sound effects
     */
    export function getSounds(): MediaType[]
    /**
     * Plays a sound in the overlay
     * @param sound The sound media info
     */
    export function playSound(sound: MediaType): void
    /**
     * Displays an image or GIF in the overlay
     * @param image The image media info
     */
    export function displayImage(image: MediaType): void
    /**
     * Plays a video in the ovarlay
     * @param video The video media info
     */
    export function playVideo(video: MediaType): void
    /**
     * Plays a song
     * @param song The song to play
     */
    export function playSong(song:any): void
    /**
     * Adds media to the database
     * @param {string} name The name of the media
     * @param {string} path Where the media is located
     * @param {string} type The type of media (img,gif,vid,etc)
     * @param {string} position The position to show it in the overlay (display elements only)
    */
    export function addMedia(name: mediaName, path: mediaPath, type: mediaType, position: mediaPosition): void
    /**
     * Edits media
     * @param name The name of the media
     * @param path The file path of the media
     * @param type The type of the media
     * @param position The position of the media
     */
    export function editMedia(name: mediaName, path: mediaPath, type: mediaType, position: mediaPosition): void
    /**
     * Removes media
     * @param media The name of the media name
     */
    export function removeMedia(media: mediaName): void
    /**
     * Sets the path to the db
     * @param updatedPath The path to the db
     */
    export function updatePath(updatedPath:string): void
    /**
     * Starts the overlay server
     */
    export function startServer(): void
}