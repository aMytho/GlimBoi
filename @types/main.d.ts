/// <reference path="users/index.d.ts" />
/// <reference path="deps/index.d.ts" />
/// <reference path="settings/index.d.ts" />
/// <reference path="API/index.d.ts" />
/// <reference path="commands/index.d.ts" />
/// <reference path="chat/index.d.ts" />
/// <reference path="media/index.d.ts" />
/// <reference path="events/index.d.ts" />
/// <reference path="music/index.d.ts" />
/// <reference types="datatables.net" />


// @ts-ignore
type ApiHandle = typeof import("../lib/modules/api")// @ts-ignore
type AuthHandle = typeof import("../lib/modules/auth")// @ts-ignore
type CommandHandle = typeof import("../lib/modules/commands")// @ts-ignore
type ActionCreator = typeof import("../lib/frontend/commands/actionCreator")// @ts-ignore
type UserHandle = typeof import("../lib/modules/users")// @ts-ignore
type RankHandle = typeof import("../lib/modules/users/userRank")// @ts-ignore
type MediaHandle = typeof import("../lib/modules/media")// @ts-ignore
type EventHandle = typeof import("../lib/modules/events")// @ts-ignore
type QuoteHandle = typeof import("../lib/modules/quotes")// @ts-ignore
type ChatHandle = typeof import("../lib/modules/chat")// @ts-ignore
type ChatChannels = typeof import("../lib/modules/chat/chatChannels")// @ts-ignore
type ModHandle = typeof import ("../lib/modules/modPanel")// @ts-ignore
type LogHandle = typeof import("../lib/modules/log")// @ts-ignore
type CacheStore = typeof import("../lib/modules/cache")

// @ts-ignore
declare var fs: typeof import("fs")
// @ts-ignore
declare var ipcRenderer: typeof import("electron").ipcRenderer
type Type = typeof import("bootstrap")
type pageState = "home" | "commands" | "points" | "events" | "users" | "ranks" | "media" | "music" | "mod" | "settings" | "chat"
declare var dirName:string
type appDataType = [string, string]
/**
 * The first value has the app path, the second shows the path to the user data folder
 */
// @ts-ignore
declare var appData: appDataTypeW
/**
 * Displays an error message to the user
 * @param errorType Type of the error
 * @param errorMessage The message to display to the user (how to fix it or more info)
 */
// @ts-ignore
declare function errorMessage(errorType: string | any, errorMessage?: string | any): void
/**
 * Shows a success message to the user
 * @param messageType Header Message
 * @param message The message to display to the user
 */
// @ts-ignore
declare function successMessage(messageType: string, message: string): void
/**
 * Sets the auth status message
 * @param stage The number to set the status as
 */
// @ts-ignore
declare function updateStatus(stage:authStatusNumber): void
/**
 * Adds a command to the table
 * @param param0 Command Info
 */
// @ts-ignore
declare function addCommandTable({commandName, uses, points, rank, actions}:CommandType): void
