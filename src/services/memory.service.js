/**
 * In-memory storage fallback for when Firebase is not configured.
 * Singleton — all modules share the same instance.
 */
class MemoryStore {
  constructor() {
    this.links = new Map();
    this.analytics = new Map();
  }

  // ============ Link methods ============

  /** @returns {Object|null} */
  async getLink(shortCode) {
    return this.links.get(shortCode) || null;
  }

  /** @returns {Object} */
  async setLink(shortCode, linkData) {
    this.links.set(shortCode, linkData);
    return linkData;
  }

  /** @returns {boolean} */
  async deleteLink(shortCode) {
    return this.links.delete(shortCode);
  }

  /** @returns {Object[]} */
  async getAllLinks(userId) {
    const userLinks = [];
    for (const [, link] of this.links) {
      if (link.userId === userId) {
        userLinks.push(link);
      }
    }
    return userLinks;
  }

  /** @returns {boolean} */
  hasLink(shortCode) {
    return this.links.has(shortCode);
  }

  // ============ Analytics methods ============

  /** @returns {Object} */
  async getAnalytics(shortCode) {
    return this.analytics.get(shortCode) || null;
  }

  /** @returns {Object} */
  async setAnalytics(shortCode, analyticsData) {
    this.analytics.set(shortCode, analyticsData);
    return analyticsData;
  }

  /** @returns {boolean} */
  async deleteAnalytics(shortCode) {
    return this.analytics.delete(shortCode);
  }

  /** @returns {Object} */
  async getOrCreateAnalytics(shortCode) {
    if (!this.analytics.has(shortCode)) {
      this.analytics.set(shortCode, MemoryStore.createEmptyAnalytics());
    }
    return this.analytics.get(shortCode);
  }

  /**
   * Ensure analytics structure exists, increment fields
   */
  async incrementAnalytics(shortCode, updates) {
    const stats = await this.getOrCreateAnalytics(shortCode);
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'number') {
        stats[key] = (stats[key] || 0) + value;
      }
    }
    return stats;
  }

  /** @returns {Object} */
  static createEmptyAnalytics() {
    return {
      impressions: 0,
      clicks: 0,
      shares: 0,
      clickHistory: [],
      devices: {},
      browsers: {},
      countries: {},
      locations: {},
      referrers: {},
      variantClicks: {}
    };
  }

  // ============ Utility methods ============

  /** Get all analytics entries */
  getAllAnalytics() {
    return this.analytics;
  }

  /** Clear all data (for testing) */
  clear() {
    this.links.clear();
    this.analytics.clear();
  }
}

// Singleton instance
module.exports = new MemoryStore();
