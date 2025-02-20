// modal.js

// Function to show a modal with a title and content
function showModal(title, content) {
    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Create the modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    // Create the modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Add the title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);

    // Add the content
    const modalBody = document.createElement('div');
    modalBody.innerHTML = content;
    modalContent.appendChild(modalBody);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close-button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(closeButton);

    // Append the modal content to the container
    modalContainer.appendChild(modalOverlay);
    modalContainer.appendChild(modalContent);

    // Append the modal to the body
    document.body.appendChild(modalContainer);

    // Close modal when clicking outside the content
    modalOverlay.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
}

// Function to close the modal
function closeModal() {
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        document.body.removeChild(modalContainer);
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

    // Pass true as third parameter to indicate it's a wide modal
    showModal("Staff Management", modalContent, true);
}

