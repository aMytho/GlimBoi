import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FilesService } from '../files/files.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    path: string
    cache: any
    /**
     * Cache constructor
     */
    constructor(
        private fileService: FilesService
    ) {
        this.path = `${environment.appData[1]}/data/cache.test.json`;
        this.cache = {};
    }

    /**
     * Sets a cache item
     *
     * @param {string} key
     * @param {any} value
     */
    set(key: string, value: any) {
        this.cache[key] = value;
        this.fileService.writeFile(this.path, JSON.stringify(this.cache));
    }

    /**
     * Sets multiple cache items
     * @param {}[] keys
     */
    setMultiple(keys: {}[]) {
        let keysToSet = {};
        keys.forEach(key => {
            let keyToSet = Object.entries(key); // @ts-ignore
            keysToSet[keyToSet[0][0]] = keyToSet[0][1];
        });
        Object.assign(this.cache, keysToSet);
        this.fileService.writeFile(this.path, JSON.stringify(this.cache));
    }

    /**
     * Gets a key / value pair, sets the key if setDefault == true
     * @param {string} key The value we are searching for
     * @param {any} defaultValue If the key doesn't exist we can create the key
     * @param {boolean} setDefault Should we create a new key if it doesn't exist?
     * @returns {any} returns null if undefined
     */
    get(key: string, defaultValue:any = null, setDefault = false) {
        let val = this.cache[key];

        if (val == undefined) {
            if (setDefault) this.set(key, defaultValue);
            return defaultValue;
        }

        return val;
    }

    /**
     * Gets (or sets) the file that stores the cache data. Created if it does not yet exist.
     * @param {string} path The path to the cache file
     * @returns {object} The cache data
     */
    async setFile() {
        try {// @ts-ignore
            this.cache = JSON.parse(await fs.readFile(this.path)); // Reads the cache file
        } catch (e) {
            try {
                await this.fileService.writeFile(this.path, JSON.stringify({}));// @ts-ignore if it doesn't exist, create it
                this.cache = JSON.parse(await fs.readFile(this.path));
            } catch (e2) {
                this.cache = {}; // If something goes wrong, just return an empty object
            }
        } finally {
            const migrations = require(`${environment.appData[0]}/migrations.js`);
            let migrateData = await migrations.migrate({
                mediaVersion: this.get("mediaVersion", 2),
                serverUrl: this.get("serverUrl", "localhost"),
                serverPort: this.get("serverPort", 3000)
            });
            // TODO SAVE DATA
        }
    }
}
