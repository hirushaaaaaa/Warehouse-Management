// Track the current screen, screen history, and selected role
let currentScreen = "initialScreen";
let screenHistory = ["initialScreen"];
let selectedRole = "";
let selectedSubRole = "";

// Navigate to the selected type (Corporate or Customer)
function selectType(type) {
    if (type === "Corporate") {
        switchScreens("roleContainer");
    } else if (type === "Customer") {
        switchScreens("customerScreen");
    }
}

// Handle Corporate Role Selection
function selectRole(role) {
    selectedRole = role;
    const subRoleContainer = document.getElementById("subRoleContainer");
    const subRoleButtons = document.getElementById("subRoleButtons");
    subRoleButtons.innerHTML = "";

    if (role === "Warehouse") {
        createSubRoleButtons(["Manager", "Driver", "Assistant"]);
    } else if (role === "HR") {
        createSubRoleButtons(["Manager", "Clerk"]);
    } else if (role === "Finance") {
        createSubRoleButtons(["Manager", "Accountant"]);
    } else {
        switchScreens("loginCorporate");
        return;
    }

    switchScreens("subRoleContainer");
}

// Create sub-role buttons dynamically
function createSubRoleButtons(subRoles) {
    const subRoleButtons = document.getElementById("subRoleButtons");
    subRoles.forEach(subRole => {
        const button = document.createElement("button");
        button.textContent = subRole;
        button.onclick = () => {
            selectedSubRole = subRole;
            switchScreens("loginCorporate");
        };
        subRoleButtons.appendChild(button);
    });
}

// Role-specific username validation
function validateCredentials(username, password, role, subRole) {
    const validCredentials = {
        "Managing Director": {
            validUsernames: ["md"],
            subRoles: null
        },
        "General Manager": {
            validUsernames: ["gm"],
            subRoles: null
        },
        "HR": {
            validUsernames: ["hrm", "hrc"],
            subRoles: {
                "Manager": ["hrm"],
                "Clerk": ["hrc"]
            }
        },
        "Finance": {
            validUsernames: ["fm", "fa"],
            subRoles: {
                "Manager": ["fm"],
                "Accountant": ["fa"]
            }
        },
        "Warehouse": {
            validUsernames: ["wm", "wa", "wd"],
            subRoles: {
                "Manager": ["wm"],
                "Assistant": ["wa"],
                "Driver": ["wd"]
            }
        },
        "IT": {
            validUsernames: ["itm"],
            subRoles: null
        },
        "Supplier": {
            validUsernames: ["sup"],
            subRoles: null
        }
    };

    if (password !== "123") {
        return false;
    }

    const roleConfig = validCredentials[role];
    if (!roleConfig) {
        return false;
    }

    if (roleConfig.subRoles && subRole) {
        const validUsernamesForSubRole = roleConfig.subRoles[subRole];
        return validUsernamesForSubRole && validUsernamesForSubRole.includes(username);
    }

    return roleConfig.validUsernames.includes(username);
}

// Hide all screens including login forms
function hideAllScreens() {
    const screens = [
        'initialScreen',
        'roleContainer',
        'subRoleContainer',
        'loginCorporate',
        'customerScreen',
        'signupFormContainer',
        'loginFormContainer',
        'gmDashboard',
        'mdDashboard',
        'warehouseManagerDashboard',
        'warehouseAssistantDashboard',
        'warehouseDriverDashboard',
        'financeManagerDashboard',
        'hrManagerDashboard',
        'hrClerkDashboard',
        'accountantDashboard',
        'itDashboard',
        'supplierDashboard'
    ];
    
    screens.forEach(screen => {
        document.getElementById(screen).style.display = "none";
    });
}

// Switch screens with history tracking
function switchScreens(show) {
    hideAllScreens();
    document.getElementById(show).style.display = "block";
    currentScreen = show;
    screenHistory.push(show);
}

// Go back to the previous screen
function goBack() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const previousScreen = screenHistory[screenHistory.length - 1];
        document.getElementById(currentScreen).style.display = "none";
        document.getElementById(previousScreen).style.display = "block";
        currentScreen = previousScreen;

        if (previousScreen === "roleContainer") {
            selectedRole = "";
            selectedSubRole = "";
        }
    }
}

// Toggle between signup and login forms
function toggleForm(formType) {
    if (formType === 'signup') {
        switchScreens("signupFormContainer");
    } else if (formType === 'login') {
        switchScreens("loginFormContainer");
    }
}

document.getElementById('loginFormCorporate').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('usernameCorporate').value.toLowerCase();
    const password = document.getElementById('passwordCorporate').value;

    if (validateCredentials(username, password, selectedRole, selectedSubRole)) {
        hideAllScreens(); // Hide all screens including login form
        
        switch(selectedRole) {
            case "Managing Director":
                showMDDashboard();
                break;
            case "General Manager":
                showGMDashboard();
                break;
            case "Warehouse":
                if (selectedSubRole === "Manager") showWarehouseManagerDashboard();
                else if (selectedSubRole === "Assistant") showWarehouseAssistantDashboard();
                else if (selectedSubRole === "Driver") showWarehouseDriverDashboard();
                break;
            case "HR":
                if (selectedSubRole === "Manager") showHRManagerDashboard();
                else if (selectedSubRole === "Clerk") showHRClerkDashboard();
                break;
            case "Finance":
                if (selectedSubRole === "Manager") showFinanceManagerDashboard();
                else if (selectedSubRole === "Accountant") showAccountantDashboard();
                break;
            case "IT":
                showITDashboard();
                break;
            case "Supplier":
                showSupplierDashboard();
                break;
            default:
                alert("Role not implemented");
        }
        
        // Clear the form
        document.getElementById('usernameCorporate').value = '';
        document.getElementById('passwordCorporate').value = '';
        
    } else {
        alert("Invalid credentials for selected role");
    }
});


document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (name && email && password) {
        alert("Sign-up successful! Database integration pending.");
        switchScreens("loginFormContainer");
    } else {
        alert("Please fill in all fields");
    }
});

// Modified customer login form event listener
document.getElementById('loginFormCustomer').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        hideAllScreens(); // Hide all screens including login form
        alert("Login successful! Database integration pending.");
        // Clear the form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        alert("Please fill in all fields");
    }
});

// Dashboard Display Functions
function showMDDashboard() {
    hideAllDashboards();
    document.getElementById('mdDashboard').style.display = 'block';
    document.getElementById('mdLastLogin').textContent = new Date().toLocaleString();
}

function showGMDashboard() {
    hideAllDashboards();
    document.getElementById('gmDashboard').style.display = 'block';
    document.getElementById('lastLogin').textContent = new Date().toLocaleString();
}

function showWarehouseManagerDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseManagerDashboard').style.display = 'block';
    document.getElementById('wmLastLogin').textContent = new Date().toLocaleString();
}

function showWarehouseAssistantDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseAssistantDashboard').style.display = 'block';
    document.getElementById('waLastLogin').textContent = new Date().toLocaleString();
}

function showWarehouseDriverDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseDriverDashboard').style.display = 'block';
    document.getElementById('wdLastLogin').textContent = new Date().toLocaleString();
}

function showHRManagerDashboard() {
    hideAllDashboards();
    document.getElementById('hrManagerDashboard').style.display = 'block';
    document.getElementById('hrmLastLogin').textContent = new Date().toLocaleString();
}

function showHRClerkDashboard() {
    hideAllDashboards();
    document.getElementById('hrClerkDashboard').style.display = 'block';
    document.getElementById('hrcLastLogin').textContent = new Date().toLocaleString();
}


function showFinanceManagerDashboard() {
    hideAllDashboards();
    document.getElementById('financeManagerDashboard').style.display = 'block';
    document.getElementById('fmLastLogin').textContent = new Date().toLocaleString();
}

function showAccountantDashboard() {
    hideAllDashboards();
    document.getElementById('accountantDashboard').style.display = 'block';
    document.getElementById('faLastLogin').textContent = new Date().toLocaleString();
}

function showITDashboard() {
    hideAllDashboards();
    document.getElementById('itDashboard').style.display = 'block';
    document.getElementById('itmLastLogin').textContent = new Date().toLocaleString();
}

function showSupplierDashboard() {
    hideAllDashboards();
    document.getElementById('supplierDashboard').style.display = 'block';
    document.getElementById('supLastLogin').textContent = new Date().toLocaleString();
}

function hideAllDashboards() {
    const dashboards = [
        'mdDashboard', 'gmDashboard', 'warehouseManagerDashboard',
        'warehouseAssistantDashboard', 'warehouseDriverDashboard',
        'financeManagerDashboard', 'hrManagerDashboard', 'hrClerkDashboard', 'accountantDashboard',
        'itDashboard', 'supplierDashboard'
    ];
    dashboards.forEach(dashboard => {
        document.getElementById(dashboard).style.display = 'none';
    });
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
    showModal("Order Approvals", `
        <h3>Pending Approvals</h3>
        <div class="no-data-message">
            <p>No pending orders found. Database integration pending.</p>
        </div>
    `);
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

function placeOrder() {
    showModal("Place Order", `
        <h3>New Order</h3>
        <form id="orderForm">
            <select id="supplier" required>
                <option value="">Select Supplier</option>
            </select>
            <p class="note">No suppliers found. Database integration pending.</p>
            <input type="text" placeholder="Item Description" required>
            <input type="number" placeholder="Quantity" required>
            <input type="number" placeholder="Unit Price" required>
            <button type="submit">Submit Order</button>
            <p class="note">Note: Orders will not be saved until database integration.</p>
        </form>
    `);
}

function manageStaff() {
    showModal("Staff Management", `
        <h3>Staff Directory</h3>
        <div class="no-data-message">
            <p>No staff records found. Database integration pending.</p>
        </div>
    `);
}

function manageSuppliers() {
    showModal("Supplier Management", `
        <h3>Supplier Directory</h3>
        <div class="no-data-message">
            <p>No suppliers found. Database integration pending.</p>
        </div>
    `);
}

function reEnterCredentials() {
    showModal("Re-enter Credentials", `
        <h3>Verify Identity</h3>
        <form id="reAuthForm">
            <input type="password" placeholder="Enter your password" required>
            <button type="submit">Verify</button>
        </form>
    `);
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        location.reload();
    }
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

// Warehouse Manager Functions
function checkScannerMaintenance() {
    showModal("Scanner Maintenance", `
        <h3>Scanner Maintenance Status</h3>
        <div class="no-data-message">
            <p>No maintenance records found. Database integration pending.</p>
        </div>
    `);
}

function checkDamagedStock() {
    showModal("Damaged Stock Report", `
        <h3>Damaged Stock Overview</h3>
        <div class="no-data-message">
            <p>No damaged stock records found. Database integration pending.</p>
        </div>
    `);
}

function checkLowStockAlerts() {
    showModal("Low Stock Alerts", `
        <h3>Low Stock Items</h3>
        <div class="no-data-message">
            <p>No low stock alerts found. Database integration pending.</p>
        </div>
    `);
}

function informGM() {
    showModal("Inform General Manager", `
        <h3>Send Notice to GM</h3>
        <form id="gmNoticeForm">
            <select id="noticeType" required>
                <option value="">Select Notice Type</option>
                <option value="urgent">Urgent</option>
                <option value="regular">Regular</option>
                <option value="update">Update</option>
            </select>
            <textarea id="noticeText" placeholder="Enter your message" required></textarea>
            <button type="submit">Send Notice</button>
            <p class="note">Note: Notices will not be saved until database integration.</p>
        </form>
    `);
}

// Warehouse Driver Functions
function checkForUpcomingDeliveries() {
    showModal("Upcoming Deliveries", `
        <h3>Delivery Schedule</h3>
        <div class="no-data-message">
            <p>No upcoming deliveries found. Database integration pending.</p>
        </div>
    `);
}

function checkForNewArrivals() {
    showModal("New Arrivals", `
        <h3>Recent Arrivals</h3>
        <div class="no-data-message">
            <p>No new arrivals found. Database integration pending.</p>
        </div>
    `);
}

// Warehouse Assistant Functions
function recordNewStock() {
    showModal("Record New Stock", `
        <h3>New Stock Entry</h3>
        <form id="newStockForm">
            <input type="text" placeholder="Product Name" required>
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Quantity" required>
            <input type="text" placeholder="Location" required>
            <button type="submit">Record Stock</button>
            <p class="note">Note: Stock records will not be saved until database integration.</p>
        </form>
    `);
}

function sendOffStock() {
    showModal("Send Off Stock", `
        <h3>Stock Dispatch</h3>
        <form id="dispatchForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Quantity" required>
            <input type="text" placeholder="Destination" required>
            <button type="submit">Dispatch Stock</button>
            <p class="note">Note: Dispatch records will not be saved until database integration.</p>
        </form>
    `);
}

// Finance Manager Functions
function checkAccounts() {
    showModal("Account Overview", `
        <h3>Financial Accounts</h3>
        <div class="no-data-message">
            <p>No account records found. Database integration pending.</p>
        </div>
    `);
}

function manageNewPurchase() {
    showModal("New Purchase", `
        <h3>Purchase Record</h3>
        <form id="purchaseForm">
            <input type="text" placeholder="Item Description" required>
            <input type="number" placeholder="Amount" required>
            <select id="purchaseCategory" required>
                <option value="">Select Category</option>
                <option value="equipment">Equipment</option>
                <option value="supplies">Supplies</option>
                <option value="services">Services</option>
            </select>
            <button type="submit">Record Purchase</button>
            <p class="note">Note: Purchase records will not be saved until database integration.</p>
        </form>
    `);
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

    // Add form submission event listener
    const form = document.getElementById('letterApprovalForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from refreshing the page

        const letterType = document.getElementById('letterType').value;
        const letterContent = document.getElementById('letterContent').value;

        // Send data to backend (example using fetch)
        fetch('/api/letter-approval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                letterType: letterType,
                letterContent: letterContent
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Letter Approval Request Sent!');
                // Optionally, close modal or reset form
            } else {
                alert('Failed to send letter approval request');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error sending letter approval request');
        });
    });
}


//HR Clerk specific functions
function handleLeaveRequest() {
    showModal("Leave Request Handler", `
        <h3>Process Leave Requests</h3>
        <form id="leaveRequestForm">
            <select id="employeeSelect" required>
                <option value="">Select Employee</option>
                <option value="emp1">Employee 1</option>
                <option value="emp2">Employee 2</option>
            </select>
            <select id="leaveType" required>
                <option value="">Select Leave Type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
            </select>
            <input type="date" placeholder="Start Date" required>
            <input type="date" placeholder="End Date" required>
            <textarea placeholder="Comments" required></textarea>
            <button type="submit">Process Request</button>
            <p class="note">Note: Leave requests will not be saved until database integration.</p>
        </form>
    `);
}

function manageMeetings() {
    showModal("Meeting Management", `
        <h3>Schedule/Manage Meetings</h3>
        <form id="meetingForm">
            <input type="text" placeholder="Meeting Title" required>
            <input type="datetime-local" required>
            <input type="text" placeholder="Location/Meeting Room" required>
            <textarea placeholder="Meeting Agenda" required></textarea>
            <select multiple id="attendees" required>
                <option value="dept1">Department 1</option>
                <option value="dept2">Department 2</option>
                <option value="dept3">Department 3</option>
            </select>
            <button type="submit">Schedule Meeting</button>
            <p class="note">Note: Meeting schedules will not be saved until database integration.</p>
        </form>
    `);
}

function uploadHRReports() {
    showModal("HR Reports Upload", `
        <h3>Upload HR Reports</h3>
        <form id="hrReportUploadForm">
            <select id="reportType" required>
                <option value="">Select Report Type</option>
                <option value="attendance">Attendance Report</option>
                <option value="performance">Performance Report</option>
                <option value="leave">Leave Status Report</option>
                <option value="recruitment">Recruitment Report</option>
            </select>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" required>
            <textarea placeholder="Report Description" required></textarea>
            <button type="submit">Upload Report</button>
            <p class="note">Note: Reports will not be saved until database integration.</p>
        </form>
    `);
}

function manageLeaves() {
    showModal("Leave Management", `
        <h3>Leave Requests</h3>
        <div class="no-data-message">
            <p>No leave requests found. Database integration pending.</p>
        </div>
    `);
}

function reviewHRReports() {
    showModal("HR Reports", `
        <h3>HR Reports Overview</h3>
        <div class="no-data-message">
            <p>No HR reports found. Database integration pending.</p>
        </div>
    `);
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

// Supplier Functions
function checkForNewOrders() {
    showModal("New Orders", `
        <h3>Pending Orders</h3>
        <div class="no-data-message">
            <p>No new orders found. Database integration pending.</p>
        </div>
    `);
}

function prepareOrders() {
    showModal("Prepare Orders", `
        <h3>Order Preparation</h3>
        <div class="no-data-message">
            <p>No orders to prepare. Database integration pending.</p>
        </div>
    `);
}

function updatePrices() {
    showModal("Update Prices", `
        <h3>Price Update Form</h3>
        <form id="priceUpdateForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="New Price" required>
            <textarea id="priceChangeReason" placeholder="Reason for price change" required></textarea>
            <button type="submit">Update Price</button>
            <p class="note">Note: Price updates will not be saved until database integration.</p>
        </form>
    `);
}

function updateStock() {
    showModal("Update Stock", `
        <h3>Stock Update Form</h3>
        <form id="stockUpdateForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Current Quantity" required>
            <input type="number" placeholder="New Quantity" required>
            <textarea placeholder="Reason for update" required></textarea>
            <button type="submit">Update Stock</button>
            <p class="note">Note: Stock updates will not be saved until database integration.</p>
        </form>
    `);
}

// Modal Utility Functions
function showModal(title, content) {
    const modalHtml = `
        <div class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        </div>
    `;
    
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.querySelector('.modal').style.display = 'block';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.querySelector('.modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Uniform logout function for all dashboards
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        location.reload();
    }
}