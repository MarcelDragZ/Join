/**
 * the sidebar is getting included
 *
 * 
 */
// Implement Templates
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html"); 
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
    parseLoggedOnUser();
    getCurrentPage();
}

/**
 * curent page is read out and shows the url
 * 
 */
function getCurrentPage() {
    let currentPagePath = window.location.pathname;
    let htmlName = currentPagePath.split("/").pop().substring(0, currentPagePath.split("/").pop().lastIndexOf("."));
    document.getElementById(`menu_${htmlName}`).classList.add(htmlName);
}

/**
 * gets the logged on user out of the local storage
 * 
 */
function parseLoggedOnUser() {
    let loggedOnUser = JSON.parse(localStorage.getItem("loggedOnUser"));
    let loggedOnUserFirstChart = loggedOnUser.charAt(0);
    let loggedOnUserFirstChartToUpperCase = loggedOnUserFirstChart.toUpperCase();
    document.getElementById('display_logged_on_user').innerHTML = `${loggedOnUserFirstChartToUpperCase}`;
}

/**
 * is logging out the logged on user / deletes the local storage
 * 
 */
function userLogout() {
    if (!document.getElementById('log_out_button').classList.contains('dontShow')) {
        document.getElementById('log_out_button').classList.add('dontShow');
    }
    else {
        document.getElementById('log_out_button').classList.remove('dontShow');
    }
}

/**
 * is logging out the logged on user / deletes the local storage
 * 
 */
function logOut() {
    localStorage.removeItem("loggedOnUser");
    window.location.href = `index.html?msg=Du hast dich erfolgreich ausgeloggt`;
}

/**
 * shows the help me section 
 * 
 */
function showHelpMeSection() {
    document.getElementById('help-me-container').classList.remove('d-none');
    document.getElementById('main_right').classList.add('d-none');
}

/**
 * hides the help me section 
 * 
 */
function hideHelpMeSection() {
    document.getElementById('help-me-container').classList.add('d-none');
    document.getElementById('main_right').classList.remove('d-none');
}