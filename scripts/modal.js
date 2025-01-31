// modal.js
function showModal(title, content) {
    const modalHtml = `
        <div class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        </div>
    `;

    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.querySelector('.modal').style.display = 'block';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.querySelector('.modal');
    if (event.target === modal) {
        closeModal();
    }
}