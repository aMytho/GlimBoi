interface RankType {
    rank:rankName
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
}


type rankName = "user" | "Mod" | "Streamer" | string
type rankProperties = "canAddCommands" | "canEditCommands"

declare module "RankHandle" {
    export function rankController(user:userName, action:string, type:string): Promise<boolean | null>
}