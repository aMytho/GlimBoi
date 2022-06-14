import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';

/**
 * Handles all file operations. Proxy for fs
 */
@Injectable({
    providedIn: 'root'
})
export class FilesService {
    constructor(
        private electronService: ElectronService
    ) { }

    /**
     * Reads data from a file
     * @param path The path to the file
     * @returns The data in the file or null if error
     */
    readFile(path: string): Promise<string | null> {
        return new Promise(resolve => {
            this.electronService.fs.readFile(path, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                } else {
                    resolve(data.toString());
                }
            });
        })
    }

    /**
     * Writes data to a file
     * @param path THe path to the file
     * @param data The data to write to the file
     */
    writeFile(path: string, data: string): Promise<void> {
        return new Promise(resolve => {
            this.electronService.fs.writeFile(path, data, (err) => {
                if (err) {
                    console.log(err);
                }
                resolve();
            });
        })
    }

    /**
     * Checks if a file exists
     * @param path The path to the file
     * @returns True if the file exists, false if not
     */
    fileExists(path: string): Promise<boolean> {
        return new Promise(resolve => {
            this.electronService.fs.access(path, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Creates a directory
     * @param path The path to the directory
     */
    makeDir(path: string): Promise<void> {
        return new Promise(resolve => {
            this.electronService.fs.mkdir(path, (err) => {
                if (err) {
                    console.log(err);
                }
                resolve();
            });
        });
    }
}