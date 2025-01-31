function showWarehouseAssistantDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseAssistantDashboard').style.display = 'block';
    document.getElementById('waLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Assistant Functions
function recordNewStock() {
    showModal("Record New Stock", `
        <h3>New Stock Entry</h3>
        <form id="newStockForm">
            <input type="text" placeholder="Product Name" required>
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Quantity" required>
            <input type="text" placeholder="Location" required>
            <button type="submit">Record Stock</button>
            <p class="note">Note: Stock records will not be saved until database integration.</p>
        </form>
    `);
}

function sendOffStock() {
    showModal("Send Off Stock", `
        <h3>Stock Dispatch</h3>
        <form id="dispatchForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Quantity" required>
            <input type="text" placeholder="Destination" required>
            <button type="submit">Dispatch Stock</button>
            <p class="note">Note: Dispatch records will not be saved until database integration.</p>
        </form>
    `);
}