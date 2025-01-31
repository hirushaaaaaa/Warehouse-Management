function showSupplierDashboard() {
    hideAllDashboards();
    document.getElementById('supplierDashboard').style.display = 'block';
    document.getElementById('supLastLogin').textContent = new Date().toLocaleString();
}

// Supplier Functions
function checkForNewOrders() {
    showModal("New Orders", `
        <h3>Pending Orders</h3>
        <div class="no-data-message">
            <p>No new orders found. Database integration pending.</p>
        </div>
    `);
}

function prepareOrders() {
    showModal("Prepare Orders", `
        <h3>Order Preparation</h3>
        <div class="no-data-message">
            <p>No orders to prepare. Database integration pending.</p>
        </div>
    `);
}

function updatePrices() {
    showModal("Update Prices", `
        <h3>Price Update Form</h3>
        <form id="priceUpdateForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="New Price" required>
            <textarea id="priceChangeReason" placeholder="Reason for price change" required></textarea>
            <button type="submit">Update Price</button>
            <p class="note">Note: Price updates will not be saved until database integration.</p>
        </form>
    `);
}

function updateStock() {
    showModal("Update Stock", `
        <h3>Stock Update Form</h3>
        <form id="stockUpdateForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Current Quantity" required>
            <input type="number" placeholder="New Quantity" required>
            <textarea placeholder="Reason for update" required></textarea>
            <button type="submit">Update Stock</button>
            <p class="note">Note: Stock updates will not be saved until database integration.</p>
        </form>
    `);
}