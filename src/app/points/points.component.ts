import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../core/settings/settings.service';
import { PointsForm } from './points.form';

@Component({
    selector: 'app-points',
    templateUrl: './points.component.html',
    styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {

    constructor(
        private settingsService: SettingsService
    ) { }

    /**
    * The form model.
    */
    model = new PointsForm(
        this.settingsService.get("startingPoints", 0),
        this.settingsService.get("earningPoints", 15),
        this.settingsService.get("pointsName", "Points")
    );

    /**
     * Is the login incorrect?
     */
    loginFailed = false;

    total = 0;

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

    }

    ngOnInit() {
        this.total = 100;
    }
}
