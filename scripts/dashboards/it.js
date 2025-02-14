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
    console.log('Fetching scanners...');
    fetch('http://localhost:5002/api/scanners')
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Received scanner data:', data);
            if (!data.scanners) {
                throw new Error('No scanners array in response');
            }
            
            const scannerOptions = data.scanners
                .map(scanner => `<option value="${scanner.bs_id}">Scanner ${scanner.bs_id} - ${scanner.section}</option>`)
                .join('');

            showModal("Scanner Service", `
                <h3>Barcode Scanner Service Request</h3>
                <form id="scannerServiceForm">
                    <div class="form-group">
                        <label for="scannerId">Select Scanner:</label>
                        <select id="scannerId" required>
                            <option value="">Select Scanner</option>
                            ${scannerOptions}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Confirm Service</button>
                </form>
            `);

            // Add form submission handler
            document.getElementById('scannerServiceForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const scannerId = document.getElementById('scannerId').value;
                
                fetch('http://localhost:5002/api/scanner-service', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        bs_id: scannerId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Service record created successfully');
                        closeModal(); // Assuming you have a closeModal function
                    } else {
                        alert('Error creating service record');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error creating service record');
                });
            });
        })
        .catch(error => {
            console.error('Error fetching scanners:', error);
            alert('Error loading scanners');
        });
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
    fetch('http://localhost:5002/api/scanner-services')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const records = data.services;
            let content = `
                <h3>Barcode Scanner Status</h3>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Service ID</th>
                                <th>Scanner ID</th>
                                <th>Section</th>
                                <th>Service Date</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (records && records.length > 0) {
                records.forEach(record => {
                    content += `
                        <tr>
                            <td>${record.s_service_id}</td>
                            <td>${record.bs_id}</td>
                            <td>${record.section}</td>
                            <td>${new Date(record.date).toLocaleString()}</td>
                        </tr>
                    `;
                });
            } else {
                content += `
                    <tr>
                        <td colspan="4" class="text-center">No service records found.</td>
                    </tr>
                `;
            }

            content += `
                    </tbody>
                </table>
            </div>`;

            showModal("Scanner Status", content);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Scanner Status", `
                <div class="alert alert-danger">
                    Error loading service records: ${error.message}
                </div>
            `);
        });
}


function changeCredentials() {
    console.log("Change Credentials button clicked! ✅");

    // Open modal
    showModal("Change User Credentials", `
        <h3>Change User Credentials</h3>
        <form id="credentialChangeForm">
            <div class="form-group">
                <label for="userIdSelect">Select User ID:</label>
                <select id="userIdSelect" required>
                    <option value="">Select a user</option>
                </select>
            </div>
            <div class="form-group">
                <label for="newPassword">New Password:</label>
                <input type="password" id="newPassword" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" required>
            </div>
            <div id="passwordError" class="error-message" style="display: none;"></div>
            <div id="successMessage" class="success-message" style="display: none;"></div>
            <button type="submit" class="submit-btn">Update Password</button>
        </form>
    `);

    // Fetch user IDs
    fetch("http://localhost:5002/api/it/get-users")
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch users");
            return response.json();
        })
        .then(data => {
            console.log("Fetched Users:", data);
            const userIdSelect = document.getElementById("userIdSelect");

            data.forEach(user => {
                const option = document.createElement("option");
                option.value = user.user_id;
                option.textContent = `${user.user_id} (${user.username})`;
                userIdSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });

    // Handle form submission
    document.getElementById("credentialChangeForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const userId = document.getElementById("userIdSelect").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const errorDiv = document.getElementById("passwordError");
        const successDiv = document.getElementById("successMessage");

        // Reset messages
        errorDiv.style.display = "none";
        successDiv.style.display = "none";

        // Validation
        if (!userId || !newPassword) {
            errorDiv.textContent = "All fields are required";
            errorDiv.style.display = "block";
            return;
        }
        if (newPassword !== confirmPassword) {
            errorDiv.textContent = "Passwords do not match";
            errorDiv.style.display = "block";
            return;
        }

        // Send password update request
        fetch("http://localhost:5002/api/it/change-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, newPassword: newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successDiv.textContent = data.message;
                successDiv.style.display = "block";

                // Reset form
                document.getElementById("credentialChangeForm").reset();

                // Close modal after 2 seconds
                setTimeout(closeModal, 2000);
            } else {
                errorDiv.textContent = data.message || "Failed to update password";
                errorDiv.style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error updating password:", error);
            errorDiv.textContent = "Error connecting to server";
            errorDiv.style.display = "block";
        });
    });
}


