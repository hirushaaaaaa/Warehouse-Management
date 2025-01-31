function showMDDashboard() {
    hideAllDashboards();
    document.getElementById('mdDashboard').style.display = 'block';
    document.getElementById('mdLastLogin').textContent = new Date().toLocaleString();
}

// Managing Director Functions
function checkSalesReports() {
    showModal("Sales Reports", `
        <h3>Sales Overview</h3>
        <div class="no-data-message">
            <p>No sales reports found. Database integration pending.</p>
        </div>
    `);
}

function issueTerminationLetters() {
    showModal("Termination Letters", `
        <h3>Issue Termination Letter</h3>
        <form id="terminationForm">
            <input type="text" placeholder="Employee ID" required>
            <input type="text" placeholder="Employee Name" required>
            <textarea placeholder="Reason for termination" required></textarea>
            <button type="submit">Issue Letter</button>
            <p class="note">Note: Letters will not be saved until database integration.</p>
        </form>
    `);
}

function manageJobApplications() {
    showModal("Job Applications", `
        <h3>Pending Applications</h3>
        <div class="no-data-message">
            <p>No job applications found. Database integration pending.</p>
        </div>
    `);
}