/**
 * For all your caching purposes
 */
 class DumbCacheStore {
    /**
     * Cache constructor
     */
    constructor() {
        this.path = appData[1] + "/data/cache.json";
        this.cache = this.#setFile(this.path);
    }

    /**
     * Sets a cache item
     *
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.cache[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.cache));
    }

    /**
     * Gets a key / value pair, sets the key if setDefault == true
     *
     * @param {string} key The value we are searching for
     * @param {any} defaultValue If the key doesn't exist we can create the key
     * @param {boolean} setDefault Should we create a new key if it doesn't exist?
     *
     * @returns {any} returns null if undefined
     */
    get(key, defaultValue = null, setDefault = false) {
        let val = this.cache[key];

        if (!val) {
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
    #setFile(path) {
        try {
            return JSON.parse(fs.readFileSync(path));
        } catch (e) {
            try {
                fs.writeFileSync(path, JSON.stringify({}));
                return JSON.parse(fs.readFileSync(path));
            } catch(e2) {
                fs.mkdirSync(appData[1] + '/data'); // Makes the folder
                fs.writeFileSync(path, JSON.stringify({}));
                return JSON.parse(fs.readFileSync(path));
            }
        }
    }
}

module.exports = DumbCacheStore;
