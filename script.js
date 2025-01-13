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

// Switch screens with history tracking
function switchScreens(show) {
    const screens = [
        "initialScreen",
        "roleContainer",
        "subRoleContainer",
        "loginCorporate",
        "customerScreen",
        "signupFormContainer",
        "loginFormContainer",
        "gmDashboard",
        "mdDashboard",
        "warehouseManagerDashboard",
        "warehouseAssistantDashboard",
        "warehouseDriverDashboard",
        "hrManagerDashboard",
        "financeManagerDashboard",
        "accountantDashboard",
        "itDashboard",
        "supplierDashboard"
    ];
    
    screens.forEach(screen => {
        document.getElementById(screen).style.display = "none";
    });

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

// Event Listeners for Forms
document.getElementById('loginFormCorporate').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('usernameCorporate').value.toLowerCase();
    const password = document.getElementById('passwordCorporate').value;

    if (validateCredentials(username, password, selectedRole, selectedSubRole)) {
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

document.getElementById('loginFormCustomer').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        alert("Login successful! Database integration pending.");
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
        'financeManagerDashboard', 'hrManagerDashboard', 'accountantDashboard',
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