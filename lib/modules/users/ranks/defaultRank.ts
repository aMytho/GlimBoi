/**
 * The base rank
 */
export class UserRank {
    rank: rankName
    rankTier: number;
    canAddCommands: boolean;
    canEditCommands: boolean;
    canRemoveCommands: boolean;
    canAddPoints: boolean;
    canEditPoints: boolean;
    canRemovePoints: boolean;
    canAddUsers: boolean;
    canEditUsers: boolean;
    canRemoveUsers: boolean;
    canAddQuotes: boolean;
    canEditQuotes: boolean;
    canRemoveQuotes: boolean;
    canControlMusic: boolean;
    modImmunity: boolean;
    canStartEvents: boolean;
    canEndEvents: boolean;

    constructor() {
        this.rank = "user";
        this.rankTier = 1;
        this.canAddCommands = true;
        this.canEditCommands = false;
        this.canRemoveCommands = false;
        this.canAddPoints = false;
        this.canEditPoints = false;
        this.canRemovePoints = false;
        this.canAddUsers = true;
        this.canEditUsers = false;
        this.canRemoveUsers = false;
        this.canAddQuotes = true;
        this.canEditQuotes = false;
        this.canRemoveQuotes = false;
        this.canControlMusic = false;
        this.modImmunity = false;
        this.canStartEvents = true;
        this.canEndEvents = false;
    }
}