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
                    <p><strong>SP ID:</strong> ${order.sp_id}</p>
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
    fetch('http://localhost:5002/api/gm/all-orders')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            // Filter orders with status "Accepted"
            const acceptedOrders = data.orders.filter(order => order.gmo_status === "Accepted");

            if (acceptedOrders.length === 0) {
                showModal("Prepare Orders", `
                    <h3>Order Preparation</h3>
                    <p>No orders with status "Accepted" found.</p>
                `);
                return;
            }

            // Create dropdown options for accepted orders
            const dropdownOptions = acceptedOrders.map(order => `
                <option value="${order.gmo_id}">
                    Order ID: ${order.gmo_id} | SP Id: ${order.sp_id} |Product: ${order.s_product_name} | Quantity: ${order.req_quantity}
                </option>
            `).join('');

            // Show modal with dropdown and "Send Order" button
            showModal("Prepare Orders", `
                <h3>Order Preparation</h3>
                <label for="orderDropdown">Select Order:</label>
                <select id="orderDropdown">
                    ${dropdownOptions}
                </select>
                <button onclick="sendOrder()" class="send-order-btn">Send Order</button>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch orders. Please try again later.");
        });
}

// Function to handle "Send Order" button click
function sendOrder() {
    const orderDropdown = document.getElementById('orderDropdown');
    const selectedOrderId = orderDropdown.value;

    if (!selectedOrderId) {
        alert("Please select an order.");
        return;
    }

    fetch(`http://localhost:5002/api/supplier/send-order/${selectedOrderId}`, {
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
            alert("Order sent successfully!");
            prepareOrders(); // Refresh the orders list
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to send order. Please try again later.");
        });
}

function updatePrices() {
    // First fetch products to populate the select dropdown
    fetch('http://localhost:5002/api/gm/supplier-stock')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.stock) {
                showModal("Error", `
                    <h3>Error</h3>
                    <p>Unable to load products. Please try again later.</p>
                `);
                return;
            }

            const productOptions = data.stock.map(product => 
                `<option value="${product.sp_id}" data-price="${product.sp_unitprice}">
                    ${product.sp_id} - ${product.s_product_name}
                </option>`
            ).join('');

            showModal("Update Prices", `
                <h3>Price Update Form</h3>
                <form id="priceUpdateForm" class="mt-3">
                    <div class="form-group mb-3">
                        <label for="productSelect">Select Product:</label>
                        <select id="productSelect" class="form-control" required>
                            <option value="">Select a product...</option>
                            ${productOptions}
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label>Current Price:</label>
                        <input type="text" id="currentPrice" class="form-control" readonly>
                    </div>
                    <div class="form-group mb-3">
                        <label for="newPrice">New Price:</label>
                        <input type="number" id="newPrice" class="form-control" step="0.01" min="0" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Update Price</button>
                </form>
            `);

            // Add event listeners after modal is shown
            const form = document.getElementById('priceUpdateForm');
            const productSelect = document.getElementById('productSelect');
            const currentPriceInput = document.getElementById('currentPrice');

            // Update current price when product is selected
            productSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const currentPrice = selectedOption.dataset.price;
                currentPriceInput.value = currentPrice ? `LKR${currentPrice}` : '';
            });

            // Handle form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const sp_id = productSelect.value;
                const newPrice = document.getElementById('newPrice').value;

                if (!sp_id || !newPrice) {
                    alert('Please fill in all fields');
                    return;
                }

                fetch('http://localhost:5002/api/update-price', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sp_id: sp_id,
                        new_price: parseFloat(newPrice)
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showModal("Success", `
                            <h3>Success</h3>
                            <p>Price updated successfully!</p>
                        `);
                    } else {
                        throw new Error(data.message || 'Failed to update price');
                    }
                })
                .catch(error => {
                    showModal("Error", `
                        <h3>Error</h3>
                        <p>${error.message}</p>
                    `);
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", `
                <h3>Error</h3>
                <p>Unable to load products. Please try again later.</p>
            `);
        });
}

function updateStock() {
    // First fetch products to populate the select dropdown
    fetch('http://localhost:5002/api/gm/supplier-stock')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.stock) {
                showModal("Error", `
                    <h3>Error</h3>
                    <p>Unable to load products. Please try again later.</p>
                `);
                return;
            }

            const productOptions = data.stock.map(product => 
                `<option value="${product.sp_id}" data-quantity="${product.s_quantity}">
                    ${product.sp_id} - ${product.s_product_name}
                </option>`
            ).join('');

            showModal("Update Stock", `
                <h3>Stock Update Form</h3>
                <form id="stockUpdateForm" class="mt-3">
                    <div class="form-group mb-3">
                        <label for="productSelect">Select Product:</label>
                        <select id="productSelect" class="form-control" required>
                            <option value="">Select a product...</option>
                            ${productOptions}
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label>Current Stock:</label>
                        <input type="text" id="currentStock" class="form-control" readonly>
                    </div>
                    <div class="form-group mb-3">
                        <label for="addStock">Additional Stock:</label>
                        <input type="number" id="addStock" class="form-control" min="1" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Update Stock</button>
                </form>
            `);

            // Add event listeners after modal is shown
            const form = document.getElementById('stockUpdateForm');
            const productSelect = document.getElementById('productSelect');
            const currentStockInput = document.getElementById('currentStock');

            // Update current stock when product is selected
            productSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const currentStock = selectedOption.dataset.quantity;
                currentStockInput.value = currentStock || '';
            });

            // Handle form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const sp_id = productSelect.value;
                const additionalStock = parseInt(document.getElementById('addStock').value);
                const currentStock = parseInt(currentStockInput.value);

                if (!sp_id || !additionalStock) {
                    alert('Please fill in all fields');
                    return;
                }

                fetch('http://localhost:5002/api/update-stock', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sp_id: sp_id,
                        additional_stock: additionalStock,
                        current_stock: currentStock
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showModal("Success", `
                            <h3>Success</h3>
                            <p>Stock updated successfully!</p>
                            <p>New stock level: ${data.new_quantity}</p>
                        `);
                    } else {
                        throw new Error(data.message || 'Failed to update stock');
                    }
                })
                .catch(error => {
                    showModal("Error", `
                        <h3>Error</h3>
                        <p>${error.message}</p>
                    `);
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", `
                <h3>Error</h3>
                <p>Unable to load products. Please try again later.</p>
            `);
        });
}

//most purchased item report
function generateMostPurchasedReport() {
    closeModal();

    fetch('http://localhost:5002/api/most-purchased-products')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error("Failed to fetch report data.");
            }

            const reportContent = `
                <h3>Most Purchased Products Report</h3>
                <div class="report-section">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Total Quantity Purchased</th>
                                <th>Total Amount Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.data.map(product => `
                                <tr>
                                    <td>${product.product_name}</td>
                                    <td>${product.total_quantity_purchased}</td>
                                    <td>${product.total_amount_spent.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            showModal("Most Purchased Products Report", reportContent);
        })
        .catch(error => {
            console.error('Error generating report:', error);
            showModal("Error", "Failed to generate report. Please try again later.");
        });
}