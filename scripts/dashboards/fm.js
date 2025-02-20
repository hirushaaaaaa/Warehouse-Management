function showFinanceManagerDashboard() {
    hideAllDashboards();
    document.getElementById('financeManagerDashboard').style.display = 'block';
    document.getElementById('fmLastLogin').textContent = new Date().toLocaleString();
}

// Finance Manager Functions
function checkAccounts() {
    fetch('http://localhost:5002/api/sales')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.sales.length === 0) {
                showModal("Sales Data", `
                    <h3>Sales Data</h3>
                    <p>No sales data found.</p>
                `);
                return;
            }

            // Create HTML for the sales table
            const salesHtml = `
                <table border="1" style="width: 100%; text-align: center;">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Order ID</th>
                            <th>Product ID</th>
                            <th>Total (LKR)</th>
                            <th>Quantity</th>
                            <th>Price (LKR)</th>
                            <th>User ID</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        ${data.sales.map(sale => `
                            <tr>
                                <td>${sale.sale_id}</td>
                                <td>${sale.co_id}</td>
                                <td>${sale.p_id}</td>
                                <td>${sale.total}</td>
                                <td>${sale.co_quantity}</td>
                                <td>${sale.co_price}</td>
                                <td>${sale.user_id}</td>
                                
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Display the modal with sales data
            showModal("Sales Data", salesHtml);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch sales data. Please try again later.");
        });
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.width = '80%';
    modal.style.maxWidth = '800px';

    modal.innerHTML = `
        <h2>${title}</h2>
        ${content}
        <button onclick="document.body.removeChild(this.parentElement)">Close</button>
    `;

    document.body.appendChild(modal);
}

function closeSalesModal() {
    const modal = document.getElementById('sales-modal');
    if (modal) {
        modal.style.display = 'none';
    }
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

function payrollManagement() {
    fetch('http://localhost:5002/api/payroll')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.payroll.length === 0) {
                showModal("Payroll Management", `
                    <h3>Payroll Data</h3>
                    <p>No payroll data found.</p>
                `);
                return;
            }

            const payrollHtml = data.payroll.map(payroll => `
                <div class="payroll-item">
                    <p><strong>User ID:</strong> ${payroll.user_id}</p>
                    <p><strong>Username:</strong> ${payroll.username}</p>
                    <p><strong>Role Type:</strong> ${payroll.role_type}</p>
                    <p><strong>Amount (LKR):</strong> ${payroll.amount}</p>
                    <div class="payroll-actions">
                        <button onclick="editSalary('${payroll.user_id}', ${payroll.amount})">Edit Salary</button>
                    </div>
                </div>
            `).join('');

            showModal("Payroll Management", `
                <h3>Payroll Data</h3>
                ${payrollHtml}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch payroll data. Please try again later.");
        });
}

function editSalary(user_id, currentAmount) {
    const newAmount = prompt(`Enter the new amount (LKR) for User ID ${user_id}:`, currentAmount);

    if (!newAmount || isNaN(newAmount)) {
        alert('Invalid input. Please enter a valid amount.');
        return;
    }

    fetch(`http://localhost:5002/api/payroll/${user_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: newAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message);
        }
        alert('Salary updated successfully!');
        payrollManagement(); // Refresh the payroll data
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update salary. Please try again later.');
    });
}

function salesReport() {
    console.log('Fetching sales report...'); // Log the start of the function

    fetch('http://localhost:5002/api/sales-report')
        .then(response => {
            console.log('Response received:', response); // Log the response
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data); // Log the data

            if (!data.success) {
                throw new Error(data.message);
            }

            const { totalSales, totalItemsSold, sales } = data.report;

            // Create HTML for the sales report
            const reportHtml = `
                <h3>Summary</h3>
                <p><strong>Total Sales:</strong> Rs. ${totalSales.toFixed(2)}</p>
                <p><strong>Total Items Sold:</strong> ${totalItemsSold}</p>

                <h3>Sales Details</h3>
                <table border="1" style="width: 100%; text-align: center;">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Order ID</th>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Unit Price (LKR)</th>
                            <th>Total (LKR)</th>
                            <th>Customer Name</th>
                        
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr>
                                <td>${sale.sale_id}</td>
                                <td>${sale.co_id}</td>
                                <td>${sale.p_id}</td>
                                <td>${sale.product_name}</td>
                                <td>${sale.co_quantity}</td>
                                <td>${sale.product_unit_price}</td>
                                <td>${sale.sale_total}</td>
                                <td>${sale.customer_name}</td>
                              
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Display the modal with the sales report
            showModal("Sales Report", reportHtml);
        })
        .catch(error => {
            console.error('Error:', error); // Log the error
            showModal("Error", "Failed to generate sales report. Please try again later.");
        });
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.width = '80%';
    modal.style.maxWidth = '1000px';

    modal.innerHTML = `
        <h2>${title}</h2>
        ${content}
        <button onclick="document.body.removeChild(this.parentElement)">Close</button>
    `;

    document.body.appendChild(modal);
}

function closeSalesReportModal() {
    const modal = document.getElementById('sales-report-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function downloadSalesReport() {
    fetch('http://localhost:5002/api/sales-report')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const { totalSales, totalItemsSold, sales } = data.report;

            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Sale ID,Order ID,Product ID,Product Name,Quantity,Unit Price (LKR),Total (LKR),Customer Name,Status\n";
            sales.forEach(sale => {
                csvContent += `${sale.sale_id},${sale.co_id},${sale.p_id},${sale.product_name},${sale.co_quantity},${sale.product_unit_price},${sale.sale_total},${sale.customer_name},${sale.co_status}\n`;
            });

            // Add summary to CSV
            csvContent += `\nTotal Sales,Rs. ${totalSales.toFixed(2)}\n`;
            csvContent += `Total Items Sold,${totalItemsSold}\n`;

            // Create a downloadable link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'sales_report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to download sales report. Please try again later.');
        });
}