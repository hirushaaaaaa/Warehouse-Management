function showFinanceManagerDashboard() {
    hideAllDashboards();
    document.getElementById('financeManagerDashboard').style.display = 'block';
    document.getElementById('fmLastLogin').textContent = new Date().toLocaleString();
}

// Finance Manager Functions
function checkAccounts() {
    showModal("Account Overview", `
        <h3>Financial Accounts</h3>
        <div class="no-data-message">
            <p>No account records found. Database integration pending.</p>
        </div>
    `);
}

function manageNewPurchase() {
    showModal("New Purchase", `
        <h3>Purchase Record</h3>
        <form id="purchaseForm">
            <input type="text" placeholder="Item Description" required>
            <input type="number" placeholder="Amount" required>
            <select id="purchaseCategory" required>
                <option value="">Select Category</option>
                <option value="equipment">Equipment</option>
                <option value="supplies">Supplies</option>
                <option value="services">Services</option>
            </select>
            <button type="submit">Record Purchase</button>
            <p class="note">Note: Purchase records will not be saved until database integration.</p>
        </form>
    `);
}