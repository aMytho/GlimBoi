export interface IncomingPacket {
    action: "runCommand" | "runMedia" | "sendMessage" | "board";
    ID?: number;
    actionCompleted?: boolean;
    command?: {
        name: string;
        trigger: string;
        context: any;
    };
    media?: {
        name: string;
        type: string;
    };
    message?: {
        message: string;
    }
    board?: {
        name: string;
        id: number;
        buttons: any
    }
    request?: {
        type: requestType
    }
}

export type requestType = "getBoard" | "getBoards" | "addBoard" | "removeBoard" | "editBoard" | "reset"

export interface OutgoingPacket {
    ID?: number;
    board?: {
        name: string;
        id: number;
        buttons: any
    }
    boards?: {
        name: string;
        id: number;
        buttons: any
    }[];
}