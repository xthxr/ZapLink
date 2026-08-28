// ================================
// BIO LINK MODULE — DRAG & DROP REORDER
// ================================
// Sets up HTML5 drag-and-drop for editor bio link items.
// Load AFTER editor.js (needs editorBioLinkItems, renderEditorBioLinkItems, triggerAutoSave).

// --- Setup drag and drop for bio link items ---
function setupDragAndDrop() {
    const container = document.getElementById('editorBioLinkItems');
    if (!container) return;

    const items = container.querySelectorAll('.bio-link-item');
    let draggedItem = null;
    let draggedIndex = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            draggedIndex = parseInt(item.getAttribute('data-index'), 10);
            item.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', (e) => {
            item.style.opacity = '1';
            draggedItem = null;
            draggedIndex = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (draggedItem && draggedItem !== item) {
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    item.style.borderTop = '2px solid #06b6d4';
                    item.style.borderBottom = '';
                } else {
                    item.style.borderBottom = '2px solid #06b6d4';
                    item.style.borderTop = '';
                }
            }
        });

        item.addEventListener('dragleave', (e) => {
            item.style.borderTop = '';
            item.style.borderBottom = '';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = '';
            item.style.borderBottom = '';

            if (draggedItem && draggedItem !== item) {
                const dropIndex = parseInt(item.getAttribute('data-index'), 10);

                const draggedItemData = editorBioLinkItems[draggedIndex];
                editorBioLinkItems.splice(draggedIndex, 1);

                const newDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
                editorBioLinkItems.splice(newDropIndex, 0, draggedItemData);

                renderEditorBioLinkItems();
                triggerAutoSave();
            }
        });
    });
}
