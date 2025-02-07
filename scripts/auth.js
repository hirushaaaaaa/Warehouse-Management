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

// Handle corporate login form submission
function handleCorporateLogin(event) {
    event.preventDefault();
    
    const role = document.getElementById('roleSelect').value;
    const subRole = document.getElementById('subRoleSelect').value;
    const username = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;

    if (validateCredentials(username, password, role, subRole)) {
        hideAllScreens();
        showDashboard(role, subRole);
    } else {
        alert("Invalid credentials for selected role");
    }
}

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