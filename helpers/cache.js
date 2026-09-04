const cache = new Map();

/**
 * Get item from cache
 * @param {string} key 
 */
const get = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

/**
 * Set item in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Time to live in seconds
 */
const set = (key, value, ttl = 300) => {
    cache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000
    });
};

/**
 * Delete item from cache
 * @param {string} key 
 */
const del = (key) => {
    cache.delete(key);
};

/**
 * Clear cache by prefix
 * @param {string} prefix
 */
const clearPrefix = (prefix) => {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
};

module.exports = {
    get,
    set,
    del,
    clearPrefix
};
