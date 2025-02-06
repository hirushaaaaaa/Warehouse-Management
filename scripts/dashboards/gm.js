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
    showModal("Staff Management", `
        <h3>Staff Directory</h3>
        <div class="no-data-message">
            <p>No staff records found. Database integration pending.</p>
        </div>
    `);
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
