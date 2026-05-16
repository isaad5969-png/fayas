/* Simple in-memory rate limiter — no external dependency needed */
const store = new Map();

/**
 * @param {number} windowMs   - Time window in ms
 * @param {number} max        - Max requests per window
 * @param {string} [message]  - Error message
 */
function rateLimit({ windowMs = 60_000, max = 30, message = 'Trop de requêtes, réessayez plus tard.' } = {}) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count   = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    store.set(key, entry);

    res.setHeader('X-RateLimit-Limit',     max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset',     Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

/* Purge stale entries every 10 minutes to avoid memory leaks */
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}, 600_000).unref();

module.exports = { rateLimit };
