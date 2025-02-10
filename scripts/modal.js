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

async function showStaffManagementModal() {
    const staffData = await fetchStaffData();
    
    const modalContent = `
        <div class="staff-management-container">
            <h3>Staff Management</h3>
            ${staffData.length === 0 ?
                '<div class="no-data-message">No staff records found.</div>' :
                `<table class="staff-table">
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>Role</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${staffData.map(staff => `
                            <tr data-staff-id="${staff.staff_id}">
                                <td>${staff.staff_id}</td>
                                <td>${staff.role}</td>
                                <td>
                                    <input type="text" class="edit-name" 
                                           value="${staff.name}" 
                                           placeholder="Full Name">
                                </td>
                                <td>
                                    <input type="email" class="edit-email" 
                                           value="${staff.email}" 
                                           placeholder="Email">
                                </td>
                                <td>
                                    <input type="tel" class="edit-phone" 
                                           value="${staff.tele_no}" 
                                           placeholder="Phone">
                                </td>
                                <td>
                                    <input type="text" class="edit-no" 
                                           value="${staff.no}" 
                                           placeholder="No">
                                    <input type="text" class="edit-street" 
                                           value="${staff.street}" 
                                           placeholder="Street">
                                </td>
                                <td>${staff.city}</td>
                                <td>
                                    <button onclick="updateStaffMember('${staff.staff_id}')">
                                        Update
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
        </div>
    `;

    showModal("Staff Management", modalContent);
}

