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
    showModal("Salary Payments", `
        <h3>Process Salary Payments</h3>
        <form id="salaryPaymentForm">
            <input type="month" required>
            <button type="submit">Process Payments</button>
            <div class="no-data-message">
                <p>No salary data found. Database integration pending.</p>
            </div>
        </form>
    `);
}