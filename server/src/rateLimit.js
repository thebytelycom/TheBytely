// Small in-memory limiter. Fine for one server; use Redis if you scale out.
const hits = new Map();

export function allow(key, limit, windowMs, now = Date.now()) {
  const entry = hits.get(key);
  if (!entry || now - entry.start >= windowMs) {
    hits.set(key, { start: now, count: 1 });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.start + windowMs - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimits() { hits.clear(); }

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now - v.start > 3600_000) hits.delete(k);
}, 600_000).unref();
