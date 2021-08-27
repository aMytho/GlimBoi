type eventName = "raffle" | "poll" | "glimrealm" | "bankheist" | "duel" | "glimroyale" | "giveaway" |
"gamble"

type BHStatus = "ready" | "prep" | "active" | "cooldown"
interface PollController {
    question: string;
    options: string[],
    responses: pollResponse[],
    status: pollStatus
}

type pollResponse = {user:userName, vote: number}
type pollStatus = "ready" | "active" | "cooldown"
type pollResult = {message: string, chosen: string}

type glimRealmStatus = "ready" | "active" | "charging"

type duel = {user: userName, opponent: userName, status: "pending" | "cancelled" | "active", points: number}
type duelVictor = {winner: userName, pointsWon: number, loser: userName}

type glimRoyaleStatus = "pending" | "active" | "cooldown"
type glimRoyaleUser = {user: userName, HP: number}
type glimRoyaleWeapon = {name: string, id: number, stats: glimRoyaleWeaponStats}
type glimroyaleTurn = {user: userName, message: string}
interface glimRoyaleWeaponStats {
    damage: number,
    bonusHP: number,
}