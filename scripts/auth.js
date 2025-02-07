// auth.js
let selectedRole = "";
let selectedSubRole = "";

// Role configurations with validation rules
const validCredentials = {
    "Managing Director": { validUsernames: ["md"], subRoles: null },
    "General Manager": { validUsernames: ["gm"], subRoles: null },
    "HR": { validUsernames: ["hrm", "hrc"], subRoles: { "Manager": ["hrm"], "Clerk": ["hrc"] } },
    "Finance": { validUsernames: ["fm", "fa"], subRoles: { "Manager": ["fm"], "Accountant": ["fa"] } },
    "Warehouse": { validUsernames: ["wm", "wa", "wd"], subRoles: { "Manager": ["wm"], "Assistant": ["wa"], "Driver": ["wd"] } },
    "IT": { validUsernames: ["itm"], subRoles: null },
    "Supplier": { validUsernames: ["sup"], subRoles: null }
};

// Navigate to the selected type (Corporate or Customer)
function selectType(type) {
    if (type === "Corporate") {
        showCorporateLogin();
    } else if (type === "Customer") {
        switchScreens("customerScreen");
    }
}

// Show the unified corporate login form
function showCorporateLogin() {
    hideAllScreens();
    document.getElementById('corporateLogin').style.display = 'block';
    screenHistory.push('corporateLogin');
}

// Update sub-roles based on selected role
function updateSubRoles() {
    const roleSelect = document.getElementById('roleSelect');
    const subRoleGroup = document.getElementById('subRoleGroup');
    const subRoleSelect = document.getElementById('subRoleSelect');
    selectedRole = roleSelect.value;
    selectedSubRole = "";

    // Clear existing options
    subRoleSelect.innerHTML = '<option value="">Select Sub Role</option>';

    const roleConfig = validCredentials[selectedRole];
    if (roleConfig && roleConfig.subRoles) {
        // Add new options
        Object.keys(roleConfig.subRoles).forEach(subRole => {
            const option = document.createElement('option');
            option.value = subRole;
            option.textContent = subRole;
            subRoleSelect.appendChild(option);
        });
        subRoleGroup.style.display = 'block';
        subRoleSelect.required = true;
    } else {
        subRoleGroup.style.display = 'none';
        subRoleSelect.required = false;
    }
}

// Validate credentials
function validateCredentials(username, password, role, subRole) {
    if (password !== "123") return false;

    const roleConfig = validCredentials[role];
    if (!roleConfig) return false;

    if (roleConfig.subRoles && subRole) {
        const validUsernamesForSubRole = roleConfig.subRoles[subRole];
        return validUsernamesForSubRole && validUsernamesForSubRole.includes(username);
    }

    return roleConfig.validUsernames.includes(username);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', handleCorporateLogin);
});

// Handle corporate login form submission
function handleCorporateLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('roleSelect').value;
    const subRole = document.getElementById('subRoleSelect').value || null;

    fetch('http://localhost:5002/api/corporate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, subRole })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Store the token and user details in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Hide the login form
            document.getElementById('corporateLogin').style.display = 'none';

            // Show the relevant dashboard based on the user's role
            showDashboard(data.user.role, data.user.subRole);
        } else {
            alert(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed');
    });
}

function goBack() {
    const corporateLogin = document.getElementById('corporateLogin');
    corporateLogin.style.display = 'none'; // Hide the corporate login form
    // Show the previous screen (e.g., initial screen)
    document.getElementById('initialScreen').style.display = 'block';
}

function updateSubRoles() {
    const roleSelect = document.getElementById('roleSelect');
    const subRoleGroup = document.getElementById('subRoleGroup');
    const subRoleSelect = document.getElementById('subRoleSelect');
    const selectedRole = roleSelect.value;

    // Clear existing options
    subRoleSelect.innerHTML = '<option value="">Select Sub Role</option>';

    // Define sub-roles for each role
    const subRoles = {
        'Warehouse': ['Manager', 'Assistant', 'Driver'],
        'HR': ['Manager', 'Clerk'],
        'Finance': ['Manager', 'Accountant']
    };

    // Add sub-roles if they exist for the selected role
    if (subRoles[selectedRole]) {
        subRoles[selectedRole].forEach(subRole => {
            const option = document.createElement('option');
            option.value = subRole;
            option.textContent = subRole;
            subRoleSelect.appendChild(option);
        });
        subRoleGroup.style.display = 'block';
        subRoleSelect.required = true;
    } else {
        subRoleGroup.style.display = 'none';
        subRoleSelect.required = false;
    }
}

// Add function to check if user is already logged in
function checkCorporateLoginStatus() {
    const token = localStorage.getItem('corporateToken');
    const user = JSON.parse(localStorage.getItem('corporateUser'));
    
    if (token && user) {
        // Verify token with backend
        fetch('http://localhost:5002/api/corporate/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                showDashboard(user.role, user.subRole);
            } else {
                // If token is invalid, clear storage and show login
                localStorage.removeItem('corporateToken');
                localStorage.removeItem('corporateUser');
                showCorporateLogin();
            }
        })
        .catch(error => {
            console.error('Token verification error:', error);
            showCorporateLogin();
        });
    }
}

function logout() {
    // Clear stored credentials
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Hide all dashboards
    hideAllDashboards();

    // Show the initial screen
    document.getElementById('initialScreen').style.display = 'block';
}

// Initialize event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up the corporate login form handler
    const unifiedLoginForm = document.getElementById('unifiedLoginForm');
    if (unifiedLoginForm) {
        unifiedLoginForm.addEventListener('submit', handleCorporateLogin);
    }

    // Set up role select change handler
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', updateSubRoles);
    }

    // Check login status on page load
    checkCorporateLoginStatus();
});



// Handle Customer Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    fetch('http://localhost:5002/api/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
        .then(response => response.text())
        .then(data => {
            alert(data); // Show success message
        })
        .catch(error => console.error('Error signing up:', error));
});

// Handle Customer Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Sending login request...'); // Debugging

    fetch('http://localhost:5002/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            console.log('Response received:', response); // Debugging
            if (!response.ok) {
                // Handle HTTP errors (e.g., 400, 500)
                return response.json().then(err => {
                    throw new Error(err.message || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data); // Debugging
            if (data.token) {
                // Store the token and customer details in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('customer', JSON.stringify(data.customer));

                alert('Login successful');
                // Redirect to customer dashboard or home page
                window.location.href = '/customer-dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error logging in:', error); // Debugging
            alert(error.message || 'Login failed');
        });
});