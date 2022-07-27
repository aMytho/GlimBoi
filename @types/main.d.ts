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
type CacheStore = typeof import("../lib/modules/cache")// @ts-ignore
type Server = typeof import("../lib/modules/server")// @ts-ignore
type Companion = typeof import("../lib/modules/companion/companion")// @ts-ignore
type Util = typeof import("../lib/modules/util/util")// @ts-ignore

type Type = typeof import("bootstrap")
type pageState = "home" | "commands" | "points" | "events" | "users" | "ranks" | "media" | "music" | "mod" | "settings" | "chat"
/**
 * TODO Find the location of this var. It exists but I can't find where it was defined.
 */
declare var dirName:string
/**
 * The first value has the app path, the second shows the path to the user data folder
 */
type appDataType = [string, string, boolean]