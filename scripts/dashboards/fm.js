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
    fetch('http://localhost:5002/api/supplier/accepted-orders')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            
            if (data.orders.length === 0) {
                showModal("Supplier Purchases", `
                    <h3>Accepted Orders</h3>
                    <p>No new orders to process.</p>
                `);
                return;
            }
            
            const ordersHtml = data.orders.map(order => `
                <div class="order-item">
                    <p><strong>Order ID:</strong> ${order.gmo_id}</p>
                    <p><strong>SP ID:</strong> ${order.sp_id}</p>
                    <p><strong>Product Name:</strong> ${order.s_product_name}</p>
                    <p><strong>Requested Quantity:</strong> ${order.req_quantity}</p>
                    <p><strong>Total Amount:</strong> Rs.${order.gmo_total}</p>
                    <div class="order-actions">
                        <button onclick="addToAccounts('${order.gmo_id}', ${order.gmo_total})">Add to Accounts</button>
                    </div>
                </div>
            `).join('');
            
            showModal("Supplier Purchases", `
                <h3>Accepted Orders</h3>
                ${ordersHtml}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch orders. Please try again later.");
        });
}

function addToAccounts(gmo_id, gmo_total) {
    fetch('http://localhost:5002/api/supplier/add-to-accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gmo_id,
            gmo_total
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message);
        }
        alert('Successfully added to accounts!');
        manageNewPurchase(); // Refresh the list
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to add to accounts. Please try again later.");
    });
}