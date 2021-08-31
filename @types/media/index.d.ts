interface MediaType {
    name: mediaName;
    path: mediaPath;
    type: mediaType;
    /**
     * @deprecated
     */
    position: mediaPosition;
    duration: number
}

interface AudioType extends MediaType {
    volume: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;
}

interface VideoType extends DisplayableMediaType {
    speed: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;
    volume: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;
}

interface DisplayableMediaType extends MediaType {
    height: number;
    width: number;
    scale: number;
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
type mediaWSSName = "soundEffect" | "imageGif" | "video"