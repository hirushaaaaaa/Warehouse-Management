// dashboards/general-manager.js
function showGMDashboard() {
    hideAllDashboards();
    document.getElementById('gmDashboard').style.display = 'block';
    document.getElementById('lastLogin').textContent = new Date().toLocaleString();
}

// General Manager Functions
function checkReports() {
    showModal("Reports Overview", `
        <h3>Available Reports</h3>
        <div class="no-data-message">
            <p>No reports found. Database integration pending.</p>
        </div>
    `);
}

function manageOrderApprovals() {
    showModal("Order Approvals", `
        <h3>Pending Approvals</h3>
        <div class="no-data-message">
            <p>No pending orders found. Database integration pending.</p>
        </div>
    `);
}
function giveFeedbackReport() {
    showModal("Give Feedback", `
        <h3>Feedback Form</h3>
        <form id="feedbackForm">
            <select id="feedbackType" required>
                <option value="">Select Type</option>
                <option value="performance">Performance Review</option>
                <option value="incident">Incident Report</option>
                <option value="improvement">Improvement Suggestion</option>
            </select>
            <textarea id="feedbackText" placeholder="Enter your feedback" required></textarea>
            <button type="submit">Submit Feedback</button>
            <p class="note">Note: Database integration pending. Feedback will not be saved.</p>
        </form>
    `);
}

function reviewReport() {
    showModal("Review Reports", `
        <h3>Recent Reports</h3>
        <div class="no-data-message">
            <p>No reports found. Database integration pending.</p>
        </div>
    `);
}

function placeOrder() {
    showModal("Place Order", `
        <h3>New Order</h3>
        <form id="orderForm">
            <select id="supplier" required>
                <option value="">Select Supplier</option>
            </select>
            <p class="note">No suppliers found. Database integration pending.</p>
            <input type="text" placeholder="Item Description" required>
            <input type="number" placeholder="Quantity" required>
            <input type="number" placeholder="Unit Price" required>
            <button type="submit">Submit Order</button>
            <p class="note">Note: Orders will not be saved until database integration.</p>
        </form>
    `);
}

function manageStaff() {
    // Show loading state
    showModal("Staff Management", `
        <h3>Staff Directory</h3>
        <div class="loading-message">
            <p>Loading staff data...</p>
        </div>
    `);

    // First test the API connection
    fetch('http://localhost:5002/api/staff/test')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // If API is working, fetch staff data
                fetchStaffData();
            } else {
                showError('API test failed');
            }
        })
        .catch(error => {
            console.error('API test error:', error);
            showError(`Cannot connect to server. Please ensure the server is running on port 5002.`);
        });
}

function fetchStaffData() {
    fetch('http://localhost:5002/api/staff')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showStaffManagementModal(data.staff);
            } else {
                showError(data.message || 'Failed to fetch staff data');
            }
        })
        .catch(error => {
            console.error('Error fetching staff data:', error);
            showError(`Error: ${error.message}`);
        });
}

function showStaffManagementModal(staffData) {
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
                            <th>Street</th>
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
                                </td>
                                <td> 
                                    <input type="text" class="edit-street" 
                                           value="${staff.street}" 
                                           placeholder="Street">
                                </td>
                                <td><input type="text" class="edit-city" 
                                           value="${staff.city}" 
                                           placeholder="City">
                                </td>
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

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '10px';
    errorDiv.style.marginTop = '10px';
    errorDiv.textContent = message;
    
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(errorDiv);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = 'green';
    successDiv.style.padding = '10px';
    successDiv.style.marginTop = '10px';
    successDiv.textContent = message;
    
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(successDiv);
    } else {
        alert(message);
    }
}

async function updateStaffMember(staffId) {
    // Find the row for the specific staff member
    const row = document.querySelector(`tr[data-staff-id="${staffId}"]`);
    
    // Collect updated information from input fields
    const updatedData = {
        name: row.querySelector('.edit-name').value,
        email: row.querySelector('.edit-email').value,
        tele_no: row.querySelector('.edit-phone').value,
        no: row.querySelector('.edit-no').value,
        street: row.querySelector('.edit-street').value,
        city: row.querySelector('.edit-city').value
    };

    try {
        // Send PUT request to update staff member
        const response = await fetch(`http://localhost:5002/api/staff/${staffId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        // Log the raw response for debugging
        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            alert('Staff member updated successfully');
        } else {
            alert(`Update failed: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Full error details:', error);
        alert(`Network or parsing error: ${error.message}`);
    }
}



function manageSuppliers() {
    const modalContent = `
        <h3>Add New Supplier</h3>
        <form id="addSupplierForm" onsubmit="saveSupplier(event)">
            <div class="form-group">
                <label for="supId">Supplier ID:</label>
                <input type="text" id="supId" name="supId" required maxlength="10" 
                    pattern="[A-Za-z0-9]+" title="Only letters and numbers allowed"
                    class="form-control">
            </div>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="no">Building No:</label>
                <input type="text" id="no" name="no" required maxlength="10" class="form-control">
            </div>
            <div class="form-group">
                <label for="street">Street:</label>
                <input type="text" id="street" name="street" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="city">City:</label>
                <input type="text" id="city" name="city" required maxlength="50" class="form-control">
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="teleNo">Telephone:</label>
                <input type="tel" id="teleNo" name="teleNo" required maxlength="20" 
                    pattern="[0-9]+" title="Only numbers allowed"
                    class="form-control">
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required 
                    minlength="6" maxlength="50" 
                    class="form-control">
                <small class="form-text text-muted">Password must be at least 6 characters long</small>
            </div>
            <div id="errorMessage" class="error-message" style="display: none;"></div>
            <div class="form-actions">
                <button type="submit" class="btn btn-success">Save Supplier</button>
            </div>
        </form>
    `;

    showModal("Add Supplier", modalContent);
}

function saveSupplier(event) {
    event.preventDefault();
    
    // Clear any previous error messages
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
    
    const formData = {
        sup_id: document.getElementById('supId').value,
        name: document.getElementById('name').value,
        no: document.getElementById('no').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        email: document.getElementById('email').value,
        tele_no: document.getElementById('teleNo').value,
        password: document.getElementById('password').value
    };

    fetch('http://localhost:5002/api/suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Supplier added successfully!');
            closeModal();
        } else {
            errorDiv.textContent = data.message || 'Error adding supplier. Please try again.';
            errorDiv.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = 'Network error. Please check your connection and try again.';
        errorDiv.style.display = 'block';
    });
}


function reEnterCredentials() {
    showModal("Re-enter Credentials", `
        <h3>Verify Identity</h3>
        <form id="reAuthForm">
            <input type="password" placeholder="Enter your password" required>
            <button type="submit">Verify</button>
        </form>
    `);
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        location.reload();
    }
}
