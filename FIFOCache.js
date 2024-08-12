class FIFOCache { // Thanks, AI for setting me free from the shackles of having to think to come up with a solution
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    has(key) {
        return this.cache.has(key);
    }

    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        return this.cache.get(key);
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, value);
    }
}

module.exports = FIFOCache;