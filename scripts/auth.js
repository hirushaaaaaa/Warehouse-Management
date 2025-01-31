// auth.js
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
        "Managing Director": { validUsernames: ["md"], subRoles: null },
        "General Manager": { validUsernames: ["gm"], subRoles: null },
        "HR": { validUsernames: ["hrm", "hrc"], subRoles: { "Manager": ["hrm"], "Clerk": ["hrc"] } },
        "Finance": { validUsernames: ["fm", "fa"], subRoles: { "Manager": ["fm"], "Accountant": ["fa"] } },
        "Warehouse": { validUsernames: ["wm", "wa", "wd"], subRoles: { "Manager": ["wm"], "Assistant": ["wa"], "Driver": ["wd"] } },
        "IT": { validUsernames: ["itm"], subRoles: null },
        "Supplier": { validUsernames: ["sup"], subRoles: null }
    };

    if (password !== "123") return false;

    const roleConfig = validCredentials[role];
    if (!roleConfig) return false;

    if (roleConfig.subRoles && subRole) {
        const validUsernamesForSubRole = roleConfig.subRoles[subRole];
        return validUsernamesForSubRole && validUsernamesForSubRole.includes(username);
    }

    return roleConfig.validUsernames.includes(username);
}

// Handle Corporate Login Form Submission
document.getElementById('loginFormCorporate').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('usernameCorporate').value.toLowerCase();
    const password = document.getElementById('passwordCorporate').value;

    if (validateCredentials(username, password, selectedRole, selectedSubRole)) {
        hideAllScreens();
        showDashboard(selectedRole, selectedSubRole);
    } else {
        alert("Invalid credentials for selected role");
    }
});

// Handle Customer Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', function (e) {
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

// Handle Customer Login Form Submission
document.getElementById('loginFormCustomer').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        hideAllScreens();
        alert("Login successful! Database integration pending.");
    } else {
        alert("Please fill in all fields");
    }
});