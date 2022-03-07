interface MediaType {
    /**
     * The name of the media
     */
    name: string;
    /**
     * The file path to the media
     */
    path: string;
    /**
     * The type of media
     */
    type: string;
    /**
     * @deprecated
     */
    position?: string;
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

type mediaWSSName = "soundEffect" | "imageGif" | "video"

/**
 * Version of the media overlay. 3 is the latest version.
 */
type mediaOverlayVersion = 1 | 2 | 3