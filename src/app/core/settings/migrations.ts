// File handles creating/deleting/updating files and folders

import { FilesService } from "../files/files.service";
import { environment } from 'src/environments/environment';
import { MigrationInfo } from "./migration_info";

export class Migrations {
    constructor(
        private fileService: FilesService,
    ) {}

    async migrate(userData: MigrationInfo) {
        let returnMigration = [];

        console.log("Checking for migrations");

        this.checkForScreenShots();

        let mediaMigration = await this.checkForMediaOverlay(userData);
        if (mediaMigration) {
            returnMigration.push(mediaMigration);
        }

        return returnMigration;
    }

    /**
 * Creates the screenshots folder if it doesn't exist
 */
    async checkForScreenShots() {
        try {
            await this.fileService.fileExists(`${environment.appData[1]}/screenshots`);
        } catch (e) {
            console.log("No screenshots found");
            this.fileService.makeDir(`${environment.appData[1]}/screenshots`);
        }
    }

    /**
     * Updates the media overlay file
     */
    async checkForMediaOverlay(mediaInfo: MigrationInfo) {
        try {
            let mediaVersion: number = mediaInfo.mediaVersion
            // Need an upgrade to 2
            if (mediaVersion <= 2) {
                console.log("Upgrading media overlay");
                let defaultFile = await this.fileService.readFile(environment.appData[0] + "/frontend/templates/connection.js");
                let defaultFileData = defaultFile.toString();
                let position = defaultFileData.indexOf("\n"); // Find the first new line
                if (position !== -1) {
                    defaultFileData = defaultFileData.substr(position + 1);
                    defaultFileData = "let url = `ws://" + mediaInfo.serverUrl + ":" + mediaInfo.serverPort + "`;\n" + defaultFileData;
                    this.fileService.writeFile(environment.appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
                } else {
                    throw "error with new line replacement in media file";
                }
                this.fileService.writeFile(environment.appData[0].replace("app.asar", "app.asar.unpacked").replace("build", "src/overlays/js/connection.js"), defaultFileData);
                mediaInfo.mediaVersion = 3;
                return { mediaInfo };
            } else {
                console.log("Media overlay is up to date");
            }
            return false;
        } catch (e) {
            console.log("Error checking for media overlay");
            console.log(e);
            return false;
        }
    }
}