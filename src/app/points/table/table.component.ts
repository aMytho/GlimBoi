import { Component, OnInit } from '@angular/core';
import { UserManager } from 'src/app/core/users/user_manager.service';

@Component({
    selector: 'app-points-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
    pointData: {userName: string, points: number}[] = [];
    constructor(
        private userManager: UserManager
    ) { }

    async ngOnInit(): Promise<void> {
        // Get up to 10 users with the most points
        let users = await this.userManager.findByPoints(10);
        // Map the users to an array of objects with the user name and points
        this.pointData = users.map(user => {
            return {
                userName: user.userName,
                points: user.points
            };
        });
        // If there are less than 10 users in the database, fill the rest with default data.
        if (this.pointData.length < 10) {
            for (let i = this.pointData.length; i < 10; i++) {
                this.pointData.push({
                    userName: "Default",
                    points: 0
                });
            }
        };
    }
}