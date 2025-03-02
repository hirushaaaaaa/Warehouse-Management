function showModal(title, content, isWide = false) {
    closeModal(); // Close any existing modal before opening a new one

    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Create the modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    modalOverlay.addEventListener('click', closeModal);

    // Create the modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    if (isWide) {
        modalContent.classList.add('wide-modal');
    }

    // Add the title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;

    // Add the scrollable modal body
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modalBody.innerHTML = content;

    // Create a fixed close button at the bottom
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close-button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', closeModal);

    // Append elements
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(closeButton);

    modalContainer.appendChild(modalOverlay);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Prevent scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    // Remove all modal containers
    document.querySelectorAll('.modal-container').forEach(container => container.remove());

    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// Fetch staff data from API
async function fetchStaffData() {
    try {
        const response = await fetch('http://localhost:5002/api/staff');
        if (!response.ok) throw new Error('Failed to fetch staff data');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


// Show staff management modal with data
async function showStaffManagementModal() {
    const staffData = await fetchStaffData();

    const modalContent = `
        <div class="staff-management-container">
            <h3>Staff Management</h3>
            ${staffData.length === 0 ? `
                <div class="no-data-message">No staff records found.</div>
            ` : `
                <table class="staff-table">
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
                                <td><input type="text" class="edit-name" value="${staff.name}"></td>
                                <td><input type="email" class="edit-email" value="${staff.email}"></td>
                                <td><input type="tel" class="edit-phone" value="${staff.tele_no}"></td>
                                <td>
                                    <input type="text" class="edit-no" value="${staff.no}" placeholder="No">
                                    <input type="text" class="edit-street" value="${staff.street}" placeholder="Street">
                                </td>
                                <td>${staff.city}</td>
                                <td>
                                    <button onclick="updateStaffMember('${staff.staff_id}')">Update</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;

    // Pass `true` to make the modal wide
    showModal("Staff Management", modalContent, true);
}