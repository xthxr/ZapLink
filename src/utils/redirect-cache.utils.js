const { getRedisClient } = require('./redis.utils');

const DEFAULT_TTL_SECONDS = Number.parseInt(process.env.REDIRECT_CACHE_TTL_SECONDS || '300', 10);
const CACHE_ENABLED = process.env.REDIRECT_CACHE_ENABLED !== 'false';
const REDIS_CONFIGURED = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const memoryCache = new Map();

function getMemoryEntry(shortCode) {
  const entry = memoryCache.get(shortCode);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(shortCode);
    return null;
  }

  return entry.value;
}

async function getRedisValue(shortCode) {
  if (!REDIS_CONFIGURED || !CACHE_ENABLED) {
    return null;
  }

  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(`redirect-cache:${shortCode}`);
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  } catch (error) {
    console.error('❌ Failed to read redirect cache from Redis:', error);
    return null;
  }
}

async function setRedisValue(shortCode, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!REDIS_CONFIGURED || !CACHE_ENABLED) {
    return false;
  }

  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.setex(`redirect-cache:${shortCode}`, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('❌ Failed to write redirect cache to Redis:', error);
    return false;
  }
}

async function deleteRedisValue(shortCode) {
  if (!REDIS_CONFIGURED || !CACHE_ENABLED) {
    return false;
  }

  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.del(`redirect-cache:${shortCode}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete redirect cache from Redis:', error);
    return false;
  }
}

async function get(shortCode) {
  if (!CACHE_ENABLED) {
    return null;
  }

  const memoryValue = getMemoryEntry(shortCode);
  if (memoryValue) {
    return memoryValue;
  }

  const redisValue = await getRedisValue(shortCode);
  if (redisValue) {
    memoryCache.set(shortCode, {
      value: redisValue,
      expiresAt: Date.now() + DEFAULT_TTL_SECONDS * 1000
    });
  }

  return redisValue;
}

async function set(shortCode, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!CACHE_ENABLED) {
    return false;
  }

  memoryCache.set(shortCode, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });

  await setRedisValue(shortCode, value, ttlSeconds);
  return true;
}

async function del(shortCode) {
  memoryCache.delete(shortCode);
  await deleteRedisValue(shortCode);
  return true;
}

function stats() {
  return {
    enabled: CACHE_ENABLED,
    memoryEntries: memoryCache.size,
    redisEnabled: REDIS_CONFIGURED
  };
}

module.exports = {
  get,
  set,
  delete: del,
  stats
};