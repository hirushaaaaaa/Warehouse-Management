function showWarehouseDriverDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseDriverDashboard').style.display = 'block';
    document.getElementById('wdLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Driver Functions
function checkForUpcomingDeliveries() {
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
                <div class="scrollable-modal-content">
                    ${deliveriesHtml}
                </div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch upcoming deliveries. Please try again later.");
        });
}


// Function to check for new arrivals
function checkForNewArrivals() {
    fetch('http://localhost:5002/api/driver/upcoming-stock')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.stock.length === 0) {
                showModal("New Arrivals", `
                    <h3>Recent Arrivals</h3>
                    <div class="no-data-message">
                        <p>No new arrivals found.</p>
                    </div>
                `);
                return;
            }

            // Create dropdown options for upcoming stock entries
            const dropdownOptions = data.stock.map(stock => `
                <option value="${stock.up_id}">
                    ${stock.up_id} - ${stock.up_product_name} (${stock.up_quantity})
                </option>
            `).join('');

            // Show modal with dropdown and "Received" button
            showModal("New Arrivals", `
                <h3>Recent Arrivals</h3>
                <label for="stockDropdown">Select Arrival:</label>
                <select id="stockDropdown">
                    ${dropdownOptions}
                </select>
                <button onclick="displayStockDetails()" class="select-btn">Select</button>
                <div id="stockDetails"></div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch new arrivals. Please try again later.");
        });
}

// Function to display details of the selected stock entry
function displayStockDetails() {
    const stockDropdown = document.getElementById('stockDropdown');
    const selectedUpId = stockDropdown.value;

    if (!selectedUpId) {
        alert("Please select an arrival.");
        return;
    }

    fetch(`http://localhost:5002/api/driver/upcoming-stock`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const selectedStock = data.stock.find(stock => stock.up_id == selectedUpId);

            if (!selectedStock) {
                throw new Error("Selected stock entry not found.");
            }

            // Display details of the selected stock entry
            const stockDetailsHtml = `
                <div class="stock-details">
                    <p><strong>Delivery ID:</strong> ${selectedStock.up_id}</p>
                    <p><strong>Supplier ID:</strong> ${selectedStock.sp_id}</p>
                    <p><strong>Order ID:</strong> ${selectedStock.gmo_id}</p>
                    <p><strong>Product Name:</strong> ${selectedStock.up_product_name}</p>
                    <p><strong>Quantity:</strong> ${selectedStock.up_quantity}</p>
                    <button onclick="receiveStock('${selectedStock.up_id}')" class="receive-btn">Received</button>
                </div>
            `;

            document.getElementById('stockDetails').innerHTML = stockDetailsHtml;
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to fetch stock details. Please try again later.");
        });
}

// Function to handle "Received" button click
function receiveStock(upId) {
    fetch(`http://localhost:5002/api/driver/receive-stock/${upId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            alert("Stock received and moved to 'To Be Delivered' successfully!");
            checkForNewArrivals(); // Refresh the arrivals list
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to receive stock. Please try again later.");
        });
}

// Function to view total deliveries
function viewTotalDeliveries() {
    fetch('http://localhost:5002/api/driver/delivered-stock')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const deliveredStock = data.deliveredStock;
            const totalDeliveries = data.totalDeliveries;

            if (deliveredStock.length === 0) {
                showModal("Total Deliveries", `
                    <h3>Total Deliveries</h3>
                    <div class="no-data-message">
                        <p>No delivered stock found.</p>
                    </div>
                `);
                return;
            }

            // Create HTML for the delivered stock table
            const tableRows = deliveredStock.map(stock => `
                <tr>
                    <td>${stock.tbdp_id}</td>
                    <td>${stock.gmo_id}</td>
                    <td>${stock.sp_id}</td>
                    <td>${stock.tbdp__name}</td>
                    <td>${stock.tbdp_quantity}</td>
                    <td>${stock.tbdp_status}</td>
                </tr>
            `).join('');

            // Show modal with the delivered stock table and total count
            showModal("Total Deliveries", `
                <h3>Total Deliveries</h3>
                <table class="delivered-stock-table">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Order ID</th>
                            <th>Supplier ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="total-deliveries">
                    <p><strong>Total Deliveries:</strong> ${totalDeliveries}</p>
                </div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch delivered stock. Please try again later.");
        });
}

// Function to view total deliveries
function viewTotalDeliveries() {
    fetch('http://localhost:5002/api/warehouse/total-deliveries')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const totalDeliveries = data.totalDeliveries;

            if (totalDeliveries === 0) {
                showModal("Total Deliveries", `
                    <h3>Total Deliveries</h3>
                    <div class="no-data-message">
                        <p>No delivered stock found.</p>
                    </div>
                `);
                return;
            }

            // Show modal with the total deliveries count
            showModal("Total Deliveries", `
                <h3>Total Deliveries</h3>
                <div class="total-deliveries">
                    <p><strong>Total Deliveries:</strong> ${totalDeliveries}</p>
                </div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch total deliveries. Please try again later.");
        });
}

