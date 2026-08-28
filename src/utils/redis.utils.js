/**
 * Upstash Redis Utility for Edge Redirects
 * Syncs link data to Upstash Redis for ultra-fast edge lookups
 */

const { Redis } = require('@upstash/redis');

// Initialize Redis client
let redis = null;

function getRedisClient() {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('⚠️  Upstash Redis not configured. Edge redirects will not work.');
      return null;
    }

    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('✅ Upstash Redis client initialized');
  }
  
  return redis;
}

/**
 * Store link data in Redis for edge redirects
 * @param {string} shortCode - The short code identifier
 * @param {object} linkData - Link data containing at minimum: destination, userId, createdAt
 * @param {number} ttl - Time to live in seconds (default: 1 year)
 */
async function storeLinkInRedis(shortCode, linkData, ttl = 60 * 60 * 24 * 365) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const linkKey = `link:${shortCode}`;
    
    // Store minimal data needed for redirect
    const redisData = {
      destination: linkData.destination || linkData.destinationUrl,
      shortCode: shortCode,
      userId: linkData.userId || linkData.createdBy,
      createdAt: linkData.createdAt || Date.now(),
      title: linkData.title || '',
    };

    // Store with TTL
    await client.setex(linkKey, ttl, redisData);
    
    console.log(`✅ Stored link in Redis: ${shortCode} -> ${redisData.destination}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to store link in Redis:', error);
    return false;
  }
}

/**
 * Update link data in Redis
 */
async function updateLinkInRedis(shortCode, updates) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const linkKey = `link:${shortCode}`;
    
    // Get existing data
    const existing = await client.get(linkKey);
    if (!existing) {
      console.warn(`⚠️  Link ${shortCode} not found in Redis for update`);
      return false;
    }

    // Merge updates
    const updated = { ...existing, ...updates };
    
    // Store updated data (preserve original TTL)
    const ttl = await client.ttl(linkKey);
    await client.setex(linkKey, ttl > 0 ? ttl : 60 * 60 * 24 * 365, updated);
    
    console.log(`✅ Updated link in Redis: ${shortCode}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update link in Redis:', error);
    return false;
  }
}

/**
 * Delete link from Redis
 */
async function deleteLinkFromRedis(shortCode) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const linkKey = `link:${shortCode}`;
    await client.del(linkKey);
    
    console.log(`✅ Deleted link from Redis: ${shortCode}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete link from Redis:', error);
    return false;
  }
}

/**
 * Get link data from Redis (for server-side lookups)
 */
async function getLinkFromRedis(shortCode) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const linkKey = `link:${shortCode}`;
    const linkData = await client.get(linkKey);
    return linkData;
  } catch (error) {
    console.error('❌ Failed to get link from Redis:', error);
    return null;
  }
}

/**
 * Get click count for a link
 */
async function getClickCount(shortCode) {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const clickKey = `clicks:${shortCode}`;
    const count = await client.get(clickKey);
    return count || 0;
  } catch (error) {
    console.error('❌ Failed to get click count from Redis:', error);
    return 0;
  }
}

/**
 * Sync all links from Firestore to Redis
 * Useful for initial setup or recovery
 */
async function syncAllLinksToRedis(db) {
  const client = getRedisClient();
  if (!client) {
    console.warn('⚠️  Cannot sync: Redis not configured');
    return { success: false, count: 0 };
  }

  try {
    console.log('🔄 Starting bulk sync to Redis...');
    
    const linksSnapshot = await db.collection('links').get();
    let successCount = 0;
    let errorCount = 0;

    for (const doc of linksSnapshot.docs) {
      const linkData = doc.data();
      const shortCode = linkData.shortCode || doc.id.replace(/_/g, '/');
      
      try {
        await storeLinkInRedis(shortCode, linkData);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync ${shortCode}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Bulk sync complete: ${successCount} succeeded, ${errorCount} failed`);
    return { success: true, count: successCount, errors: errorCount };
  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Get analytics data from Redis
 */
async function getAnalyticsFromRedis(shortCode, limit = 100) {
  const client = getRedisClient();
  if (!client) return [];

  try {
    // Use SCAN to find all analytics keys for this shortCode
    const pattern = `analytics:${shortCode}:*`;
    const keys = await client.keys(pattern);
    
    if (!keys || keys.length === 0) return [];

    // Get data for all keys (limit to most recent)
    const recentKeys = keys.slice(-limit);
    const analyticsData = [];

    for (const key of recentKeys) {
      const data = await client.get(key);
      if (data) {
        analyticsData.push(data);
      }
    }

    return analyticsData.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('❌ Failed to get analytics from Redis:', error);
    return [];
  }
}

module.exports = {
  getRedisClient,
  storeLinkInRedis,
  updateLinkInRedis,
  deleteLinkFromRedis,
  getLinkFromRedis,
  getClickCount,
  syncAllLinksToRedis,
  getAnalyticsFromRedis,
};
