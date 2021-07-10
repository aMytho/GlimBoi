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