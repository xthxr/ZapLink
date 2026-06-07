const { getDatabase, COLLECTIONS } = require('../../config/firebase.config');

// ============ Aggregated analytics ============

/**
 * Aggregate analytics from distributed shards
 * @param {string} firestoreId
 * @returns {Promise<Object>}
 */
async function getAggregatedAnalytics(firestoreId) {
  const db = getDatabase();
  if (!db) return {};

  const baseDoc = await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).get();
  let data = baseDoc.exists ? baseDoc.data() : {};

  try {
    const shardsSnapshot = await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).collection('shards').get();

    shardsSnapshot.forEach(shard => {
      const s = shard.data();
      data.clicks = (data.clicks || 0) + (s.clicks || 0);
      data.impressions = (data.impressions || 0) + (s.impressions || 0);
      data.shares = (data.shares || 0) + (s.shares || 0);

      const mergeNested = (key) => {
        if (!s[key]) return;
        if (!data[key]) data[key] = {};
        for (const [k, v] of Object.entries(s[key])) {
          data[key][k] = (data[key][k] || 0) + v;
        }
      };

      ['devices', 'browsers', 'referrers', 'countries', 'locations', 'variantClicks'].forEach(mergeNested);
    });
  } catch (err) {
    console.error("Error reading shards:", err);
  }

  return data;
}

// ============ Device / Browser detection ============

/**
 * Extract device type from user-agent
 * @param {string} userAgent
 * @returns {string}
 */
function getDeviceType(userAgent) {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  return isMobile ? 'Mobile' : 'Desktop';
}

/**
 * Extract browser type from user-agent
 * @param {string} userAgent
 * @returns {string}
 */
function getBrowserType(userAgent) {
  let browser = 'Other';
  const ua = userAgent.toLowerCase();

  if (ua.includes('instagram')) browser = 'Instagram App';
  else if (ua.includes('whatsapp')) browser = 'WhatsApp';
  else if (ua.includes('fb_iab') || ua.includes('fbav')) browser = 'Facebook App';
  else if (ua.includes('twitter')) browser = 'Twitter App';
  else if (ua.includes('linkedin')) browser = 'LinkedIn App';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  return browser;
}

// ============ Referrer detection ============

/**
 * Get referrer source from a referrer string (e.g. req.headers.referer)
 * @param {string} referrer - HTTP Referer header value (may be empty)
 * @returns {string}
 */
function getReferrerSource(referrer) {
  if (!referrer) return 'Direct';

  try {
    const refUrl = new URL(referrer);
    const hostname = refUrl.hostname.toLowerCase().replace('www.', '');

    const platformMap = {
      'google': 'Google',
      'facebook': 'Facebook',
      'fb.com': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'X (formerly Twitter)',
      't.co': 'X (formerly Twitter)',
      'linkedin': 'LinkedIn',
      'reddit': 'Reddit',
      'tiktok': 'TikTok',
      'youtube': 'YouTube',
      'pinterest': 'Pinterest',
      'whatsapp': 'WhatsApp',
      'telegram': 'Telegram',
      'discord': 'Discord',
      'slack': 'Slack',
    };

    for (const [key, label] of Object.entries(platformMap)) {
      if (hostname.includes(key)) return label;
    }

    return hostname;
  } catch (e) {
    return referrer;
  }
}

// ============ Geolocation ============

/**
 * Fetch geolocation data for an IP address
 * @param {string} clientIP
 * @returns {Promise<{ country: string, city: string, region: string }>}
 */
async function fetchGeolocation(clientIP) {
  let locationData = { country: 'Unknown', city: 'Unknown', region: 'Unknown' };

  try {
    const fetch = typeof globalThis.fetch === 'function'
      ? globalThis.fetch
      : (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,regionName,city`);
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.status === 'success') {
        locationData = {
          country: geoData.country || 'Unknown',
          city: geoData.city || 'Unknown',
          region: geoData.regionName || 'Unknown'
        };
      }
    }
  } catch (geoError) {
    console.log('Geolocation lookup failed:', geoError.message);
  }

  return locationData;
}

// ============ Link helpers ============

/**
 * Normalize link data for redirect cache
 * @param {Object|null} linkData
 * @returns {Object|null}
 */
function normalizeRedirectLink(linkData) {
  if (!linkData) return null;

  return {
    originalUrl: linkData.originalUrl,
    shortCode: linkData.shortCode || '',
    userId: linkData.userId || '',
    isActive: linkData.isActive !== false,
    title: linkData.title || '',
    splitTest: linkData.splitTest || false,
    variants: linkData.variants || [],
  };
}

module.exports = {
  getAggregatedAnalytics,
  getDeviceType,
  getBrowserType,
  getReferrerSource,
  fetchGeolocation,
  normalizeRedirectLink,
};
