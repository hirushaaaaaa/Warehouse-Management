function showITDashboard() {
    hideAllDashboards();
    document.getElementById('itDashboard').style.display = 'block';
    document.getElementById('itmLastLogin').textContent = new Date().toLocaleString();
}

// IT Functions
function manageSystemChanges() {
    showModal("System Changes", `
        <h3>System Modification Request</h3>
        <form id="systemChangeForm">
            <select id="changeType" required>
                <option value="">Select Change Type</option>
                <option value="update">System Update</option>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security Update</option>
            </select>
            <textarea id="changeDescription" placeholder="Describe the changes needed" required></textarea>
            <button type="submit">Submit Request</button>
            <p class="note">Note: Change requests will not be saved until database integration.</p>
        </form>
    `);
}

function fixSimpleErrors() {
    showModal("Error Resolution", `
        <h3>Report Simple Error</h3>
        <form id="errorForm">
            <input type="text" placeholder="Error Code/Description" required>
            <textarea id="errorDetails" placeholder="Describe the error in detail" required></textarea>
            <button type="submit">Submit Error Report</button>
            <p class="note">Note: Error reports will not be saved until database integration.</p>
        </form>
    `);
}

function serviceBarcodeScanners() {
    showModal("Scanner Service", `
        <h3>Barcode Scanner Service Request</h3>
        <form id="scannerServiceForm">
            <input type="text" placeholder="Scanner ID" required>
            <select id="serviceType" required>
                <option value="">Select Service Type</option>
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="replacement">Replacement</option>
            </select>
            <textarea placeholder="Service details" required></textarea>
            <button type="submit">Submit Service Request</button>
            <p class="note">Note: Service requests will not be saved until database integration.</p>
        </form>
    `);
}

function maintainSoftwareServiceRecords() {
    showModal("Software Service Records", `
        <h3>Software Maintenance Records</h3>
        <div class="no-data-message">
            <p>No service records found. Database integration pending.</p>
        </div>
    `);
}

function checkBarcodeScannerStatus() {
    showModal("Scanner Status", `
        <h3>Barcode Scanner Status</h3>
        <div class="no-data-message">
            <p>No scanner status data found. Database integration pending.</p>
        </div>
    `);
}

function changeCredentials() {
    showModal("Change Credentials", `
        <h3>Update System Credentials</h3>
        <form id="credentialChangeForm">
            <input type="password" placeholder="Current Password" required>
            <input type="password" placeholder="New Password" required>
            <input type="password" placeholder="Confirm New Password" required>
            <button type="submit">Update Credentials</button>
            <p class="note">Note: Credential changes will not be saved until database integration.</p>
        </form>
    `);
}