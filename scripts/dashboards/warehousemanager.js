function showWarehouseManagerDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseManagerDashboard').style.display = 'block';
    document.getElementById('wmLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Manager Functions
function checkScannerMaintenance() {
    showModal("Scanner Maintenance", `
        <h3>Scanner Maintenance Status</h3>
        <div class="no-data-message">
            <p>No maintenance records found. Database integration pending.</p>
        </div>
    `);
}

function checkDamagedStock() {
    showModal("Damaged Stock Report", `
        <h3>Damaged Stock Overview</h3>
        <div class="no-data-message">
            <p>No damaged stock records found. Database integration pending.</p>
        </div>
    `);
}

function checkLowStockAlerts() {
    showModal("Low Stock Alerts", `
        <h3>Low Stock Items</h3>
        <div class="no-data-message">
            <p>No low stock alerts found. Database integration pending.</p>
        </div>
    `);
}

function informGM() {
    showModal("Inform General Manager", `
        <h3>Send Notice to GM</h3>
        <form id="gmNoticeForm">
            <select id="noticeType" required>
                <option value="">Select Notice Type</option>
                <option value="urgent">Urgent</option>
                <option value="regular">Regular</option>
                <option value="update">Update</option>
            </select>
            <textarea id="noticeText" placeholder="Enter your message" required></textarea>
            <button type="submit">Send Notice</button>
            <p class="note">Note: Notices will not be saved until database integration.</p>
        </form>
    `);
}