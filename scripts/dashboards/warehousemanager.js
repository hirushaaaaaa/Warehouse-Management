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

function viewUpcomingDeliveries() {   
    fetch('http://localhost:5002/api/driver/upcoming-deliveries')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.deliveries.length === 0) {
                showModal("Upcoming Deliveries", `
                    <h3>Delivery Schedule</h3>
                    <div class="no-data-message">
                        <p>No upcoming deliveries found.</p>
                    </div>
                `);
                return;
            }

            // Create HTML for each delivery
            const deliveriesHtml = data.deliveries.map(delivery => `
                <div class="delivery-item">
                    <p><strong>Delivery ID:</strong> ${delivery.up_id}</p>
                    <p><strong>Order ID:</strong> ${delivery.gmo_id}</p>
                    <p><strong>Product Name:</strong> ${delivery.up_product_name}</p>
                    <p><strong>Quantity:</strong> ${delivery.up_quantity}</p>
                </div>
            `).join('');

            // Show modal with the list of upcoming deliveries
            showModal("Upcoming Deliveries", `
                <h3>Delivery Schedule</h3>
                ${deliveriesHtml}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch upcoming deliveries. Please try again later.");
        });
}

function checkDamagedStock() {
    const loadingContent = `
        <h3>Damaged Stock Overview</h3>
        <div class="loading">Loading damaged stock data...</div>
    `;
    showModal("Damaged Stock Report", loadingContent);

    fetch('http://localhost:5002/api/damaged-stock')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error("Failed to fetch damaged stock data.");
            }

            const damagedStock = data.damagedStock; // Extracting the array

            const tableContent = `
                <h3>Damaged Stock Overview</h3>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Damaged Stock ID</th>
                                <th>Barcode Scanner ID</th>
                                <th>Supplier Stock ID</th>
                                <th>Quantity</th>
                                <th>GM Order ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${damagedStock.length ? damagedStock.map(item => `
                                <tr>
                                    <td>${item.dsa_id}</td>
                                    <td>${item.bs_id}</td>
                                    <td>${item.sp_id}</td>
                                    <td>${item.dsa_quantity}</td>
                                    <td>${item.gmo_id || 'N/A'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">No damaged stock records found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            showModal("Damaged Stock Report", tableContent);
        })
        .catch(error => {
            console.error('Error fetching damaged stock:', error);
            showModal("Error", "Failed to fetch damaged stock data. Please try again later.");
        });
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

function viewTotalArrivals() {
    const loadingContent = `
        <h3>Total Stock Arrivals</h3>
        <div class="loading">Loading stock arrival data...</div>
    `;
    showModal("Total Arrivals", loadingContent);

    fetch('http://localhost:5002/api/total-arrivals')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error("Failed to fetch total arrivals data.");
            }

            const tableContent = `
                <h3>Total Stock Arrivals Overview</h3>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Stock Type</th>
                                <th>Total Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Good Stock Arrivals</td>
                                <td>${data.goodStockTotal}</td>
                            </tr>
                            <tr>
                                <td>Damaged Stock Arrivals</td>
                                <td>${data.damagedStockTotal}</td>
                            </tr>
                            <tr class="table-info">
                                <td><strong>Total Stock</strong></td>
                                <td><strong>${data.totalStock}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            showModal("Total Arrivals", tableContent);
        })
        .catch(error => {
            console.error('Error fetching total arrivals:', error);
            showModal("Error", "Failed to fetch total arrivals data. Please try again later.");
        });
}