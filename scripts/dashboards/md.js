function showMDDashboard() {
    hideAllDashboards();
    document.getElementById('mdDashboard').style.display = 'block';
    document.getElementById('mdLastLogin').textContent = new Date().toLocaleString();
}

// Managing Director Functions
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

function viewFeedback() {
    console.log("View Feedback button clicked");

    // Fetch feedback data from the backend
    fetch("http://localhost:5002/api/feedback", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch feedback.');
        }

        const feedbackData = data.feedback;

        if (feedbackData.length === 0) {
            showModal("Customer Feedback", `
                <h3>No Feedback Found</h3>
                <p>There is no feedback available at the moment.</p>
            `);
            return;
        }

        // Create HTML for feedback table
        const feedbackHtml = `
            <div class="feedback-container">
                <h3>Customer Feedback</h3>
                <table class="feedback-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Feedback</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${feedbackData.map(feedback => `
                            <tr>
                                <td>${feedback.customer_name}</td>
                                <td>${feedback.feedback}</td>
                                <td>${new Date(feedback.created_at).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Display feedback in a modal
        showModal("Customer Feedback", feedbackHtml);
    })
    .catch(error => {
        console.error("Error fetching feedback:", error);
        showModal("Error", "Failed to fetch feedback. Please try again later.");
    });
}

function approveLetters() {
    // Fetch pending letters from the database
    fetch('http://localhost:5002/api/hr/letters')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const letters = data.letters;
                let modalContent = `
                    <h3>Pending Letters for Approval</h3>
                    <div class="letters-container">`;
                
                if (letters.length === 0) {
                    modalContent += `
                        <div class="no-data-message">
                            <p>No pending letters found.</p>
                        </div>`;
                } else {
                    modalContent += `
                        <table class="letters-table">
                            <thead>
                                <tr>
                                    <th>Letter No.</th>
                                    <th>Type</th>
                                    <th>Content</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>`;
                    
                    letters.forEach(letter => {
                        modalContent += `
                            <tr>
                                <td>${letter.hrl_no}</td>
                                <td>${letter.letter_type}</td>
                                <td class="letter-content">${letter.letter_content}</td>
                                <td>${letter.approval_status}</td>
                                <td>
                                    ${letter.approval_status === 'Pending' ? `
                                        <button onclick="updateLetterStatus(${letter.hrl_no}, 'Approved')" class="approve-btn">
                                            Approve
                                        </button>
                                        <button onclick="updateLetterStatus(${letter.hrl_no}, 'Rejected')" class="reject-btn">
                                            Reject
                                        </button>
                                    ` : '-'}
                                </td>
                            </tr>`;
                    });
                    
                    modalContent += `
                            </tbody>
                        </table>`;
                }
                
                modalContent += `</div>`;
                showModal("Letter Approvals", modalContent);
            }
        })
        .catch(error => {
            console.error('Error fetching letters:', error);
            showModal("Error", `
                <div class="error-message">
                    <p>Error loading letters. Please try again later.</p>
                </div>
            `);
        });
}

function updateLetterStatus(letterId, status) {
    fetch(`http://localhost:5002/api/hr/letter/${letterId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refresh the letters list
            approveLetters();
        } else {
            console.error('Error updating letter status:', data.message);
        }
    })
    .catch(error => {
        console.error('Error updating letter status:', error);
    });
}

function generateStockReport() {
    // Close any existing modal before opening a new one
    closeModal();  // Close any existing modal if open
    
    // Show loading modal (can be omitted if no need for loading state)
    //showModal("Report", `<h3>Loading report data...</h3>`);

    fetch('http://localhost:5002/api/stock/report')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error("Failed to fetch report data.");
            }

            const reportContent = `
                <h3>Stock Management Report</h3>
                <div class="scrollable-modal-content">
                    <div class="report-section">
                        <h4>Total Stock Arrivals</h4>
                        <p>Good Stock: ${data.totalArrivals.good_stock}</p>
                        <p>Damaged Stock: ${data.totalArrivals.damaged_stock}</p>
                        <p>Raw Stock: ${data.totalArrivals.raw_stock}</p>
                    </div>
                    <div class="report-section">
                        <h4>Total Stock Departures</h4>
                        <p>Total Departures: ${data.totalDepartures.total_departures}</p>
                    </div>
                    <div class="report-section">
                        <h4>Customer Orders</h4>
                        <p>Pending Orders: ${data.pendingOrders.pending_orders}</p>
                        <p>Completed Orders: ${data.completedOrders.completed_orders}</p>
                    </div>
                    <div class="report-section">
                        <h4>Stock Levels</h4>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.stockLevels.map(stock => `
                                    <tr>
                                        <td>${stock.p_id}</td>
                                        <td>${stock.p_name}</td>
                                        <td>${stock.p_quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            showModal("Report", reportContent);
        })
        .catch(error => {
            console.error('Error generating report:', error);
            showModal("Error", "Failed to generate report. Please try again later.");
        });
}





function manageJobApplications() {
    showModal("Job Applications", `
        <h3>Pending Applications</h3>
        <div class="no-data-message">
            <p>No job applications found. Database integration pending.</p>
        </div>
    `);
}

