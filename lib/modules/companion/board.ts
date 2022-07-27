export interface Board {
    id: number;
    name: string;
    buttons: Button[];
}

export interface Button {
    id: number;
    name: string;
    img: any;
    action: "runCommand" | "runMedia" | "sendMessage";
    data: ButtonAction
}

export type ButtonAction = {
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
}

export type BoardAction = "addBoard" | "removeBoard" | "editBoard" | "reset" | "getBoards";