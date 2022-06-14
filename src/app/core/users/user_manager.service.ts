import { Injectable } from '@angular/core';
import { DatabaseManager } from "../database/database_manager.service";
import { User } from './user.entity';
/**
 * Handles all user related operations.
 */
@Injectable({
    providedIn: 'root'
})
export class UserManager extends DatabaseManager {
    constructor() {
        super("users");
        console.log("UserManager loaded");
    }

    async addUser(username: string) {
        let newUser = new User(username, 5);
        await this.insertSingle(newUser);
    }

    findByUsername(username: string) {
        console.log(`Searching for user with username: ${username}`);
        return this.findSingle({ username: username });
    }

    getAll() {
        return this.getAllDocuments();
    }

    async findByPoints(count: number) {
        let users: User[] = await this.getAll();
        console.log(users)
        let sortedUsers = users.sort((a, b) => {
            return b.points - a.points;
        });
        return sortedUsers.slice(0, count);
    }
}