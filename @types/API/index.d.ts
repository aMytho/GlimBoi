declare module "ApiHandle" {
    export function banUser(channel:string, user:string):Promise<any>
    export function getUserID(user:string):Promise<number | string | null | {data:string, status: "AUTHNEEDED"}>
    export function getStreamerName(): string
}

declare interface AuthError {
    data: string;
    status: "AUTHNEEDED"
}