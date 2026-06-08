// ================================
// BUG REPORT FUNCTIONALITY
// ================================

function openBugReportModal() {
    const bugReportModal = document.getElementById('bugReportModal');
    if (!bugReportModal) return;
    bugReportModal.style.display = 'flex';

    if (typeof currentUser !== 'undefined' && currentUser && currentUser.email) {
        const bugEmail = document.getElementById('bugEmail');
        if (bugEmail) bugEmail.value = currentUser.email;
    }
}

function closeBugReport() {
    const bugReportModal = document.getElementById('bugReportModal');
    const bugReportForm = document.getElementById('bugReportForm');
    if (bugReportModal) bugReportModal.style.display = 'none';
    if (bugReportForm) bugReportForm.reset();
}

async function handleBugReport(e) {
    e.preventDefault();

    const bugTitleEl = document.getElementById('bugTitle');
    const bugDescEl = document.getElementById('bugDescription');
    const bugStepsEl = document.getElementById('bugSteps');
    const bugEmailEl = document.getElementById('bugEmail');
    const bugTitle = bugTitleEl ? bugTitleEl.value.trim() : '';
    const bugDescription = bugDescEl ? bugDescEl.value.trim() : '';
    const bugSteps = bugStepsEl ? bugStepsEl.value.trim() : '';
    const bugEmail = bugEmailEl ? bugEmailEl.value.trim() : '';

    if (!bugTitle || !bugDescription) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]') || document.querySelector('.bug-report-modal button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Submit';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Issue...';
    }

    try {
        const response = await fetch('/api/bug-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: bugTitle,
                description: bugDescription,
                steps: bugSteps,
                email: bugEmail,
                userId: typeof currentUser !== 'undefined' ? currentUser?.uid : null,
                userEmail: typeof currentUser !== 'undefined' ? currentUser?.email : null
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            closeBugReport();
            showToast(`Bug report created successfully! Issue #${data.issueNumber}`, 'success');

            setTimeout(() => {
                window.open(data.issueUrl, '_blank');
            }, 1000);
        } else {
            throw new Error(data.error || 'Failed to create bug report');
        }
    } catch (error) {
        console.error('Bug report error:', error);
        showToast('Failed to create bug report. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Bug Report Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const reportBugBtn = document.getElementById('reportBugBtn');
    const closeBugReportModal = document.getElementById('closeBugReportModal');
    const cancelBugReport = document.getElementById('cancelBugReport');
    const bugReportForm = document.getElementById('bugReportForm');

    if (reportBugBtn) {
        reportBugBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openBugReportModal();
        });
    }

    if (closeBugReportModal) {
        closeBugReportModal.addEventListener('click', closeBugReport);
    }

    if (cancelBugReport) {
        cancelBugReport.addEventListener('click', closeBugReport);
    }

    if (bugReportForm) {
        bugReportForm.addEventListener('submit', handleBugReport);
    }
});

// Make globally available
window.openBugReportModal = openBugReportModal;
window.closeBugReport = closeBugReport;
window.handleBugReport = handleBugReport;
