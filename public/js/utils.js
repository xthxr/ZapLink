// ================================
// UTILITY FUNCTIONS
// ================================

function formatDate(dateInput) {
    let date;

    if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } else if (dateInput && dateInput._seconds) {
        date = new Date(dateInput._seconds * 1000);
    } else {
        date = new Date(dateInput);
    }

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? { value: 100, isPositive: true } : null;
    }
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change),
        isPositive: change >= 0
    };
}

// Make globally available
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.truncateText = truncateText;
window.calculatePercentageChange = calculatePercentageChange;
