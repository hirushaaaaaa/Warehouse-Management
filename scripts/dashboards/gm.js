// dashboards/general-manager.js
function showGMDashboard() {
    hideAllDashboards();
    document.getElementById('gmDashboard').style.display = 'block';
    document.getElementById('lastLogin').textContent = new Date().toLocaleString();
}

// General Manager Functions
function checkReports() {
    showModal("Reports Overview", `
        <h3>Available Reports</h3>
        <div class="no-data-message">
            <p>No reports found. Database integration pending.</p>
        </div>
    `);
}

function manageOrderApprovals() {
    fetch('http://localhost:5002/api/gm/all-orders')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (!data.orders || data.orders.length === 0) {
                showModal("Order Approvals", "No orders found.");
                return;
            }

            // Group orders by status
            const groupedOrders = {
                Pending: [],
                Accepted: [],
                Rejected: [],
                Sent: []
            };

            data.orders.forEach(order => {
                if (groupedOrders.hasOwnProperty(order.gmo_status)) {
                    groupedOrders[order.gmo_status].push(order);
                }
            });

            // Generate HTML for each status group
            const ordersHtml = Object.keys(groupedOrders).map(status => {
                if (groupedOrders[status].length === 0) return ''; // Skip empty groups
                
                const ordersList = groupedOrders[status].map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>Order #${order.gmo_id}</h3>
                            <span class="status-${order.gmo_status.toLowerCase()}">
                                ${order.gmo_status}
                            </span>
                        </div>
                        
                        <div class="order-details">
                            <div class="detail-group">
                                <p><strong>Product ID:</strong> ${order.sp_id}</p>
                                <p><strong>Product Name:</strong> ${order.s_product_name}</p>
                                <p><strong>Requested Quantity:</strong> ${order.req_quantity}</p>
                                <p><strong>Created:</strong> ${order.created_date}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

                return `
                    <h2 class="status-heading">${status} Orders</h2>
                    <div class="orders-group">${ordersList}</div>
                `;
            }).join('');

            showModal("Order Approvals", ordersHtml);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch orders. Please try again later.");
        });
}



function updateOrderStatus(gmoId, newStatus) {
    fetch(`http://localhost:5002/api/gm/update-order-status/${gmoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message);
        }
        showModal("Success", `Order #${gmoId} status updated to ${newStatus}`);
        manageOrderApprovals(); // Refresh the orders list
    })
    .catch(error => {
        console.error('Error updating order:', error);
        showModal("Error", "Failed to update order status. Please try again later.");
    });
}


function giveFeedbackReport() {
    showModal("Give Feedback", `
        <h3>Feedback Form</h3>
        <form id="feedbackForm">
            <select id="feedbackType" required>
                <option value="">Select Type</option>
                <option value="performance">Performance Review</option>
                <option value="incident">Incident Report</option>
                <option value="improvement">Improvement Suggestion</option>
            </select>
            <textarea id="feedbackText" placeholder="Enter your feedback" required></textarea>
            <button type="submit">Submit Feedback</button>
            <p class="note">Note: Database integration pending. Feedback will not be saved.</p>
        </form>
    `);
}

function reviewReport() {
    showModal("Review Reports", `
        <h3>Recent Reports</h3>
        <div class="no-data-message">
            <p>No reports found. Database integration pending.</p>
        </div>
    `);
}

// In gm.js - Updated placeOrder function
function placeOrder() {
    showModal("Place Order", `
        <h3>New Order</h3>
        <form id="orderForm" class="order-form">
            <div class="form-group">
                <label for="productId">Product ID:</label>
                <select id="productId" required>
                    <option value="">Select Product</option>
                </select>
            </div>
            <div class="form-group">
                <label for="productInfo">Product Information:</label>
                <div id="productInfo" class="product-info">
                    Select a product to see details
                </div>
            </div>
            <div class="form-group">
                <label for="quantity">Requested Quantity:</label>
                <input type="number" id="quantity" min="1" required>
                <div id="quantityError" class="error-message" style="display: none;"></div>
            </div>
            <div class="form-group">
                <label for="totalPrice">Total Price:</label>
                <div id="totalPrice" class="total-price">
                    Rs. 0.00
                </div>
            </div>
            <button type="submit">Submit Order</button>
        </form>
    `);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .order-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .product-info {
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
        }
        .error-message {
            color: red;
            font-size: 0.9em;
        }
        .total-price {
            font-weight: bold;
            font-size: 1.2em;
        }
    `;
    document.head.appendChild(style);

    let selectedProduct = null;

    // Fetch product list for dropdown
    const token = localStorage.getItem('token');
    fetch('http://localhost:5002/api/gm/products', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const productSelect = document.getElementById('productId');
            data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.sp_id;
                option.textContent = `${product.sp_id} - ${product.s_product_name}`;
                productSelect.appendChild(option);
            });

            // Add change event to show product details
            productSelect.addEventListener('change', function() {
                selectedProduct = data.products.find(p => p.sp_id === this.value);
                const productInfo = document.getElementById('productInfo');
                const totalPrice = document.getElementById('totalPrice');
                
                if (selectedProduct) {
                    productInfo.innerHTML = `
                        <strong>Product Name:</strong> ${selectedProduct.s_product_name}<br>
                        <strong>Available Quantity:</strong> ${selectedProduct.s_quantity}<br>
                        <strong>Unit Price:</strong> LKR ${selectedProduct.sp_unitprice.toLocaleString()}
                    `;
                    
                    // Show initial total as Rs. 0.00
                    totalPrice.textContent = `Rs. 0.00`;
                } else {
                    productInfo.innerHTML = 'Select a product to see details';
                    totalPrice.textContent = `Rs. 0.00`; // Keep total at 0 when no product selected
                }
            });
        }
    });

    // Handle form submission
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const quantity = document.getElementById('quantity').value;
        const quantityError = document.getElementById('quantityError');
        
        if (!productId || !quantity) {
            quantityError.textContent = 'Please fill all fields';
            quantityError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/gm/place-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sp_id: productId,
                    req_quantity: parseInt(quantity)
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Order placed successfully!');
                closeModal();
            } else {
                quantityError.textContent = data.message;
                quantityError.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            quantityError.textContent = 'Error connecting to server';
            quantityError.style.display = 'block';
        }
    });

    // Update total price dynamically based on quantity
    const quantityInput = document.getElementById('quantity');
    const totalPriceElement = document.getElementById('totalPrice');
    
    quantityInput.addEventListener('input', function() {
        if (selectedProduct) {
            const quantity = parseInt(quantityInput.value);
            if (quantity && quantity >= 1) {
                const total = selectedProduct.sp_unitprice * quantity;
                totalPriceElement.textContent = `Rs. ${total.toFixed(2)}`;
            } else {
                totalPriceElement.textContent = `Rs. 0.00`;  // If no quantity is selected, set total to 0
            }
        } else {
            totalPriceElement.textContent = `Rs. 0.00`;  // If no product is selected, keep total at 0
        }
    });
}



function manageStaff() {
    // Show loading state
    showModal("Staff Management", `
        <h3>Staff Directory</h3>
        <div class="loading-message">
            <p>Loading staff data...</p>
        </div>
    `);

    // First test the API connection
    fetch('http://localhost:5002/api/staff/test')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // If API is working, fetch staff data
                fetchStaffData();
            } else {
                showError('API test failed');
            }
        })
        .catch(error => {
            console.error('API test error:', error);
            showError(`Cannot connect to server. Please ensure the server is running on port 5002.`);
        });
}

function fetchStaffData() {
    fetch('http://localhost:5002/api/staff')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showStaffManagementModal(data.staff);
            } else {
                showError(data.message || 'Failed to fetch staff data');
            }
        })
        .catch(error => {
            console.error('Error fetching staff data:', error);
            showError(`Error: ${error.message}`);
        });
}

function showStaffManagementModal(staffData) {
    const modalContent = `
        <div class="staff-management-container">
            <h3>Staff Management</h3>
            ${staffData.length === 0 ?
                '<div class="no-data-message">No staff records found.</div>' :
                `<table class="staff-table">
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>Role</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Street</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${staffData.map(staff => `
                            <tr data-staff-id="${staff.staff_id}">
                                <td>${staff.staff_id}</td>
                                <td>${staff.role}</td>
                                <td>
                                    <input type="text" class="edit-name" 
                                           value="${staff.name}" 
                                           placeholder="Full Name">
                                </td>
                                <td>
                                    <input type="email" class="edit-email" 
                                           value="${staff.email}" 
                                           placeholder="Email">
                                </td>
                                <td>
                                    <input type="tel" class="edit-phone" 
                                           value="${staff.tele_no}" 
                                           placeholder="Phone">
                                </td>
                                <td>
                                    <input type="text" class="edit-no" 
                                           value="${staff.no}" 
                                           placeholder="No">
                                </td>
                                <td> 
                                    <input type="text" class="edit-street" 
                                           value="${staff.street}" 
                                           placeholder="Street">
                                </td>
                                <td><input type="text" class="edit-city" 
                                           value="${staff.city}" 
                                           placeholder="City">
                                </td>
                                <td>
                                    <button onclick="updateStaffMember('${staff.staff_id}')">
                                        Update
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
        </div>
    `;
    
    showModal("Staff Management", modalContent);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '10px';
    errorDiv.style.marginTop = '10px';
    errorDiv.textContent = message;
    
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(errorDiv);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = 'green';
    successDiv.style.padding = '10px';
    successDiv.style.marginTop = '10px';
    successDiv.textContent = message;
    
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(successDiv);
    } else {
        alert(message);
    }
}

async function updateStaffMember(staffId) {
    // Find the row for the specific staff member
    const row = document.querySelector(`tr[data-staff-id="${staffId}"]`);
    
    // Collect updated information from input fields
    const updatedData = {
        name: row.querySelector('.edit-name').value,
        email: row.querySelector('.edit-email').value,
        tele_no: row.querySelector('.edit-phone').value,
        no: row.querySelector('.edit-no').value,
        street: row.querySelector('.edit-street').value,
        city: row.querySelector('.edit-city').value
    };

    try {
        // Send PUT request to update staff member
        const response = await fetch(`http://localhost:5002/api/staff/${staffId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        // Log the raw response for debugging
        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            alert('Staff member updated successfully');
        } else {
            alert(`Update failed: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Full error details:', error);
        alert(`Network or parsing error: ${error.message}`);
    }
}



function manageSuppliers() {
    const modalContent = `
        <h3>Add New Supplier</h3>
        <form id="addSupplierForm" onsubmit="saveSupplier(event)">
            <div class="form-group">
                <label for="supId">Supplier ID:</label>
                <input type="text" id="supId" name="supId" required maxlength="10" 
                    pattern="[A-Za-z0-9]+" title="Only letters and numbers allowed"
                    class="form-control">
            </div>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="no">Building No:</label>
                <input type="text" id="no" name="no" required maxlength="10" class="form-control">
            </div>
            <div class="form-group">
                <label for="street">Street:</label>
                <input type="text" id="street" name="street" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="city">City:</label>
                <input type="text" id="city" name="city" required maxlength="50" class="form-control">
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required maxlength="100" class="form-control">
            </div>
            <div class="form-group">
                <label for="teleNo">Telephone:</label>
                <input type="tel" id="teleNo" name="teleNo" required maxlength="20" 
                    pattern="[0-9]+" title="Only numbers allowed"
                    class="form-control">
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required 
                    minlength="6" maxlength="50" 
                    class="form-control">
                <small class="form-text text-muted">Password must be at least 6 characters long</small>
            </div>
            <div id="errorMessage" class="error-message" style="display: none;"></div>
            <div class="form-actions">
                <button type="submit" class="btn btn-success">Save Supplier</button>
            </div>
        </form>
    `;

    showModal("Add Supplier", modalContent);
}

function saveSupplier(event) {
    event.preventDefault();
    
    // Clear any previous error messages
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
    
    const formData = {
        sup_id: document.getElementById('supId').value,
        name: document.getElementById('name').value,
        no: document.getElementById('no').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        email: document.getElementById('email').value,
        tele_no: document.getElementById('teleNo').value,
        password: document.getElementById('password').value
    };

    fetch('http://localhost:5002/api/suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Supplier added successfully!');
            closeModal();
        } else {
            errorDiv.textContent = data.message || 'Error adding supplier. Please try again.';
            errorDiv.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = 'Network error. Please check your connection and try again.';
        errorDiv.style.display = 'block';
    });
}


function supplierStock() {
    showModal("Supplier Stock Information", `
        <h3>Current Stock Levels</h3>
        <div class="stock-table-container">
            <table class="stock-table">
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Product Name</th>
                        <th>Available Quantity</th>
                        <th>Unit Price (Rs.)</th>
                    </tr>
                </thead>
                <tbody id="stockTableBody">
                    <tr>
                        <td colspan="4">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `);

    // Add some basic styling to the modal
    const style = document.createElement('style');
    style.textContent = `
        .stock-table-container {
            max-height: 400px;
            overflow-y: auto;
            margin-top: 20px;
        }
        .stock-table {
            width: 100%;
            border-collapse: collapse;
        }
        .stock-table th, .stock-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .stock-table th {
            background-color: #f4f4f4;
            position: sticky;
            top: 0;
        }
        .stock-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .stock-table tr:hover {
            background-color: #f5f5f5;
        }
    `;
    document.head.appendChild(style);

    // Fetch stock data
    const token = localStorage.getItem('token');
    fetch('http://localhost:5002/api/gm/supplier-stock', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const tableBody = document.getElementById('stockTableBody');
            tableBody.innerHTML = data.stock.map(item => `
                <tr>
                    <td>${item.sp_id}</td>
                    <td>${item.s_product_name}</td>
                    <td>${item.s_quantity}</td>
                    <td>${item.sp_unitprice.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'LKR'
                    })}</td>
                </tr>
            `).join('');
        } else {
            document.getElementById('stockTableBody').innerHTML = `
                <tr>
                    <td colspan="4">Error loading stock data</td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('stockTableBody').innerHTML = `
            <tr>
                <td colspan="4">Error connecting to server</td>
            </tr>
        `;
    });
}


function logout() {
    if (confirm("Are you sure you want to logout?")) {
        location.reload();
    }
}
