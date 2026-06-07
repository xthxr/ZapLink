// ================================
// GEOGRAPHIC ANALYTICS
// ================================

function openDetailedGeographicView() {
    navigateToPage('geo-details');
}

async function loadDetailedGeographicData() {
    try {
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.uid) {
            console.log('User not authenticated');
            return;
        }

        const token = await getAuthToken();
        if (!token) return;

        allGeoClicks = [];

        const analyticsLinkSelect = document.getElementById('analyticsLinkSelect');
        const linkFilter = analyticsLinkSelect ? analyticsLinkSelect.value : 'all';

        let analyticsEntries = [];
        if (linkFilter === 'all') {
            const response = await fetch('/api/user/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.log('No analytics data found');
                renderGeoClicksTable([]);
                return;
            }
            const result = await response.json();
            analyticsEntries = result.data || [];
        } else {
            const response = await fetch(`/api/analytics/${encodeURIComponent(linkFilter)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.log('No analytics data found');
                renderGeoClicksTable([]);
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
            const analytics = entry.analytics;
            const linkData = entry.linkData || {};
            const shortCode = entry.shortCode;

            if (analytics && analytics.clickHistory && Array.isArray(analytics.clickHistory)) {
                analytics.clickHistory.forEach(click => {
                    if (click.location) {
                        allGeoClicks.push({
                            ...click,
                            shortCode,
                            shortUrl: linkData.shortUrl
                        });
                    }
                });
            }
        }

        allGeoClicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        updateGeoSummaryStats(allGeoClicks);

        filterGeoData('all');

        if (typeof currentGeoView !== 'undefined' && currentGeoView === 'globe' && typeof updateGlobeData === 'function') {
            updateGlobeData();
        }
    } catch (error) {
        console.error('Error loading geographic data:', error);
        showToast('Failed to load geographic data', 'error');
    }
}

function updateGeoSummaryStats(clicks) {
    const uniqueLocations = new Set();
    const uniqueCountries = new Set();
    const uniqueCities = new Set();

    clicks.forEach(click => {
        if (click.location) {
            const locationKey = `${click.location.city}, ${click.location.region}`;
            uniqueLocations.add(locationKey);
            uniqueCountries.add(click.location.country);
            uniqueCities.add(click.location.city);
        }
    });

    const totalLocations = document.getElementById('totalLocations');
    const totalCountries = document.getElementById('totalCountries');
    const totalCities = document.getElementById('totalCities');
    const totalGeoClicks = document.getElementById('totalGeoClicks');

    if (totalLocations) totalLocations.textContent = uniqueLocations.size;
    if (totalCountries) totalCountries.textContent = uniqueCountries.size;
    if (totalCities) totalCities.textContent = uniqueCities.size;
    if (totalGeoClicks) totalGeoClicks.textContent = clicks.length;
}

function filterGeoData(filter) {
    currentGeoFilter = filter;

    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filter === 'all') {
        filteredGeoClicks = [...allGeoClicks];
    } else if (filter === 'today') {
        filteredGeoClicks = allGeoClicks.filter(click => {
            const clickDate = new Date(click.timestamp);
            return clickDate >= today;
        });
    } else if (filter === 'week') {
        filteredGeoClicks = allGeoClicks.filter(click => {
            const clickDate = new Date(click.timestamp);
            return clickDate >= weekAgo;
        });
    } else if (filter === 'month') {
        filteredGeoClicks = allGeoClicks.filter(click => {
            const clickDate = new Date(click.timestamp);
            return clickDate >= monthAgo;
        });
    }

    sortGeoData(currentGeoSort, false);
}

function sortGeoData(sortBy, updateSelect = true) {
    currentGeoSort = sortBy;

    if (updateSelect) {
        const sortSelect = document.getElementById('geoSortSelect');
        if (sortSelect) sortSelect.value = sortBy;
    }

    if (sortBy === 'recent') {
        filteredGeoClicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'oldest') {
        filteredGeoClicks.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === 'location') {
        filteredGeoClicks.sort((a, b) => {
            const locA = `${a.location?.city || ''}, ${a.location?.region || ''}`;
            const locB = `${b.location?.city || ''}, ${b.location?.region || ''}`;
            return locA.localeCompare(locB);
        });
    }

    renderGeoClicksTable(filteredGeoClicks);
}

function renderGeoClicksTable(clicks) {
    const tbody = document.getElementById('geoClicksTableBody');
    const countBadge = document.getElementById('geoTableCount');

    if (!tbody) return;

    if (countBadge) countBadge.textContent = `${clicks.length} click${clicks.length !== 1 ? 's' : ''}`;

    if (clicks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No geographic data available for the selected filter</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = clicks.map((click, index) => {
        const timestamp = new Date(click.timestamp);
        const formattedDate = timestamp.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const location = click.location || {};
        const locationStr = `${location.city || 'Unknown'}, ${location.region || 'Unknown'}`;
        const ipAddress = click.ipAddress || 'N/A';

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${formattedDate}</td>
                <td><strong>${locationStr}</strong></td>
                <td>${location.city || 'Unknown'}</td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                        ${location.country || 'Unknown'}
                    </span>
                </td>
                <td>
                    <code style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${ipAddress}
                    </code>
                </td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fas fa-${click.device === 'Mobile' ? 'mobile-alt' : 'desktop'}" style="color: var(--accent-blue);"></i>
                        ${click.device || 'Unknown'}
                    </span>
                </td>
                <td>${click.browser || 'Unknown'}</td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fas fa-share-alt" style="color: var(--accent-purple); font-size: 11px;"></i>
                        ${click.referrer || 'Direct'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Geo search functionality
document.addEventListener('DOMContentLoaded', () => {
    const geoSearchInput = document.getElementById('geoSearchInput');
    if (geoSearchInput) {
        geoSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();

            if (!query) {
                renderGeoClicksTable(filteredGeoClicks);
                return;
            }

            const searchResults = filteredGeoClicks.filter(click => {
                const location = click.location || {};
                const locationStr = `${location.city || ''} ${location.region || ''} ${location.country || ''}`.toLowerCase();
                const ipStr = (click.ipAddress || '').toLowerCase();
                const deviceStr = (click.device || '').toLowerCase();
                const browserStr = (click.browser || '').toLowerCase();
                const referrerStr = (click.referrer || '').toLowerCase();

                return locationStr.includes(query) ||
                    ipStr.includes(query) ||
                    deviceStr.includes(query) ||
                    browserStr.includes(query) ||
                    referrerStr.includes(query);
            });

            renderGeoClicksTable(searchResults);
        });
    }

    // Export to CSV
    const exportGeoDataBtn = document.getElementById('exportGeoDataBtn');
    if (exportGeoDataBtn) {
        exportGeoDataBtn.addEventListener('click', () => {
            if (filteredGeoClicks.length === 0) {
                showToast('No data to export', 'warning');
                return;
            }

            const headers = ['#', 'Timestamp', 'Location', 'City', 'Region', 'Country', 'IP Address', 'Device', 'Browser', 'Referrer'];
            const csvRows = [headers.join(',')];

            filteredGeoClicks.forEach((click, index) => {
                const location = click.location || {};
                const timestamp = new Date(click.timestamp).toISOString();
                const locationStr = `"${location.city || 'Unknown'}, ${location.region || 'Unknown'}"`;

                const row = [
                    index + 1,
                    timestamp,
                    locationStr,
                    location.city || 'Unknown',
                    location.region || 'Unknown',
                    location.country || 'Unknown',
                    click.ipAddress || 'N/A',
                    click.device || 'Unknown',
                    click.browser || 'Unknown',
                    click.referrer || 'Direct'
                ];

                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const now = new Date();
            const filename = `piikme-geographic-data-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Exported ${filteredGeoClicks.length} records to CSV`, 'success');
        });
    }
});

// Make globally available
window.openDetailedGeographicView = openDetailedGeographicView;
window.loadDetailedGeographicData = loadDetailedGeographicData;
window.updateGeoSummaryStats = updateGeoSummaryStats;
window.filterGeoData = filterGeoData;
window.sortGeoData = sortGeoData;
window.renderGeoClicksTable = renderGeoClicksTable;
