let users = [];
setURL('https://marcel-herzog.developerakademie.net/join/smallest_backend_ever');

/**
 * Loading backend data to the variable
 *
 * 
 */
async function init() {
    await downloadFromServer();
    users = JSON.parse(backend.getItem('users')) || [];
}

/**
 * A user is getting saved into the the backend and registered
 *
 * 
 */
async function registerUser() {
    let name = document.getElementById('register_name');
    let email = document.getElementById('register_email');
    let password = document.getElementById('register_password');
    users.push({name: name.value, email: email.value, password: password.value});
    await backend.setItem('users', JSON.stringify(users));
    window.location.href = 'index.html?msg=Du hast dich erfolgreich registriert';
}

/**
 * the values are getting validated and if this is true the user will logged on 
 *
 * 
 */
function loginUser() {
    let email = document.getElementById('login_email');
    let password = document.getElementById('login_password');
    let user = users.find(u => u.email.toLowerCase() == email.value.toLowerCase() && u.password == password.value);
    if(user) {
        window.location.href = `summary.html?msg=Du hast dich erfolgreich eingelogt${user.name}`;
    }
    sessionLogon(user.name);
}


/**
 * the values are getting validated and if this is true the user will logged on for guests and no values are neccesary
 *
 * 
 */
function guestLogin() {
    let user = users.find(u => u.email == 'guest@gmail.com' && u.password == 'guest123');
    if(user) {
        window.location.href = `summary.html?msg=Du hast dich erfolgreich eingelogt ${user.name}`;
    }
    sessionLogon(user.name);
}

/**
 * the values are getting validated and saved to the local storage
 * 
 * @param {string} userName - Username of the logged on user
 */
function sessionLogon(userName) {
    localStorage.setItem("loggedOnUser", JSON.stringify(userName));
} 