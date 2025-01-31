// navigation.js
// Toggle between signup and login forms
function toggleForm(formType) {
    if (formType === 'signup') {
        switchScreens("signupFormContainer");
    } else if (formType === 'login') {
        switchScreens("loginFormContainer");
    }
}