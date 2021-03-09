/**
 * For all your caching purposes
 */
class DumbCacheStore {
    /**
     * Cache constructor
     */
    constructor() {
        this.cache = {};
    }

    /**
     * Sets a cache item
     *
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.cache[key] = value;
    }

    /**
     * Gets a key / value pair, sets the key if setDefault == true
     *
     * @param {string} key
     * @param {any} defaultValue
     * @param {any} setDefault
     *
     * @returns {any} returns null if undefined
     */
    get(key, defaultValue = null, setDefault = false) {
        var val = this.cache[key];

        if (!val) {
            if (setDefault) this.set(key, defaultValue);
            return defaultValue;
        }

        return val;
    }
}

module.exports = DumbCacheStore;
