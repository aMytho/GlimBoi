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

    async addCommand(command: Command) {
        await this.insertSingle(command);
        console.log(`Added command: ${command.commandName}`);
    }

    addDefaultTriggers(name:string) {
        this.update({ commandName: name }, {
            $set: {triggers: [{trigger: "ChatMessage", constraints: {startsWith: name}}]}
        });
    }

    async findCommand(command: string) {
        console.log(`Searching for command: ${command}`);
        let result = await this.findSingle({ commandName: command });
        return result ? result : null;
    }

    async findCommandByTrigger(trigger: string) {
        let commands: Command[] = await this.findMultiple({ triggers: { $elemMatch: { trigger: trigger } } });
        commands.map((cmd: Command) => {
            cmd.triggers = cmd.triggers.filter(trig => trig.trigger === trigger);
            return cmd;
        });
        return commands;
    }

    increaseCommandUsage(command: string) {
        this.update({ commandName: command }, { $inc: { uses: 1 } });
    }

    async getAll() {
        let commands = await this.getAllDocuments();
        return commands;
    }

    async removeCommand(command: string) {
        await this.remove({ commandName: command });
        console.log(`Removed command: ${command}`);
    }

    async setCommandStatus(command: string, status: boolean) {
        await this.update({ commandName: command }, { $set: { enabled: status } });
        console.log(`Set command status: ${command} to ${status}`);
    }
}