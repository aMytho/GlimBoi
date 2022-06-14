import { Injectable } from '@angular/core';
import { DatabaseManager } from "../database/database_manager.service";
import { Command } from './command.entity';

/**
 * Handles all command related operations.
 */
@Injectable({
    providedIn: 'root'
})
export class CommandManager extends DatabaseManager {
    constructor() {
        super("commands");
        console.log("commands loaded");
    }

    async addCommand(c: string) {

    }

    async findCommand(command: string) {
        console.log(`Searching for command: ${command}`);
        let result = await this.findSingle({ commandName: command });
        if (result) {
            return result;
        }
        return null;
    }

    async getAll() {
        await this.getAllDocuments();
    }
}