function showHRManagerDashboard() {
    hideAllDashboards();
    document.getElementById('hrManagerDashboard').style.display = 'block';
    document.getElementById('hrmLastLogin').textContent = new Date().toLocaleString();
}

// HR Manager Functions (continued)
function requestLetterApproval() {
    showModal("Letter Approval", `
        <h3>Letter Approval Request</h3>
        <form id="letterApprovalForm">
            <select id="letterType" required>
                <option value="">Select Letter Type</option>
                <option value="offer">Offer Letter</option>
                <option value="warning">Warning Letter</option>
                <option value="termination">Termination Letter</option>
            </select>
            <textarea id="letterContent" placeholder="Enter letter content" required></textarea>
            <button type="submit">Request Approval</button>
            <p class="note">Note: Approval requests will not be saved until database integration.</p>
        </form>
    `);
}
