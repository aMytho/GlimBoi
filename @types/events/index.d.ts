type eventName = "raffle" | "poll" | "glimrealm" | "bankheist"

type BHStatus = "ready" | "prep" | "active" | "cooldown"
interface PollController {
    question: string;
    options: string[],
    responses: any[],
    results: any,
    users: userName[]
    cancel?(): any
}

type glimRealmStatus = "ready" | "active" | "charging"