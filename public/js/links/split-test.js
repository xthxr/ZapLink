// ================================
// SPLIT TEST FUNCTIONALITY
// ================================

function openSplitTestModal(shortCode) {
    currentSplitTestShortCode = shortCode;
    const modal = document.getElementById('splitTestModal');
    const enabledToggle = document.getElementById('splitTestEnabledToggle');
    const configContainer = document.getElementById('splitTestConfigContainer');
    const variantsList = document.getElementById('variantsEditorList');

    if (!modal) return;
    modal.style.display = 'flex';
    if (variantsList) {
        variantsList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading configuration...</div>';
    }

    try {
        let linkData = null;
        if (typeof userLinks !== 'undefined') {
            linkData = userLinks.find(l => l.shortCode === shortCode);
        }

        if (!linkData) {
            showToast('Link not found', 'error');
            modal.style.display = 'none';
            return;
        }

        const splitTest = linkData.splitTest || false;
        if (enabledToggle) enabledToggle.checked = splitTest;
        if (configContainer) configContainer.style.display = splitTest ? 'block' : 'none';

        const variants = linkData.variants || [
            { label: 'Variant A', url: linkData.originalUrl || '', weight: 50 },
            { label: 'Variant B', url: '', weight: 50 }
        ];

        renderVariantsEditor(variants);
        updateWeightCalculations();
    } catch (err) {
        console.error('Error loading split test:', err);
        showToast('Error loading configuration', 'error');
        modal.style.display = 'none';
    }
}

function renderVariantsEditor(variants) {
    const list = document.getElementById('variantsEditorList');
    if (!list) return;
    list.innerHTML = '';

    variants.forEach((v, index) => {
        const row = document.createElement('div');
        row.className = 'variant-editor-row';
        row.style = 'display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);';
        row.innerHTML = `
            <div style="flex: 1; min-width: 100px;">
                <input type="text" class="form-input variant-label" value="${escapeHtml(v.label)}" placeholder="Label (e.g. Variant A)" style="width: 100%; margin: 0; padding: 6px 10px;" required>
            </div>
            <div style="flex: 3; min-width: 200px;">
                <input type="url" class="form-input variant-url" value="${escapeHtml(v.url)}" placeholder="https://destination-url.com" style="width: 100%; margin: 0; padding: 6px 10px;" required>
            </div>
            <div style="width: 80px; display: flex; align-items: center; gap: 4px;">
                <input type="number" class="form-input variant-weight" value="${v.weight}" min="0" max="100" style="width: 100%; margin: 0; padding: 6px; text-align: center;" required>%
            </div>
            <button type="button" class="btn-icon delete-variant-btn" style="color: var(--accent-red); margin-left: 4px;" title="Remove variant">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const labelInput = row.querySelector('.variant-label');
        const urlInput = row.querySelector('.variant-url');
        const weightInput = row.querySelector('.variant-weight');
        const deleteBtn = row.querySelector('.delete-variant-btn');

        labelInput.addEventListener('input', updateWeightCalculations);
        urlInput.addEventListener('input', updateWeightCalculations);
        weightInput.addEventListener('input', updateWeightCalculations);

        deleteBtn.addEventListener('click', () => {
            const rows = list.querySelectorAll('.variant-editor-row');
            if (rows.length <= 2) {
                showToast('A split test requires at least 2 variants.', 'warning');
                return;
            }
            row.remove();
            updateWeightCalculations();
        });

        list.appendChild(row);
    });
}

function updateWeightCalculations() {
    const list = document.getElementById('variantsEditorList');
    if (!list) return;
    const rows = list.querySelectorAll('.variant-editor-row');
    const saveBtn = document.getElementById('splitTestSaveBtn');
    const totalBadge = document.getElementById('totalWeightBadge');
    const distBar = document.getElementById('weightDistributionBar');
    const distLabels = document.getElementById('distributionBarLabels');
    const enabledToggle = document.getElementById('splitTestEnabledToggle');

    if (!enabledToggle || !saveBtn || !totalBadge || !distBar || !distLabels) return;

    if (!enabledToggle.checked) {
        saveBtn.disabled = false;
        totalBadge.textContent = 'Disabled';
        totalBadge.style.background = 'rgba(255,255,255,0.1)';
        totalBadge.style.color = 'var(--text-secondary)';
        distBar.innerHTML = '<div style="width: 100%; height: 100%; background: rgba(255,255,255,0.05);"></div>';
        distLabels.innerHTML = '';
        return;
    }

    let totalWeight = 0;
    const variants = [];
    let hasDuplicateLabels = false;
    let hasInvalidUrls = false;
    let hasEmptyFields = false;
    const seenLabels = new Set();
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#f43f5e', '#14b8a6'];

    rows.forEach((row, i) => {
        const label = row.querySelector('.variant-label').value.trim();
        const url = row.querySelector('.variant-url').value.trim();
        const weightVal = parseInt(row.querySelector('.variant-weight').value) || 0;

        totalWeight += weightVal;

        if (!label || !url) hasEmptyFields = true;

        if (seenLabels.has(label.toLowerCase())) {
            hasDuplicateLabels = true;
        }
        seenLabels.add(label.toLowerCase());

        try {
            new URL(url);
        } catch {
            hasInvalidUrls = true;
        }

        variants.push({ label, url, weight: weightVal, color: colors[i % colors.length] });
    });

    totalBadge.textContent = `${totalWeight}%`;
    if (totalWeight === 100) {
        totalBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        totalBadge.style.color = '#10b981';
        totalBadge.textContent = '100% (Valid)';
    } else {
        totalBadge.style.background = 'rgba(239, 68, 68, 0.15)';
        totalBadge.style.color = '#ef4444';
        totalBadge.textContent = `${totalWeight}% (Must sum to 100%)`;
    }

    distBar.innerHTML = '';
    distLabels.innerHTML = '';

    variants.forEach(v => {
        if (v.weight > 0) {
            const segment = document.createElement('div');
            segment.style.width = `${(v.weight / Math.max(totalWeight, 1)) * 100}%`;
            segment.style.height = '100%';
            segment.style.backgroundColor = v.color;
            segment.style.transition = 'width 0.3s ease';
            segment.title = `${v.label} (${v.weight}%)`;
            distBar.appendChild(segment);

            const labelTag = document.createElement('div');
            labelTag.style = 'display: flex; align-items: center; gap: 4px;';
            labelTag.innerHTML = `
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${v.color};"></span>
                <span>${escapeHtml(v.label)} (${v.weight}%)</span>
            `;
            distLabels.appendChild(labelTag);
        }
    });

    const isValid = totalWeight === 100 && !hasDuplicateLabels && !hasInvalidUrls && !hasEmptyFields && rows.length >= 2;
    saveBtn.disabled = !isValid;

    if (hasDuplicateLabels) totalBadge.textContent += ' [Duplicate labels]';
    else if (hasInvalidUrls) totalBadge.textContent += ' [Invalid URLs]';
    else if (hasEmptyFields) totalBadge.textContent += ' [Empty fields]';
}

async function saveSplitTest() {
    if (!currentSplitTestShortCode) return;

    const enabledToggle = document.getElementById('splitTestEnabledToggle');
    const list = document.getElementById('variantsEditorList');
    const saveBtn = document.getElementById('splitTestSaveBtn');
    const modal = document.getElementById('splitTestModal');

    if (typeof firebase === 'undefined' || !firebase.auth) {
        showToast('Auth not available', 'error');
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Authentication required', 'error');
        return;
    }

    if (!saveBtn) return;
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const token = await user.getIdToken();
        const shortCodeEncoded = encodeURIComponent(currentSplitTestShortCode);

        let response;
        if (enabledToggle && enabledToggle.checked) {
            const rows = list ? list.querySelectorAll('.variant-editor-row') : [];
            const variants = [];
            rows.forEach(row => {
                const label = row.querySelector('.variant-label').value.trim();
                const url = row.querySelector('.variant-url').value.trim();
                const weight = parseInt(row.querySelector('.variant-weight').value) || 0;
                variants.push({ label, url, weight });
            });

            response = await fetch(`/api/links/${shortCodeEncoded}/split-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ variants })
            });
        } else {
            response = await fetch(`/api/links/${shortCodeEncoded}/split-test`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        const result = await response.json();

        if (response.ok && result.success) {
            showToast(result.message || 'Configuration saved successfully', 'success');
            if (modal) modal.style.display = 'none';

            if (typeof loadLinks === 'function') {
                await loadLinks();
            }
        } else {
            throw new Error(result.error || 'Failed to save configuration');
        }
    } catch (err) {
        console.error('Error saving split test:', err);
        showToast('Failed to save configuration: ' + err.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

function initializeSplitTestEventListeners() {
    const modal = document.getElementById('splitTestModal');
    const modalOverlay = document.getElementById('splitTestModalOverlay');
    const modalClose = document.getElementById('splitTestModalClose');
    const cancelBtn = document.getElementById('splitTestCancelBtn');
    const saveBtn = document.getElementById('splitTestSaveBtn');
    const enabledToggle = document.getElementById('splitTestEnabledToggle');
    const configContainer = document.getElementById('splitTestConfigContainer');
    const addVariantBtn = document.getElementById('addVariantBtn');

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        currentSplitTestShortCode = null;
    };

    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSplitTest);
    }

    if (enabledToggle && configContainer) {
        enabledToggle.addEventListener('change', () => {
            configContainer.style.display = enabledToggle.checked ? 'block' : 'none';
            updateWeightCalculations();
        });
    }

    if (addVariantBtn) {
        addVariantBtn.addEventListener('click', () => {
            const list = document.getElementById('variantsEditorList');
            if (!list) return;
            const rows = list.querySelectorAll('.variant-editor-row');
            if (rows.length >= 10) {
                showToast('A split test supports at most 10 variants.', 'warning');
                return;
            }

            const labelChar = String.fromCharCode(65 + rows.length);
            const nextLabel = `Variant ${labelChar}`;

            const row = document.createElement('div');
            row.className = 'variant-editor-row';
            row.style = 'display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);';
            row.innerHTML = `
                <div style="flex: 1; min-width: 100px;">
                    <input type="text" class="form-input variant-label" value="${nextLabel}" placeholder="Label (e.g. Variant A)" style="width: 100%; margin: 0; padding: 6px 10px;" required>
                </div>
                <div style="flex: 3; min-width: 200px;">
                    <input type="url" class="form-input variant-url" value="" placeholder="https://destination-url.com" style="width: 100%; margin: 0; padding: 6px 10px;" required>
                </div>
                <div style="width: 80px; display: flex; align-items: center; gap: 4px;">
                    <input type="number" class="form-input variant-weight" value="0" min="0" max="100" style="width: 100%; margin: 0; padding: 6px; text-align: center;" required>%
                </div>
                <button type="button" class="btn-icon delete-variant-btn" style="color: var(--accent-red); margin-left: 4px;" title="Remove variant">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            const labelInput = row.querySelector('.variant-label');
            const urlInput = row.querySelector('.variant-url');
            const weightInput = row.querySelector('.variant-weight');
            const deleteBtn = row.querySelector('.delete-variant-btn');

            labelInput.addEventListener('input', updateWeightCalculations);
            urlInput.addEventListener('input', updateWeightCalculations);
            weightInput.addEventListener('input', updateWeightCalculations);

            deleteBtn.addEventListener('click', () => {
                const currentRows = list.querySelectorAll('.variant-editor-row');
                if (currentRows.length <= 2) {
                    showToast('A split test requires at least 2 variants.', 'warning');
                    return;
                }
                row.remove();
                updateWeightCalculations();
            });

            list.appendChild(row);
            updateWeightCalculations();
        });
    }
}

function renderSplitTestAnalytics(isSplitTest, variants, clicks) {
    const panel = document.getElementById('splitTestAnalyticsPanel');
    const tableBody = document.getElementById('splitTestAnalyticsTableBody');

    if (!panel) return;

    if (!isSplitTest || !variants || variants.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    const totalClicks = Object.values(clicks).reduce((sum, c) => sum + c, 0);
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#f43f5e', '#14b8a6'];

    if (tableBody) {
        variants.forEach((v, index) => {
            const variantClicks = clicks[v.label] || 0;
            const clickShare = totalClicks > 0 ? ((variantClicks / totalClicks) * 100).toFixed(1) : '0.0';
            const color = colors[index % colors.length];

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            row.innerHTML = `
                <td style="padding: 12px 8px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-primary);">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></span>
                    ${escapeHtml(v.label)}
                </td>
                <td style="padding: 12px 8px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary);" title="${escapeHtml(v.url)}">
                    ${escapeHtml(v.url)}
                </td>
                <td style="padding: 12px 8px; text-align: center; font-weight: 500;">${v.weight}%</td>
                <td style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary);">${variantClicks.toLocaleString()}</td>
                <td style="padding: 12px 8px; text-align: center; color: var(--text-secondary);">${clickShare}%</td>
            `;
            tableBody.appendChild(row);
        });
    }

    const ctx = document.getElementById('splitTestChart');
    if (!ctx) return;

    if (typeof splitTestChartInstance !== 'undefined' && splitTestChartInstance) {
        splitTestChartInstance.destroy();
    }

    const chartLabels = variants.map(v => v.label);
    const chartData = variants.map(v => clicks[v.label] || 0);
    const chartColors = variants.map((_, i) => colors[i % colors.length]);

    const isAllZero = chartData.every(val => val === 0);
    const displayData = isAllZero ? variants.map(() => 1) : chartData;

    if (typeof Chart !== 'undefined') {
        splitTestChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: displayData,
                    backgroundColor: chartColors,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'var(--text-secondary)',
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = chartData[context.dataIndex];
                                return `${context.label}: ${val.toLocaleString()} clicks`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Make globally available
window.openSplitTestModal = openSplitTestModal;
window.renderVariantsEditor = renderVariantsEditor;
window.updateWeightCalculations = updateWeightCalculations;
window.saveSplitTest = saveSplitTest;
window.initializeSplitTestEventListeners = initializeSplitTestEventListeners;
window.renderSplitTestAnalytics = renderSplitTestAnalytics;
