import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database_manager.service';
import { Log } from './log.entity';

@Injectable({
    providedIn: 'root'
})
export class LoggingManagerService extends DatabaseManager {

    constructor() {
        super("logging");
        console.log("LoggingManager loaded");
    }

    async logEvent(data: any): Promise<void> {
        let event = new Log(data);
        console.log(`Logging event: ${event.event}`);
        this.insertSingle(event);
    }

    getLogByType(log: string | string[]): Promise<any> {
        return new Promise(resolve => {
            if (typeof log == "string") {
                this.findMultiple({ event: log }).then(result => {
                    resolve(result);
                });
            }
        });
    }
}
