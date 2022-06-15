import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../core/settings/settings.service';
import { UserManager } from '../core/users/user_manager.service';
import { PointsForm } from './points.form';
import { PointsService } from './points.service';

@Component({
    selector: 'app-points',
    templateUrl: './points.component.html',
    styleUrls: ['./points.component.css']
})
export class PointsComponent implements OnInit {
    data: PointsForm
    model: PointsForm;
    loginFailed: boolean = false;
    totalPoints: number = 0;
    constructor(
        private settingsService: SettingsService,
        private userService: UserManager,
        private pointsService: PointsService,
    ) { }

    /**
     * Attempt to login.
     */
    async onSubmit() {
        // Check if the name is valid
        if (this.model.pointsName.length < 1) {
            this.loginFailed = true;
            return;
        }
        this.settingsService.setMultiple([
            {startingPoints: this.model.startingPoints},
            {earningPoints: this.model.earningPoints},
            {pointsName: this.model.pointsName}
        ]);

        console.log("Saved points settings");
        this.ngOnInit();
    }

    ngOnInit() {
        let [startingPoints, earningPoints, pointsName] = this.getCurrentSettings();
        this.data = new PointsForm(startingPoints, earningPoints, pointsName);
        this.model = new PointsForm(startingPoints, earningPoints, pointsName);
        this.getTotalPoints().then(data => {
            this.totalPoints = data;
        });
    }

    getCurrentSettings() {
        return [
            this.settingsService.get("startingPoints", 100),
            this.settingsService.get("earningPoints", 15),
            this.settingsService.get("pointsName", "Points")
        ]
    }

    async getTotalPoints() {
        let users = await this.userService.getAll();
        let totalPoints = users.reduce((acc: any, user: { points: any; }) => {
            return acc + user.points;
        }, 0);
        return totalPoints;
    }

    /**
     * Reload the points table.
     */
    reloadTable() {
        this.pointsService.reload.next(true);
    }
}
