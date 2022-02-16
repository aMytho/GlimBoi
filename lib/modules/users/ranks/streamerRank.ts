import { ModRank } from "./modRank";

/**
 * The defualt top rank
 */
export class StreamerRank extends ModRank {
    constructor() {
        super();
        this.rank = "Streamer";
        this.rankTier = 3;
        this.modImmunity = true;
    }
}