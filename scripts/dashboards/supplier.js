function showSupplierDashboard() {
    hideAllDashboards();
    document.getElementById('supplierDashboard').style.display = 'block';
    document.getElementById('supLastLogin').textContent = new Date().toLocaleString();
}

// Supplier Functions
function checkForNewOrders() {
    fetch('http://localhost:5002/api/supplier/pending-orders')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            
            if (data.orders.length === 0) {
                showModal("New Orders", `
                    <h3>Pending Orders</h3>
                    <p>No new orders found.</p>
                `);
                return;
            }

            const ordersHtml = data.orders.map(order => `
                <div class="order-item">
                    <p><strong>Order ID:</strong> ${order.gmo_id}</p>
                    <p><strong>Product ID:</strong> ${order.sp_id}</p>
                    <p><strong>Product Name:</strong> ${order.s_product_name}</p>
                    <p><strong>Requested Quantity:</strong> ${order.req_quantity}</p>
                    <div class="order-actions">
                        <button onclick="updateOrderStatus('${order.gmo_id}', 'Accepted')">Accept</button>
                        <button onclick="updateOrderStatus('${order.gmo_id}', 'Rejected')">Reject</button>
                    </div>
                </div>
            `).join('');

            showModal("New Orders", `
                <h3>Pending Orders</h3>
                ${ordersHtml}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch orders. Please try again later.");
        });
}

function updateOrderStatus(orderId, status) {
    fetch(`http://localhost:5002/api/supplier/update-order/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            // Refresh the orders list
            checkForNewOrders();
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to update order status. Please try again later.");
        });
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