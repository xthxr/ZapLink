// ================================
// ANALYTICS DASHBOARD
// ================================

const ANALYTICS_POLL_INTERVAL = 5000;

async function loadAnalytics() {
    const analyticsLinkSelect = document.getElementById('analyticsLinkSelect');

    if (typeof currentUser === 'undefined' || !currentUser) return;

    try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch('/api/user/links', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to fetch links for analytics');
            return;
        }

        const result = await response.json();
        const links = result.links || [];

        if (analyticsLinkSelect && links.length > 0) {
            analyticsLinkSelect.innerHTML = '<option value="all">All Links</option>' +
                links.map(link => `<option value="${link.shortCode}">${(link.shortUrl || '').replace('https://', '').replace('http://', '')}</option>`).join('');

            const newSelect = analyticsLinkSelect.cloneNode(true);
            analyticsLinkSelect.parentNode.replaceChild(newSelect, analyticsLinkSelect);

            newSelect.addEventListener('change', () => {
                loadAnalyticsData(newSelect.value);
                startAnalyticsPolling(newSelect.value);
            });
        }

        loadAnalyticsData('all');
        startAnalyticsPolling('all');
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics links', 'error');
    }
}

async function loadLinkAnalytics(shortCode) {
    const analyticsLinkSelect = document.getElementById('analyticsLinkSelect');
    if (analyticsLinkSelect) {
        analyticsLinkSelect.value = shortCode;
    }
    loadAnalyticsData(shortCode);
    startAnalyticsPolling(shortCode);
}

function startAnalyticsPolling(linkFilter) {
    if (window.analyticsPollInterval) {
        clearInterval(window.analyticsPollInterval);
    }

    window.analyticsPollInterval = setInterval(() => {
        if (typeof debounceAnalyticsUpdate === 'function') {
            debounceAnalyticsUpdate(() => loadAnalyticsData(linkFilter), 100);
        }
    }, ANALYTICS_POLL_INTERVAL);

    window.analyticsPollFilter = linkFilter;
}

// Simple stats update for error/no-data paths
function updateAnalyticsUI(impressions, clicks, ctr, visitors, countries, devices, browsers, referrers) {
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setText('analyticsImpressions', (impressions || 0).toLocaleString());
    setText('analyticsClicks', (clicks || 0).toLocaleString());
    if (typeof ctr === 'number') {
        setText('analyticsCTR', ctr.toFixed(1) + '%');
    }
    setText('analyticsVisitors', (visitors || 0).toLocaleString());
}

async function loadAnalyticsData(linkFilter) {
    try {
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.uid) {
            console.log('User not authenticated yet, skipping analytics load');
            return;
        }

        const token = await getAuthToken();
        if (!token) return;

        let totalClicks = 0;
        let totalImpressions = 0;
        let countries = new Set();
        let locations = {};
        let devices = {};
        let browsers = {};
        let referrers = {};
        let allClickHistory = [];
        let isSplitTest = false;
        let splitTestVariants = [];
        let variantClicks = {};
        let analyticsEntries = [];

        if (linkFilter === 'all') {
            const response = await fetch('/api/user/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error('Failed to fetch analytics');
                updateAnalyticsUI(0, 0, 0, 0, {}, {}, {}, {});
                return;
            }
            const result = await response.json();
            analyticsEntries = result.data || [];

            if (analyticsEntries.length === 0) {
                console.log('No links found for user');
                updateAnalyticsUI(0, 0, 0, 0, {}, {}, {}, {});
                return;
            }
        } else {
            const response = await fetch(`/api/analytics/${encodeURIComponent(linkFilter)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.log('Analytics not found for link');
                updateAnalyticsUI(0, 0, 0, 0, {}, {}, {}, {});
                return;
            }
            const result = await response.json();
            analyticsEntries = [{
                shortCode: linkFilter,
                linkData: result.link || {},
                analytics: result.analytics || null
            }];
        }

        for (const entry of analyticsEntries) {
            const linkData = entry.linkData || {};
            const shortCode = entry.shortCode;
            const analytics = entry.analytics;

            if (!analytics) continue;

            if (linkFilter !== 'all' && linkData.splitTest) {
                isSplitTest = true;
                splitTestVariants = linkData.variants || [];
            }

            if (analytics.variantClicks) {
                Object.entries(analytics.variantClicks).forEach(([variant, count]) => {
                    variantClicks[variant] = (variantClicks[variant] || 0) + count;
                });
            }

            totalClicks += analytics.clicks || 0;
            totalImpressions += analytics.impressions || 0;

            if (analytics.devices) {
                Object.entries(analytics.devices).forEach(([device, count]) => {
                    devices[device] = (devices[device] || 0) + count;
                });
            }

            if (analytics.browsers) {
                Object.entries(analytics.browsers).forEach(([browser, count]) => {
                    browsers[browser] = (browsers[browser] || 0) + count;
                });
            }

            if (analytics.referrers) {
                Object.entries(analytics.referrers).forEach(([referrer, count]) => {
                    referrers[referrer] = (referrers[referrer] || 0) + count;
                });
            }

            if (analytics.locations) {
                Object.entries(analytics.locations).forEach(([location, count]) => {
                    locations[location] = (locations[location] || 0) + count;
                });
            }

            if (analytics.clickHistory && Array.isArray(analytics.clickHistory)) {
                allClickHistory.push(...analytics.clickHistory);
            }

            if (analytics.countries) {
                Object.keys(analytics.countries).forEach(country => {
                    countries.add(country);
                });
            }
        }

        allClickHistory.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
        });

        const visitorFingerprints = new Set();
        allClickHistory.forEach(click => {
            const fingerprint = `${click.referrer}_${click.device}_${click.browser}`;
            visitorFingerprints.add(fingerprint);
        });
        const uniqueVisitorsCount = visitorFingerprints.size || totalClicks;

        const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;

        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);

        let currentPeriodClicks = 0;
        let previousPeriodClicks = 0;
        let currentPeriodVisitors = new Set();
        let previousPeriodVisitors = new Set();

        allClickHistory.forEach(click => {
            const clickTime = new Date(click.timestamp).getTime();
            const fingerprint = `${click.referrer}_${click.device}_${click.browser}`;

            if (clickTime >= sevenDaysAgo) {
                currentPeriodClicks++;
                currentPeriodVisitors.add(fingerprint);
            } else if (clickTime >= fourteenDaysAgo && clickTime < sevenDaysAgo) {
                previousPeriodClicks++;
                previousPeriodVisitors.add(fingerprint);
            }
        });

        const clicksChange = calculatePercentageChange(currentPeriodClicks, previousPeriodClicks);
        const visitorsChange = calculatePercentageChange(currentPeriodVisitors.size, previousPeriodVisitors.size);
        const impressionsChange = null;
        const ctrChange = null;

        document.getElementById('analyticsImpressions').textContent = totalImpressions.toLocaleString();
        document.getElementById('analyticsClicks').textContent = totalClicks.toLocaleString();
        document.getElementById('analyticsCTR').textContent = ctr.toFixed(1) + '%';
        document.getElementById('analyticsVisitors').textContent = uniqueVisitorsCount.toLocaleString();

        updateStatChange('impressionsChange', impressionsChange);
        updateStatChange('clicksChange', clicksChange);
        updateStatChange('ctrChange', ctrChange);
        updateStatChange('visitorsChange', visitorsChange);

        const clicksOverTimeData = processClicksOverTime(allClickHistory);

        const topReferrers = Object.entries(referrers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source, count]) => ({ source, count }));

        const devicesList = Object.entries(devices)
            .sort((a, b) => b[1] - a[1])
            .map(([device, count]) => ({ device, count }));

        const browsersList = Object.entries(browsers)
            .sort((a, b) => b[1] - a[1])
            .map(([browser, count]) => ({ browser, count }));

        const geographicList = Object.entries(locations)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count);

        renderClicksChart(clicksOverTimeData);
        renderReferrersChart(topReferrers);
        renderGeographicList(geographicList);
        renderDevicesList(devicesList);
        renderBrowsersList(browsersList);
        renderReferrersList(topReferrers);
        renderSplitTestAnalytics(isSplitTest, splitTestVariants, variantClicks);

        console.log('✅ Analytics loaded successfully:', {
            totalImpressions,
            totalClicks,
            ctr: ctr.toFixed(1) + '%',
            uniqueVisitors: uniqueVisitorsCount,
            countries: countries.size
        });
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics: ' + error.message, 'error');
    }
}

function processClicksOverTime(clickHistory) {
    if (!clickHistory || clickHistory.length === 0) {
        return { labels: [], data: [], granularity: 'none' };
    }

    const now = Date.now();
    const firstClick = new Date(clickHistory[0].timestamp).getTime();
    const ageInMinutes = (now - firstClick) / (1000 * 60);

    let granularity;
    let formatLabel;
    let groupKey;

    if (ageInMinutes <= 60) {
        granularity = 'minute';
        formatLabel = (date) => {
            const d = new Date(date);
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        };
        groupKey = (timestamp) => {
            const d = new Date(timestamp);
            d.setSeconds(0, 0);
            return d.getTime();
        };
    } else if (ageInMinutes <= 1440) {
        granularity = 'hour';
        formatLabel = (date) => {
            const d = new Date(date);
            return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        };
        groupKey = (timestamp) => {
            const d = new Date(timestamp);
            d.setMinutes(0, 0, 0);
            return d.getTime();
        };
    } else {
        granularity = 'day';
        formatLabel = (date) => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        groupKey = (timestamp) => {
            const d = new Date(timestamp);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        };
    }

    const grouped = {};
    clickHistory.forEach(click => {
        const key = groupKey(click.timestamp);
        grouped[key] = (grouped[key] || 0) + 1;
    });

    const sorted = Object.entries(grouped)
        .map(([timestamp, count]) => ({
            timestamp: parseInt(timestamp),
            count
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    if (sorted.length > 0) {
        const filled = [];
        const start = sorted[0].timestamp;
        const end = sorted[sorted.length - 1].timestamp;

        let interval;
        if (granularity === 'minute') interval = 60 * 1000;
        else if (granularity === 'hour') interval = 60 * 60 * 1000;
        else interval = 24 * 60 * 60 * 1000;

        for (let t = start; t <= end; t += interval) {
            const existing = sorted.find(s => s.timestamp === t);
            filled.push({
                label: formatLabel(t),
                count: existing ? existing.count : 0
            });
        }

        return {
            labels: filled.map(f => f.label),
            data: filled.map(f => f.count),
            granularity
        };
    }

    return {
        labels: sorted.map(s => formatLabel(s.timestamp)),
        data: sorted.map(s => s.count),
        granularity
    };
}

function renderClicksChart(chartData) {
    const ctx = document.getElementById('clicksChart');
    if (!ctx) return;

    if (window.clicksChartInstance) {
        window.clicksChartInstance.destroy();
    }

    const { labels, data, granularity } = chartData;

    if (typeof Chart !== 'undefined') {
        window.clicksChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Clicks (${granularity === 'minute' ? 'per minute' : granularity === 'hour' ? 'per hour' : 'per day'})`,
                    data: data,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function renderReferrersChart(data) {
    const ctx = document.getElementById('referrersChart');
    if (!ctx) return;

    if (window.referrersChartInstance) {
        window.referrersChartInstance.destroy();
    }

    if (typeof Chart !== 'undefined') {
        window.referrersChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.source),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function renderGeographicList(data) {
    const container = document.getElementById('geographicList');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No data available</p>';
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="analytics-item">
            <span class="analytics-item-label">${escapeHtml(item.location)}</span>
            <span class="analytics-item-value">${item.count}</span>
        </div>
    `).join('');
}

function renderDevicesList(data) {
    const container = document.getElementById('devicesList');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="analytics-item">
            <span class="analytics-item-label">${escapeHtml(item.device)}</span>
            <span class="analytics-item-value">${item.count}</span>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No data available</p>';
}

function renderBrowsersList(data) {
    const container = document.getElementById('browsersList');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="analytics-item">
            <span class="analytics-item-label">${escapeHtml(item.browser)}</span>
            <span class="analytics-item-value">${item.count}</span>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No data available</p>';
}

function renderReferrersList(data) {
    const container = document.getElementById('referrersList');
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="analytics-item">
            <span class="analytics-item-label">${escapeHtml(item.source)}</span>
            <span class="analytics-item-value">${item.count}</span>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No data available</p>';
}

function updateStatChange(elementId, changeData) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (!changeData || changeData.value === 0) {
        element.style.display = 'none';
        return;
    }

    element.style.display = 'block';
    element.className = `stat-change ${changeData.isPositive ? 'positive' : 'negative'}`;
    element.textContent = `${changeData.isPositive ? '+' : '-'}${changeData.value.toFixed(1)}%`;
}

// Make globally available
window.loadAnalytics = loadAnalytics;
window.loadLinkAnalytics = loadLinkAnalytics;
window.startAnalyticsPolling = startAnalyticsPolling;
window.updateAnalyticsUI = updateAnalyticsUI;
window.loadAnalyticsData = loadAnalyticsData;
window.processClicksOverTime = processClicksOverTime;
window.renderClicksChart = renderClicksChart;
window.renderReferrersChart = renderReferrersChart;
window.renderGeographicList = renderGeographicList;
window.renderDevicesList = renderDevicesList;
window.renderBrowsersList = renderBrowsersList;
window.renderReferrersList = renderReferrersList;
window.updateStatChange = updateStatChange;
