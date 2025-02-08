function showWarehouseManagerDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseManagerDashboard').style.display = 'block';
    document.getElementById('wmLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Manager Functions
function checkScannerMaintenance() {
    fetch('http://localhost:5002/api/scanner-services')
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message);
        }

        const records = data.services;
        let content = `
            <h3>Barcode Scanner Maintenance</h3>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Service ID</th>
                            <th>Scanner ID</th>
                            <th>Section</th>
                            <th>Service Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (records && records.length > 0) {
            records.forEach(record => {
                content += `
                    <tr>
                        <td>${record.s_service_id}</td>
                        <td>${record.bs_id}</td>
                        <td>${record.section}</td>
                        <td>${new Date(record.date).toLocaleString()}</td>
                    </tr>
                `;
            });
        } else {
            content += `
                <tr>
                    <td colspan="4" class="text-center">No service records found.</td>
                </tr>
            `;
        }

        content += `
                </tbody>
            </table>
        </div>`;

        showModal("Scanner Status", content);
    })
    .catch(error => {
        console.error('Error:', error);
        showModal("Scanner Status", `
            <div class="alert alert-danger">
                Error loading service records: ${error.message}
            </div>
        `);
    });
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