// main.js
// Track the current screen, screen history, and selected role
let currentScreen = "initialScreen";
let screenHistory = ["initialScreen"];
let selectedRole = "";
let selectedSubRole = "";

// Initialize the application
function initializeApp() {
    hideAllScreens();
    document.getElementById(currentScreen).style.display = "block";
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

function showDashboard(role, subRole) {
    hideAllScreens(); // Hide all screens before showing the dashboard
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

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);