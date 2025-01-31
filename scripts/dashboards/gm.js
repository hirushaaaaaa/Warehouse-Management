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
    showModal("Supplier Management", `
        <h3>Supplier Directory</h3>
        <div class="no-data-message">
            <p>No suppliers found. Database integration pending.</p>
        </div>
    `);
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
