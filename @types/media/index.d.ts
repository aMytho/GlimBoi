interface MediaType {
    name: mediaName;
    path: mediaPath;
    type: mediaType;
    /**
     * @deprecated
     */
    position?: mediaPosition;
    /**
     * Coordinates from the top-left corner of the media.
     */
    coordinates: [number, number];
    duration?: number
    height?: number;
    width?: number;
    scale?: number;
    volume?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;
    speed?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;
    center?: boolean;
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

/**
 * Version of the media overlay. 2 is the latest version.
 */
type mediaOverlayVersion = 1 | 2