export interface Board {
    description: string;
    id: number;
    name: string;
    buttons: Button[];
    columns: number;
    rowHeight: number;
    squish: null;
}

export interface Button {
    id: string;
    name: string;
    img?: any;
    instructions: Instruction[];
    dimensions: {width: number, height: number, positionX: number, positionY: number};
    x: number;
    y: number;
    w: number;
    h: number;
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

export type Instruction = {
    action: string;
    data: ButtonAction
}

export type BoardAction = "addBoard" | "removeBoard" | "editBoard" | "reset" | "getBoards";