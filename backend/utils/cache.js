// Simple in-memory cache implementation
const cache = new Map()

module.exports = {
  // Get value from cache
  get: (key) => {
    const item = cache.get(key)
    if (!item) return null

    // Check if the item has expired
    if (item.expiry && item.expiry < Date.now()) {
      cache.delete(key)
      return null
    }

    return item.value
  },

  // Set value in cache with optional TTL in seconds
  set: (key, value, ttl = null) => {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null,
    }

    cache.set(key, item)
  },

  // Delete value from cache
  delete: (key) => {
    cache.delete(key)
  },

  // Clear entire cache
  clear: () => {
    cache.clear()
  },
}
