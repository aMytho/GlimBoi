type eventName = "raffle" | "poll" | "glimrealm" | "bankheist" | "duel" | "glimroyale" | "giveaway" |
"gamble" | "eightBall" | "queue"

type BHStatus = "ready" | "prep" | "active" | "cooldown"
interface PollController {
    question: string;
    options: string[],
    responses: pollResponse[],
    status: pollStatus
}

type pollResponse = {user:string, vote: number}
type pollStatus = "ready" | "active" | "cooldown"
type pollResult = {message: string, chosen: string}

type glimRealmStatus = "ready" | "active" | "charging"

type duel = {user: string, opponent: string, status: "pending" | "cancelled" | "active", points: number}
type duelVictor = {winner: string, pointsWon: number, loser: string}

type glimRoyaleStatus = "pending" | "active" | "cooldown"
type glimRoyaleUser = {user: string, HP: number}
type glimRoyaleWeapon = {name: string, id: number, stats: glimRoyaleWeaponStats}
type glimroyaleTurn = {user: string, message: string}
interface glimRoyaleWeaponStats {
    damage: number,
    bonusHP: number,
}