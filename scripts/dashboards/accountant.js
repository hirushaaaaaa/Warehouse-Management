function showAccountantDashboard() {
    hideAllDashboards();
    document.getElementById('accountantDashboard').style.display = 'block';
    document.getElementById('faLastLogin').textContent = new Date().toLocaleString();
}

// Accountant Functions
function uploadReports() {
    showModal("Upload Reports", `
        <h3>Financial Report Upload</h3>
        <form id="reportUploadForm">
            <select id="reportType" required>
                <option value="">Select Report Type</option>
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Report</option>
                <option value="annual">Annual Report</option>
            </select>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" required>
            <textarea placeholder="Additional notes" required></textarea>
            <button type="submit">Upload Report</button>
            <p class="note">Note: Report uploads will not be saved until database integration.</p>
        </form>
    `);
}

function manageSalaryPayments() {
    // Show the modal with the form
    showModal("Salary Payments", `
        <h3>Process Salary Payments</h3>
        <form id="salaryPaymentForm">
            <div>
                <label for="roleType">Role Type:</label>
                <select id="roleType" required>
                    <option value="">Select a role</option>
                </select>
            </div>
            <div>
                <label for="salaryAmount">Salary Amount:</label>
                <input type="text" id="salaryAmount" readonly>
            </div>
            <div>
                <label for="paymentMonth">Payment Month:</label>
                <select id="paymentMonth" required>
                    ${Array.from({ length: 12 }, (_, i) => 
                        `<option value="${i + 1}">${new Date(0, i).toLocaleString('default', { month: 'long' })}</option>`
                    ).join('')}
                </select>
            </div>
            <div>
                <label for="paymentYear">Payment Year:</label>
                <select id="paymentYear" required>
                    ${Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return `<option value="${year}">${year}</option>`;
                    }).join('')}
                </select>
            </div>
            <button type="submit">Pay Now</button>
        </form>
    `);

    // Fetch role data from the server
    fetch('http://localhost:5002/api/salary-data')
        .then(response => response.json())
        .then(data => {
            const roleDropdown = document.getElementById('roleType');
            // Populate the role dropdown with data from the server
            data.forEach(role => {
                const option = document.createElement('option');
                option.value = role['Role Type'];
                option.textContent = `${role['Role Type']} - ${role['Username']}`;
                option.setAttribute('data-amount', role['Amount']);
                roleDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching role data:', error);
        });

    // Add event listener to the role dropdown to update the salary amount
    document.getElementById('roleType').addEventListener('change', function() {
        const selectedRole = this.options[this.selectedIndex];
        const salaryAmount = selectedRole.getAttribute('data-amount');
        document.getElementById('salaryAmount').value = salaryAmount;
    });

    // Add event listener to the form to handle the payment
    document.getElementById('salaryPaymentForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const roleType = document.getElementById('roleType').value;
        const salaryAmount = document.getElementById('salaryAmount').value;
        const paymentMonth = document.getElementById('paymentMonth').value;
        const paymentYear = document.getElementById('paymentYear').value;
        const paymentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

        // Check if payment already exists for the selected month and year
        fetch(`http://localhost:5002/api/check-payment?user_id=${document.getElementById('roleType').options[document.getElementById('roleType').selectedIndex].value}&month=${paymentMonth}&year=${paymentYear}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    alert('Payment already settled for the selected month and year.');
                } else {
                    // Send data to the server to process the payment
                    fetch('http://localhost:5002/api/process-salary', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: document.getElementById('roleType').options[document.getElementById('roleType').selectedIndex].value,
                            username: document.getElementById('roleType').options[document.getElementById('roleType').selectedIndex].text.split(' - ')[1],
                            role_type: roleType,
                            amount: salaryAmount,
                            payment_month: paymentMonth,
                            payment_year: paymentYear,
                            payment_date: paymentDate
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message || 'Payment processed successfully!');
                    })
                    .catch(error => {
                        console.error('Error processing payment:', error);
                        alert('Failed to process payment. Please try again.');
                    });
                }
            })
            .catch(error => {
                console.error('Error checking payment:', error);
                alert('Failed to check payment status. Please try again.');
            });
    });
}

function salaryReport() {
    // Show the modal with the form
    showModal("Generate Salary Reports", `
        <h3>Select Year and Month</h3>
        <form id="salaryReportForm">
            <div>
                <label for="reportYear">Year:</label>
                <select id="reportYear" required>
                    ${Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return `<option value="${year}">${year}</option>`;
                    }).join('')}
                </select>
            </div>
            <div>
                <label for="reportMonth">Month:</label>
                <select id="reportMonth" required>
                    ${Array.from({ length: 12 }, (_, i) => 
                        `<option value="${i + 1}">${new Date(0, i).toLocaleString('default', { month: 'long' })}</option>`
                    ).join('')}
                </select>
            </div>
            <button type="submit">Generate Report</button>
        </form>
    `);

    // Add event listener to the form to handle report generation
    document.getElementById('salaryReportForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const year = document.getElementById('reportYear').value;
        const month = document.getElementById('reportMonth').value;

        // Fetch salary report data from the server
        fetch(`http://localhost:5002/api/salary-report?year=${year}&month=${month}`)
            .then(response => response.json())
            .then(data => {
                // Close the current form modal
                closeModal();

                // Open a new modal to display the report
                if (data.length > 0) {
                    // Display the report data in a table
                    const reportHtml = `
                        <h3>Salaries Paid for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}</h3>
                        <div class="scrollable-modal-content">
                            <table border="1" cellpadding="10" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Role Type</th>
                                        <th>Amount</th>
                                        <th>Payment Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.map(payment => `
                                        <tr>
                                            <td>${payment.user_id}</td>
                                            <td>${payment.username}</td>
                                            <td>${payment.role_type}</td>
                                            <td>${payment.amount}</td>
                                            <td>${payment.payment_date}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                    showModal("Salary Report", reportHtml);
                } else {
                    // Display a message if no data is found
                    showModal("Salary Report", `
                        <h3>Salaries Paid for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}</h3>
                       <div class="scrollable-modal-content">
                       ${reportHtml}
                            <p>No salaries paid for the selected month and year.</p>
                         
                </div>
                    `);
                }
            })
            .catch(error => {
                console.error('Error fetching salary report:', error);
                showModal("Error", "No payments settled for this month. Please try again.");
            });
    });
}