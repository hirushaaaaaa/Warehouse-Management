// main.js
// Track the current screen and screen history
let currentScreen = "initialScreen";
let screenHistory = ["initialScreen"];

// Initialize the application
function initializeApp() {
    hideAllScreens();
    document.getElementById(currentScreen).style.display = "block";
}

// Hide all screens including login forms
function hideAllScreens() {
    const screens = [
        'initialScreen',
        'corporateLogin',
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
        const element = document.getElementById(screen);
        if (element) {
            element.style.display = "none";
        }
    });
}

// Show appropriate dashboard based on role and sub-role
function showDashboard(role, subRole) {
    hideAllScreens();
    hideAllDashboards();

    switch (role) {
        case "General Manager":
            showGMDashboard();
            break;
        case "Managing Director":
            showMDDashboard();
            break;
        case "Warehouse":
            if (subRole === "Manager") showWarehouseManagerDashboard();
            else if (subRole === "Assistant") showWarehouseAssistantDashboard();
            else if (subRole === "Driver") showWarehouseDriverDashboard();
            break;
        case "HR":
            if (subRole === "Manager") showHRManagerDashboard();
            else if (subRole === "Clerk") showHRClerkDashboard();
            break;
        case "Finance":
            if (subRole === "Manager") showFinanceManagerDashboard();
            else if (subRole === "Accountant") showAccountantDashboard();
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
}

// Hide all dashboards
function hideAllDashboards() {
    const dashboards = [
        'mdDashboard',
        'gmDashboard',
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
    dashboards.forEach(dashboard => {
        const element = document.getElementById(dashboard);
        if (element) {
            element.style.display = 'none';
        }
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
        hideAllScreens();
        document.getElementById(previousScreen).style.display = "block";
        currentScreen = previousScreen;
    }
}

// Individual dashboard show functions
function showGMDashboard() {
    document.getElementById('gmDashboard').style.display = 'block';
    updateLastLogin('gmLastLogin');
}

function showMDDashboard() {
    document.getElementById('mdDashboard').style.display = 'block';
    updateLastLogin('mdLastLogin');
}

function showWarehouseManagerDashboard() {
    document.getElementById('warehouseManagerDashboard').style.display = 'block';
    updateLastLogin('wmLastLogin');
}

function showWarehouseAssistantDashboard() {
    document.getElementById('warehouseAssistantDashboard').style.display = 'block';
    updateLastLogin('waLastLogin');
}

function showWarehouseDriverDashboard() {
    document.getElementById('warehouseDriverDashboard').style.display = 'block';
    updateLastLogin('wdLastLogin');
}

function showFinanceManagerDashboard() {
    document.getElementById('financeManagerDashboard').style.display = 'block';
    updateLastLogin('fmLastLogin');
}

function showHRManagerDashboard() {
    document.getElementById('hrManagerDashboard').style.display = 'block';
    updateLastLogin('hrmLastLogin');
}

function showHRClerkDashboard() {
    document.getElementById('hrClerkDashboard').style.display = 'block';
    updateLastLogin('hrcLastLogin');
}

function showAccountantDashboard() {
    document.getElementById('accountantDashboard').style.display = 'block';
    updateLastLogin('faLastLogin');
}

function showITDashboard() {
    document.getElementById('itDashboard').style.display = 'block';
    updateLastLogin('itmLastLogin');
}

function showSupplierDashboard() {
    document.getElementById('supplierDashboard').style.display = 'block';
    updateLastLogin('supLastLogin');
}

// Helper function to update last login time
function updateLastLogin(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const now = new Date();
        element.textContent = now.toLocaleString();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);