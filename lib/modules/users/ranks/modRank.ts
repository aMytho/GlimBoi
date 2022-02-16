import { UserRank } from "./defaultRank";

/**
 * The default middle rank
 */
export class ModRank extends UserRank {
    constructor() {
        super();
        this.rank = "Mod";
        this.rankTier = 2;
        this.canEditCommands = true;
        this.canRemoveCommands = true;
        this.canAddPoints = true;
        this.canEditPoints = true;
        this.canRemovePoints = true;
        this.canAddUsers = true;
        this.canEditUsers = true;
        this.canRemoveUsers = true;
        this.canAddQuotes = true;
        this.canEditQuotes = true;
        this.canRemoveQuotes = true;
        this.canControlMusic = true;
    }
}