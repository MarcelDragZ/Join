setURL('https://marcel-herzog.developerakademie.net/join/smallest_backend_ever');

let testData = [];
let contacts = [];
let priorityColor;
let priority;
let currentDraggedItemId;
let newPriority;
let searchedTaskArray = [];
let subtaskArray = [];
let selectElement = document.getElementById('select-contact');
let dropDownShow = false;
let assignedContacts = [];
let createdCategorys = [];
let newCategoryColor;
let taskStatus;
let selectNewCategory = '';
let overlay = document.getElementById('overlay');
let displayCategories = document.getElementById('display-categories');

/**
 * Function to block dates that are in the past
 */
let today = new Date().toISOString().split('T')[0];
document.getElementById('task-date').setAttribute('min', today);


/**
 * This function implements the template.html
 *  
 * */
async function includeHTML() {

    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        let element = includeElements[i];
        file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
    await loadDataFromServer();
    getCurrentPage();
}

/**
 * the user is already assigned and gets removed from the selection 
 *
 */
function getCurrentPage() {
    let currentPagePath = window.location.pathname;
    let htmlName = currentPagePath.split("/").pop().substring(0, currentPagePath.split("/").pop().lastIndexOf("."));
    document.getElementById(`menu_${htmlName}`).classList.add(htmlName);
}

/**
 * loading the data from backend and saves it to a variable
 *
 */
async function loadDataFromServer() {
    await downloadFromServer();
    contacts = await JSON.parse(backend.getItem('contacts')) || [];
    createdCategorys = await JSON.parse(backend.getItem('createdCategorys')) || [];
    testData = await JSON.parse(backend.getItem('testData')) || [];
    renderData();
    parseLoggedOnUser();
}

/**
 * parsing logged on user
 *
 */
function parseLoggedOnUser() {
    let loggedOnUser = JSON.parse(localStorage.getItem("loggedOnUser"));
    let loggedOnUserFirstChart = loggedOnUser.charAt(0);
    let loggedOnUserFirstChartToUpperCase = loggedOnUserFirstChart.toUpperCase();
    document.getElementById('display_logged_on_user').innerHTML = `${loggedOnUserFirstChartToUpperCase}`;
}

/**
 * added if condition that checks if openEditTask is open
 *
 */
function closeOverlay() {
    if (openEditTask) {
        closeEditTask();
    }
    closeTaskPopUp();
    closeAddTaskPopUp();
}

overlay.addEventListener('click', closeOverlay);

/**
 * render the data from the testData JSON Array
 */
function renderData() {
    let stageToDo = document.getElementById('stage-todo');
    let stageProgress = document.getElementById('stage-progress');
    let stageFeedBack = document.getElementById('stage-feedback');
    let stageDone = document.getElementById('stage-done');
    setStageInnerHtml(stageToDo, stageProgress, stageFeedBack, stageDone);
    if (searchedTaskArray.length === 0) {
        renderDefaultTaskArray(stageToDo, stageProgress, stageFeedBack, stageDone);
    }
    if (searchedTaskArray.length !== 0) {
        renderSearchedTaskArray(stageToDo, stageProgress, stageFeedBack, stageDone);
    }
    renderDataFinished();
}

/**
 * renders the task data
 *
 */
function renderDataFinished() {
    stagesContentWhenEmpty();
    hideOrShowPriorityLevels();
    renderCategorys();
}

/**
 * clears all stages on the board before rendering
 *
 * @param {string} stageToDo - Container for the tasks todo
 * @param {string} stageProgress - Container for the tasks progress
 * @param {string} stageFeedBack - Container for the tasks Feedback
 * @param {string} stageDone - Container for the tasks Done
 */
function setStageInnerHtml(stageToDo, stageProgress, stageFeedBack, stageDone) {
    stageToDo.innerHTML = '';
    stageProgress.innerHTML = '';
    stageFeedBack.innerHTML = '';
    stageDone.innerHTML = '';
}

/**
 * renders all stages onto the board
 *
 * @param {string} stageToDo - Container for the tasks todo
 * @param {string} stageProgress - Container for the tasks progress
 * @param {string} stageFeedBack - Container for the tasks Feedback
 * @param {string} stageDone - Container for the tasks Done
 */
function renderDefaultTaskArray(stageToDo, stageProgress, stageFeedBack, stageDone) {
    for (let i = 0; i < testData.length; i++) {
        let test = testData[i];
        let finishedSubTasks = countFinishedSubtasks(test);
        if (test.status === 'todo') {
            stageToDo.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'progress') {
            stageProgress.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'feedback') {
            stageFeedBack.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'done') {
            stageDone.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        renderContactInitials(i);
    }
}

/**
 * rendering all searched task to the board
 *
 * @param {string} stageToDo - Container for the tasks todo
 * @param {string} stageProgress - Container for the tasks progress
 * @param {string} stageFeedBack - Container for the tasks Feedback
 * @param {string} stageDone - Container for the tasks Done
 */
function renderSearchedTaskArray(stageToDo, stageProgress, stageFeedBack, stageDone) {
    for (let i = 0; i < searchedTaskArray.length; i++) {
        let test = searchedTaskArray[i];
        let finishedSubTasks = countFinishedSubtasks(test);
        if (test.status === 'todo') {
            stageToDo.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'inprogress') {
            stageProgress.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'feedback') {
            stageFeedBack.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        if (test.status === 'done') {
            stageDone.innerHTML += taskTemplate(i, test, finishedSubTasks);
        }
        renderContactInitials(i);
    }
}

/**
 * is counting the finished subtasks and returning
 *
 * @param {string} test - task of the right array
 */
function countFinishedSubtasks(test) {
    let count = 0;
    for (let i = 0; i < test.subtasks.length; i++) {
        if (test.subtasks[i].status === 'finished') {
            count++;
        }
    }
    return count;
}


/**
 * render contact initials after a task has been assigned to a contact
 * @param {*} i is every item from the JSON Array
 * @param {*} test is the loop variable that will contain the value of the current element of the for loop
 *  */
function renderContactInitials(i) {
    let task = testData[i];
    let assignedContactsContainer = document.getElementById(`assigned-contacts-${i}`);
    assignedContactsContainer.innerHTML = '';
    for (let j = 0; j < task['assignedContacts'].length; j++) {
        assignedContactsContainer.innerHTML +=
            `<span>${task['assignedContacts'][j].substring(0, 2).toUpperCase()}</span>`;
    }
}

/**
 * render the content of a stage when it is empty
 */
function stagesContentWhenEmpty() {
    let stageToDo = document.getElementById('stage-todo');
    let stageProgress = document.getElementById('stage-progress');
    let stageFeedBack = document.getElementById('stage-feedback');
    let stageDone = document.getElementById('stage-done');
    if (stageToDo.innerHTML == '') {
        stageToDo.innerHTML = emptyTaskTemplate();
    }
    if (stageProgress.innerHTML == '') {
        stageProgress.innerHTML = emptyTaskTemplate();
    }
    if (stageFeedBack.innerHTML == '') {
        stageFeedBack.innerHTML = emptyTaskTemplate();
    }
    if (stageDone.innerHTML == '') {
        stageDone.innerHTML = emptyTaskTemplate();
    }
}

document.getElementById('urgent').addEventListener('click', function () {
    setPriority('Urgent');
});

document.getElementById('medium').addEventListener('click', function () {
    setPriority('Medium');
});

document.getElementById('low').addEventListener('click', function () {
    setPriority('Low');
});

function setPriority(value) {
    priority = value;
}

/**
 * is finding the correct category
 *
 * @param {string} categoryName - category name from right task
 */
function findCategory(categoryName) {
    return createdCategorys.find((obj) => obj.categoryName === categoryName);
}


/**
 * Create New Task Function
 *
 */
async function createTask() {
    let title = document.getElementById('task-title').value;
    let category = getNewCategory();
    if (!validateInput(title, category)) {
        return;
    }
    let date = document.getElementById('task-date').value;
    let taskDescription = document.getElementById('task-description').value;
    let newItem = createNewItem(title, category, taskDescription, date);
    await saveItem(newItem);
    updateUI();
}

/**
 * validated the right input
 *
 * @param {string} title - category title
 * @param {string} category - category from the right task
 */
function validateInput(title, category) {
    if (category === 'No-Category') {
        return false;
    }
    if (priority === undefined) {
        priorityAlert();
        return false;
    }
    return true;
}

/**
 * creating the new item to the task
 *
 * @param {string} title - category title
 * @param {string} category - category from the right task
 * @param {string} taskDescription - task description 
 * @param {string} date - current date
 */
function createNewItem(title, category, taskDescription, date) {
    let lastItem = testData[testData.length - 1];
    if (testData.length === 0) {
        return getNewItemWithNoId(title, category, taskDescription, date);
    } else {
        let newId = Number(lastItem.id) + 1;
        return getNewItemWithId(title, category, taskDescription, date, newId);
    }
}

/**
 * saving the new item to the task
 *
 * @param {string} newItem - new item from the task with different values
 */
async function saveItem(newItem) {
    testData.push(newItem);
    await backend.setItem('testData', JSON.stringify(testData));
}

/**
 * updates and refeshes the complete board
 *
 */
async function updateUI() {
    showDropDown('popup');
    closeAddTaskPopUp();
    await includeHTML();
    clearInputFields();
    removePrioritys();
    selectNewCategory = '';
    subtaskArray = [];
    assignedContacts = [];
}

/**
 * creating the new item to the task
 *
 * @param {string} title - category title
 * @param {string} category - category from the right task
 * @param {string} taskDescription - task description 
 * @param {string} date - current date
 */
function getNewItemWithNoId(title, category, taskDescription, date) {
    return {
        "title": title,
        "cat": {
            categoryName: category['categoryName'],
            categoryColor: category['categoryColor']
        },
        "description": taskDescription,
        "status": taskStatus,
        "priority": priority,
        "date": date,
        "assignedContacts": assignedContacts,
        "subtasks": renderSubtasks(),
        "id": 0
    };
}

/**
 * creating the new item to the task
 *
 * @param {string} title - category title
 * @param {string} category - category from the right task
 * @param {string} taskDescription - task description 
 * @param {string} date - current date
 */
function getNewItemWithId(title, category, taskDescription, date, newId) {
    return {
        "title": title,
        "cat": {
            categoryName: category['categoryName'],
            categoryColor: category['categoryColor']
        },
        "description": taskDescription,
        "status": taskStatus,
        "priority": priority,
        "date": date,
        "assignedContacts": assignedContacts,
        "subtasks": renderSubtasks(),
        "id": newId.toString()
    };
}

/**
 * Shows an alert when no prio is selected
 *
 */
function priorityAlert() {
    let urgent = document.getElementById('urgent');
    let medium = document.getElementById('medium');
    let low = document.getElementById('low');
    urgent.classList.add('no_category_selected');
    medium.classList.add('no_category_selected');
    low.classList.add('no_category_selected');
    changePriorityInnerHtml(urgent, medium, low);
    changePriorityDefault(urgent, medium, low);
}

/**
 * changes the priority to the default one
 *
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function changePriorityDefault(urgent, medium, low) {
    setTimeout(() => {
        urgent.classList.remove('no_category_selected');
        medium.classList.remove('no_category_selected');
        low.classList.remove('no_category_selected');
        changePriorityDefaultInnerHtml(urgent, medium, low)
    }, 2500);
}

/**
 * changes the priority to the default one
 *
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function changePriorityDefaultInnerHtml(urgent, medium, low) {
    urgent.innerHTML = `
    <span id="urgent-inner">Urgent</span>
    <img id="img1" src="../assets/icons/urgent.png" alt="">
    `;
    medium.innerHTML = `
    <span id="medium-inner">Medium</span>
    <img id="img2" src="../assets/icons/medium.png" alt="">
    `;
    low.innerHTML = `
    <span id="low-inner">Low</span>
    <img id="img3" src="../assets/icons/low.png" alt="">
    `;
}

/**
 * changes the priority to the default one
 *
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function changePriorityInnerHtml(urgent, medium, low) {
    urgent.innerHTML = 'Auswählen';
    medium.innerHTML = 'Auswählen';
    low.innerHTML = 'Auswählen';
}


/**
 * getting new category for task
 *
 */
function getNewCategory() {
    if (selectNewCategory === '') {
        document.getElementById('select-category-inner').innerHTML = 'Keine Kategorie Ausgewählt !';
        document.getElementById('select-category-inner').classList.add('no_category_selected');
        setTimeout(() => {
            document.getElementById('select-category-inner').innerHTML = 'Select task category';
            document.getElementById('select-category-inner').classList.remove('no_category_selected');
        }, 2500);
        return 'No-Category';
    }
    else {
        return selectNewCategory;
    }
}

/**
 * is creating a task
 *
 * @param {string} event - event that is produced through clicking
 */
async function handleSubmit(event) {
    event.preventDefault();
    await createTask();
}

/**
 * rendering the subtasks
 *
 */
function renderSubtasks() {
    let resultArray = [];
    for (let i = 0; i < subtaskArray.length; i++) {
        let subtask = subtaskArray[i];
        let obj = {
            "subtask": subtask,
            "status": 'open'
        };
        resultArray.push(obj);
    }
    return resultArray;
}

/**
 * deleting the task from array and saves to backend
 *
 * @param {string} i - index of the right task
 */
async function deleteTask(i) {
    testData.splice(i, 1);
    await backend.setItem('testData', JSON.stringify(testData));
    closeEditTask();
    closeTaskPopUp();
    await includeHTML();
}

/**
 * open popup for more information on a task
 * @param {*} i is each element from testData JSON array
 */
function openTaskPopUp(i) {
    let test = testData[i];
    let contact = contacts[i];
    let taskPopUp = document.getElementById(`task-popup`);
    document.querySelector('body').classList.add('overflow-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('side_bar').style.zIndex = 1;
    taskPopUp.classList.remove('d-none');
    document.getElementById('overlay').classList.remove('d-none');
    taskPopUp.innerHTML = openTaskPopUpTemplate(test, i, contact);
    showResponsiveStage(i);
    renderContactPopupInitials(i);
    changePriorityColorPopUp();
}

/**
 * responsive values generated
 *
 * @param {string} i - index of the right task
 */
function showResponsiveStage(i) {
    setInterval(() => {
        let screenWidth = window.innerWidth;
        if (document.getElementById(`stage_option${i}`) == undefined) {
            return;
        }
        if (screenWidth <= 830) {
            document.getElementById(`stage_option${i}`).classList.remove('d-none');
        }
        else {
            document.getElementById(`stage_option${i}`).classList.add('d-none');
        }
    }, 100);
}

/**
 * rendering the correct initials of the contact
 *
 * @param {string} i - index of the right contact
 */
function renderContactPopupInitials(i) {
    let task = testData[i];
    let assignedContactsContainer = document.getElementById(`assigned-popup-contacts-${i}`);
    assignedContactsContainer.innerHTML = '';
    for (let j = 0; j < task['assignedContacts'].length; j++) {
        assignedContactsContainer.innerHTML +=
            `<span>${task['assignedContacts'][j]}</span>`;
    }
}

/**
 * Adds the background color when opening popup
 *
 */
function changePriorityColorPopUp() {
    priorityColor = document.getElementById(`test-priority`);
    if (priorityColor.innerHTML == 'Urgent') {
        priorityColor.classList.add('urgent-popup');
    }
    if (priorityColor.innerHTML == 'Medium') {
        priorityColor.classList.add('medium-popup');
    }
    if (priorityColor.innerHTML == 'Low') {
        priorityColor.classList.add('low-popup');
    }
}

/**
 * close popup and return to the main page
 */
function closeTaskPopUp() {
    document.getElementById('task-popup').classList.add('d-none');
    document.getElementById('overlay').classList.add('d-none');
    document.querySelector('body').classList.remove('overflow-hidden');
    document.getElementById('side_bar').style.zIndex = 11;
}

/**
 * Adds the subtask to task
 *
 */
function addSubtask() {
    let subtaskInput = document.getElementById('task-subtask').value;
    if (subtaskInput.length <= 2) {
        alert('Mindestens 3 Zeichen sind nötig um ein Subtask zu');
    }
    else {
        subtaskArray.push(subtaskInput);
        renderSubtasksInPopUp('popup');
        document.getElementById('task-subtask').value = '';
    }
}


/**
 * Adds the subtask to task
 *
 */
function renderSubtasksInPopUp(value) {
    let subTasks = document.getElementById(`subtasks_${value}`);
    subTasks.innerHTML = '';
    for (let i = 0; i < subtaskArray.length; i++) {
        let subtaskInput = subtaskArray[i];
        subTasks.innerHTML += `<li class="subtask-list">${subtaskInput} <button type="button" onclick="deleteSubtask(${i})" id="delete-subtask">❌</button></li>`;
    }

}


/**
 * 
 * @param {*} i used to specify the index of the subtask that should be deleted from the subtaskArray
 */
function deleteSubtask(i) {
    subtaskArray.splice(i, 1);
    renderSubtasksInPopUp('popup');
}


// Function to prevent that add subtask button submits form
let preventButton = document.getElementById('add-subtask');
preventButton.addEventListener('click', function (event) {
    // Prevent the form from being submitted
    event.preventDefault();
});

/**
 * opens the popup where someone change specific aspects of each task
 * @param {*} i used to specify the index of the element from the testData JSON
 */
function openEditTask(i) {
    let test = testData[i];
    let contact = contacts[i];
    let editTask = document.getElementById('edit-task-popup');
    let taskPopUp = document.getElementById(`task-popup`).classList.add('d-none');
    editTask.classList.remove('d-none');
    editTask.innerHTML = openEditTaskPopUp(test, i);
    document.getElementById('side_bar').style.zIndex = 1;
    // assignContactsToTask('edit', test);
    renderEditPriorityColors(i);
    showSubtasks(i);
}

/**
 * renders the subtask to the board
 *
 * @param {string} i - index of the right task
 */
function showSubtasks(i) {
    let subTasks = testData[i]['subtasks'];
    let container = document.getElementById('show_subtasks');
    container.innerHTML = '';
    for (let j = 0; j < subTasks.length; j++) {
        let subTask = subTasks[j];
        if (subTask['status'] === 'finished') {
            container.innerHTML += renderFinishedSubtask(subTask, j, i);
        }
        else {
            container.innerHTML += renderNonFinishedSubtask(subTask, j, i);
        }
    }
}

/**
 * rendering finished subtasks to the task
 *
 * @param {string} subTask - subtask values
 * @param {string} j - index of the right subtask
 * @param {string} i - index of the right task
 */
function renderFinishedSubtask(subTask, j, i) {
    return `
    <div class="subtask">
        <div>${subTask['subtask']}</div>
        <div id="subtask${j}">
            <button onclick="openSubtask(${i}, ${j})">✔️</button>
        </div>
    </div>
    `;
}

/**
 * rendering finished subtasks to the task
 *
 * @param {string} subTask - subtask values
 * @param {string} j - index of the right subtask
 * @param {string} i - index of the right task
 */
function renderNonFinishedSubtask(subTask, j, i) {
    return `
    <div class="subtask">
        <div>${subTask['subtask']}</div>
        <div id="subtask${j}">
            <button onclick="finishSubtask(${i}, ${j})">🔲</button>
        </div>
    </div>
    `;
}

/**
 * changing the stage from progress to feedback 
 *
 * @param {string} i - index of the right task
 */
async function updateStageOption(i) {
    let stageValue = document.getElementById(`stage_option${i}`);
    testData[i]['status'] = stageValue.value;
    await backend.setItem('testData', JSON.stringify(testData));
    await includeHTML();
}

/**
 * rendering finished subtasks to the task
 *
 * @param {string} j - index of the right subtask
 * @param {string} i - index of the right task
 */
async function openSubtask(i, j) {
    testData[i]['subtasks'][j]['status'] = 'open';
    await backend.setItem('testData', JSON.stringify(testData));
    let container = document.getElementById(`subtask${j}`);
    container.innerHTML = `<button onclick="finishSubtask(${i}, ${j})">🔲</button>`;
}

/**
 * rendering finished subtasks to the task
 *
 * @param {string} subTask - subtask values
 * @param {string} j - index of the right subtask
 * @param {string} i - index of the right task
 */
async function finishSubtask(i, j) {
    testData[i]['subtasks'][j]['status'] = 'finished';
    await backend.setItem('testData', JSON.stringify(testData));
    let container = document.getElementById(`subtask${j}`);
    container.innerHTML = `<button onclick="openSubtask(${i}, ${j})">✔️</button>`;
}

/**
 * changing prio colors
 *
 * @param {string} i - index of the right task
 */
function renderEditPriorityColors(i) {
    test = testData[i];
    let priority = document.getElementById('test-priority');
    let urgentEdit = document.getElementById('urgent-edit');
    let mediumEdit = document.getElementById('medium-edit');
    let lowEdit = document.getElementById('low-edit');
    let priorityImg1Edit = document.getElementById(`img1-edit`);
    let priorityImg2Edit = document.getElementById(`img2-edit`);
    let priorityImg3Edit = document.getElementById(`img3-edit`);
    changePrioritytoBoard(priority, urgentEdit, priorityImg1Edit, mediumEdit, priorityImg2Edit, lowEdit, priorityImg3Edit);
}

/**
 * changing prio colors
 *
 * @param {string} priority - index of the right task
 * @param {string} urgentEdit - prio of the task
 * @param {string} mediumEdit - prio of the task
 * @param {string} lowEdit - prio of the task
 * @param {string} priorityImg1Edit - prio img of the task
 * @param {string} priorityImg2Edit - prio img of the task
 * @param {string} priorityImg3Edit - prio img of the task
 */
function changePrioritytoBoard(priority, urgentEdit, priorityImg1Edit, mediumEdit, priorityImg2Edit, lowEdit, priorityImg3Edit) {
    if (priority.innerHTML == 'Urgent') {
        urgentEdit.classList.add('urgent');
        priorityImg1Edit.classList.add('white');
    }
    if (priority.innerHTML == 'Medium') {
        mediumEdit.classList.add('medium');
        priorityImg2Edit.classList.add('white');
    }
    if (priority.innerHTML == 'Low') {
        lowEdit.classList.add('low');
        priorityImg3Edit.classList.add('white');
    }
}


/**
 * changing prio 
 *
 * @param {string} value - new prio value 
 */
function editPriority(value) {
    newPriority = value;
}

/**
 * changes the priority color to urgent
 *
 */
function changeUrgentColorEdit() {
    let priorityImg1Edit = document.getElementById(`img1-edit`);
    let priorityImg2Edit = document.getElementById(`img2-edit`);
    let priorityImg3Edit = document.getElementById(`img3-edit`);
    let urgentEdit = document.getElementById(`urgent-edit`);
    let mediumEdit = document.getElementById(`medium-edit`);
    let lowEdit = document.getElementById(`low-edit`);
    if (urgentEdit.classList.contains('urgent')) {
        urgentEdit.classList.remove('urgent');
        priorityImg1Edit.classList.remove('white');

    } else {
        changeUrgentEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit);
    }
}

/**
 * changes the priority color to medium
 *
 * @param {string} urgentEdit - prio of the task
 * @param {string} mediumEdit - prio of the task
 * @param {string} lowEdit - prio of the task
 * @param {string} priorityImg1Edit - prio img of the task
 * @param {string} priorityImg2Edit - prio img of the task
 * @param {string} priorityImg3Edit - prio img of the task
 */
function changeUrgentEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit) {
    urgentEdit.classList.add('urgent');
    lowEdit.classList.remove('low');
    mediumEdit.classList.remove('medium');
    priorityImg1Edit.classList.add('white');
    priorityImg2Edit.classList.remove('white');
    priorityImg3Edit.classList.remove('white');
}

/**
 * changes the priority color to medium
 *
 */
function changeMediumColorEdit() {
    let priorityImg1Edit = document.getElementById(`img1-edit`);
    let priorityImg2Edit = document.getElementById(`img2-edit`);
    let priorityImg3Edit = document.getElementById(`img3-edit`);
    let urgentEdit = document.getElementById(`urgent-edit`);
    let mediumEdit = document.getElementById(`medium-edit`);
    let lowEdit = document.getElementById(`low-edit`);
    if (mediumEdit.classList.contains('medium')) {
        mediumEdit.classList.remove('medium');
        priorityImg2Edit.classList.remove('white');

    } else {
        changeMediumEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit);
    }
}

/**
 * changes the priority color to medium
 *
 * @param {string} urgentEdit - prio of the task
 * @param {string} mediumEdit - prio of the task
 * @param {string} lowEdit - prio of the task
 * @param {string} priorityImg1Edit - prio img of the task
 * @param {string} priorityImg2Edit - prio img of the task
 * @param {string} priorityImg3Edit - prio img of the task
 */
function changeMediumEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit) {
    mediumEdit.classList.add('medium');
    urgentEdit.classList.remove('urgent');
    lowEdit.classList.remove('low');
    priorityImg1Edit.classList.remove('white');
    priorityImg2Edit.classList.add('white');
    priorityImg3Edit.classList.remove('white');
}

/**
 * changes the priority color to low
 *
 */
function changeLowColorEdit() {
    let priorityImg1Edit = document.getElementById(`img1-edit`);
    let priorityImg2Edit = document.getElementById(`img2-edit`);
    let priorityImg3Edit = document.getElementById(`img3-edit`);
    let urgentEdit = document.getElementById(`urgent-edit`);
    let mediumEdit = document.getElementById(`medium-edit`);
    let lowEdit = document.getElementById(`low-edit`);
    if (lowEdit.classList.contains('low')) {
        lowEdit.classList.remove('low');
        priorityImg3Edit.classList.remove('white');
    } else {
        changeLowEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit);
    }
}

/**
 * changes the priority color to low
 *
 * @param {string} urgentEdit - prio of the task
 * @param {string} mediumEdit - prio of the task
 * @param {string} lowEdit - prio of the task
 * @param {string} priorityImg1Edit - prio img of the task
 * @param {string} priorityImg2Edit - prio img of the task
 * @param {string} priorityImg3Edit - prio img of the task
 */
function changeLowEditToBoard(urgentEdit, lowEdit, mediumEdit, priorityImg1Edit, priorityImg2Edit, priorityImg3Edit) {
    lowEdit.classList.add('low');
    urgentEdit.classList.remove('urgent');
    mediumEdit.classList.remove('medium');
    priorityImg1Edit.classList.remove('white');
    priorityImg2Edit.classList.remove('white');
    priorityImg3Edit.classList.add('white');
}

/**
 * saves the changes
 *
 * @param {string} i - index of task
 */
async function submitChanges(i) {
    document.getElementById('search-input').value = '';
    searchTask();
    let newTaskName = document.getElementById(`input-edit-${i}`).value;
    let newDescription = document.getElementById(`edit-description${i}`).value;
    let newDate = document.getElementById(`task-date-edit${i}`).value;
    let urgentEdit = document.getElementById('urgent-edit');
    let mediumEdit = document.getElementById('medium-edit');
    let lowEdit = document.getElementById('low-edit');
    await saveChangesSubmit(newTaskName, newDescription, newDate, urgentEdit, mediumEdit, lowEdit, i);

}

/**
 * changes the task with ne info
 *
 * @param {string} newTaskName - new name for task
 * @param {string} newDescription - new description for task
 * @param {string} newDate - new date for task
 * @param {string} urgentEdit - prio for the task
 * @param {string} mediumEdit - prio for the task
 * @param {string} lowEdit - prio for the task
 * @param {string} i - index of the task
 */
async function saveChangesSubmit(newTaskName, newDescription, newDate, urgentEdit, mediumEdit, lowEdit, i) {
    let test = testData[i];
    if (newPriority == undefined) {
        getChangesWithPrio(test, newTaskName, newDescription, newDate);
        await saveSubmitChanges();
    }
    else if (!urgentEdit.classList.contains('urgent') & !mediumEdit.classList.contains('medium') & !lowEdit.classList.contains('low')) {
        alert('Please choose a priority level for your task');
    }
    else {
        getChangesWithoutPrio(test, newTaskName, newDescription, newDate);
        await saveSubmitChanges();
    }
}

/**
 * changes the task with ne info
 *
 * @param {string} newTaskName - new name for task
 * @param {string} newDescription - new description for task
 * @param {string} newDate - new date for task
 * @param {string} test - task from array
 */
function getChangesWithoutPrio(test, newTaskName, newDescription, newDate) {
    test.title = newTaskName;
    test.description = newDescription;
    test.priority = newPriority;
    test.assignedContacts = assignedContacts;
    test.date = newDate;
}

/**
 * changes the task with ne info
 *
 * @param {string} newTaskName - new name for task
 * @param {string} newDescription - new description for task
 * @param {string} newDate - new date for task
 * @param {string} test - task from array
 */
function getChangesWithPrio(test, newTaskName, newDescription, newDate) {
    test.title = newTaskName;
    test.description = newDescription;
    test.assignedContacts = assignedContacts;
    test.priority;
    test.date = newDate;
}

/**
 * saves the changes to the task in backend
 *
 */
async function saveSubmitChanges() {
    await backend.setItem('testData', JSON.stringify(testData));
    closeEditTask();
    closeTaskPopUp();
    hideOrShowPriorityLevels();
    await includeHTML();
}

/**
 * checking for prio in task
 *
 */
function checkForPrio() {
    let urgent = document.getElementById('urgent-edit');
    if (urgent.classList.contains('urgent')) {
        return 'urgent';
    }
    let medium = document.getElementById('medium-edit');
    if (medium.classList.contains('medium')) {
        return 'medium';
    }
    let low = document.getElementById('low-edit');
    if (low.classList.contains('low')) {
        return 'low';
    }
}

/**
 * close edit task popup
 *
 */
function closeEditTask() {
    document.getElementById(`task-popup`).classList.remove('d-none');
    document.getElementById('edit-task-popup').classList.add('d-none');
    document.getElementById('side_bar').style.zIndex = 1;
}


/**
 * clear the input fields 
 */
function clearInputFields() {
    let input = document.getElementById('task-title');
    let selectContacts = document.getElementById('select-contact-add');
    let taskDate = document.getElementById('task-date');
    let taskDescription = document.getElementById('task-description');
    let subTasks = document.getElementById('task-subtask');
    let subTasksPopup = document.getElementById('subtasks_popup');
    inputClear(input, selectContacts, taskDate, taskDescription, subTasks, subTasksPopup);
}

/**
 * clearing all input fields
 *
 * @param {string} input - new name for task
 * @param {string} selectContacts - contacts in task
 * @param {string} taskDate - date for task
 * @param {string} taskDescription - task description 
 * @param {string} subTasks - subtask from task
 * @param {string} subTasksPopup - subtask from task in popup
 */
function inputClear(input, selectContacts, taskDate, taskDescription, subTasks, subTasksPopup) {
    displayCategories.innerHTML = `
    <p id="select-category-inner">Select task category</p>
    <img id="dropwdown-icon" class="dropdown-icon" src="../assets/icons/dropdown.png" alt="">
    `;
    subTasksPopup.innerHTML = '';
    subTasks.value = '';
    input.value = '';
    selectContacts.value = '';
    taskDate.value = '';
    taskDescription.value = '';
}

/**
 * Remove any priority levels
 *
 */
function removePrioritys() {
    urgent.classList.remove('urgent');
    priorityImg1.classList.remove('white');
    medium.classList.remove('medium');
    priorityImg2.classList.remove('white');
    low.classList.remove('low');
    priorityImg3.classList.remove('white');
}


// Drag and Drop Function Start

/**
 * starts drag function 
 *
 * @param {string} id - id for task 
 */
function startDragging(id) {
    let stageContainer = document.getElementById('stage-container')
    stageContainer.style.transition = '';
    stageContainer.style.boxShadow = '';
    stageContainer.style.overflow = '';
    stageContainer.style.overflow = '';
    for (let i = 0; i < testData.length; i++) {
        let index = testData[i]['id'];
        if (index == id) {
            currentDraggedItemId = i;
        }
    }
}

/**
 * allows the drop function 
 *
 * @param {string} ev - event for dragged object
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * renders where the dropped item gets
 *
 * @param {string} status - status of the task
 */
async function dropItem(status) {
    testData[currentDraggedItemId]['status'] = status;
    await backend.setItem('testData', JSON.stringify(testData));
    await includeHTML();
}
// Drag and Drop Function End


/**
 * opens the popup of the shown task
 *
 */
function openAddTaskPopUp(value) {
    taskStatus = value;
    document.getElementById('overlay').classList.remove('d-none');
    document.querySelector('body').classList.add('overflow-hidden');
    document.getElementById('popup').classList.remove('hide');
    document.getElementById('popup').classList.add('show');
    document.getElementById('popup').classList.remove('d-none');
    document.getElementById('side_bar').style.zIndex = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * is closing the task popup and the default board will be shown
 *
 */
function closeAddTaskPopUp() {
    document.getElementById('overlay').classList.add('d-none');
    document.getElementById('popup').classList.add('hide');
    document.getElementById('popup').classList.remove('show');
    document.querySelector('body').classList.remove('overflow-hidden');
    document.getElementById('side_bar').style.zIndex = 11;
}

/**
 * is deleteing the logged on user from the local storage and is logging it out
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
 * is deleteing the logged on user from the local storage and is logging it out
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
    document.getElementById('main-column').classList.add('d-none');

}

/**
 * hides the help me section
 *
 */
function hideHelpMeSection() {
    document.getElementById('help-me-container').classList.add('d-none');
    document.getElementById('main-column').classList.remove('d-none');
}


/**
 * rendering the searched task to board
 * 
 */
function searchTask() {
    let searchTerm = document.getElementById('search-input').value.toLowerCase();
    let resultsTodo = document.getElementById('stage-todo');
    let resultsProgress = document.getElementById('stage-progress');
    let resultsFeedback = document.getElementById('stage-feedback');
    let resultsDone = document.getElementById('stage-done');
    clearResults(resultsTodo, resultsProgress, resultsFeedback, resultsDone);
    if (searchTerm === '') {
        renderData();
        return;
    };
    renderSearchedTaskToBoard(searchTerm, resultsTodo, resultsProgress, resultsFeedback, resultsDone);

}

/**
 * rendering the searched task to board
 * 
 * @param {string} searchTerm - searched value
 * @param {Array} resultsTodo - array with results todo
 * @param {Array} resultsProgress - array with results progress
 * @param {Array} resultsFeedback - array with results feedbacl
 * @param {Array} resultsDone - array with results done
 */
function renderSearchedTaskToBoard(searchTerm, resultsTodo, resultsProgress, resultsFeedback, resultsDone) {
    testData.forEach((task, i) => {
        if (task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)) {
            let resultItem = document.createElement("div");
            if (task['subtasks'].length > 0) {
                let finishedSubtasks = getFinishedSubtasks(task);
                resultItem.innerHTML = getResultItemWithSubtask(task, finishedSubtasks, i);
            }
            else {
                resultItem.innerHTML = getResultItemWithoutSubtask(task, i);
            }
            changeContactInitials(task, resultsTodo, resultsProgress, resultsFeedback, resultsDone, resultItem, i);
        }
    });
}

/**
 * rendering the searched task to board
 * 
 * @param {Array} resultsTodo - array with results todo
 * @param {Array} resultsProgress - array with results progress
 * @param {Array} resultsFeedback - array with results feedbacl
 * @param {Array} resultsDone - array with results done
 */
function clearResults(resultsTodo, resultsProgress, resultsFeedback, resultsDone) {
    resultsProgress.innerHTML = '';
    resultsTodo.innerHTML = '';
    resultsFeedback.innerHTML = '';
    resultsDone.innerHTML = '';
}


/**
 * changed the contacts initials
 * 
 * @param {string} task - right task
 * @param {Array} resultsTodo - array with results todo
 * @param {Array} resultsProgress - array with results progress
 * @param {Array} resultsFeedback - array with results feedbacl
 * @param {Array} resultsDone - array with results done
 * @param {Array} i - index of contact
 */
function changeContactInitials(task, resultsTodo, resultsProgress, resultsFeedback, resultsDone, resultItem, i) {
    if (task['status'] === 'todo') {
        resultsTodo.appendChild(resultItem);
        renderContactInitials(i);
    }
    if (task['status'] === 'progress') {
        resultsProgress.appendChild(resultItem);
        renderContactInitials(i);
    }
    if (task['status'] === 'feedback') {
        resultsFeedback.appendChild(resultItem);
        renderContactInitials(i);
    }
    if (task['status'] === 'done') {
        resultsDone.appendChild(resultItem);
        renderContactInitials(i);
    }
}

/**
 * renders the subtasks to task
 * 
 * @param {string} task - right task
 * @param {Array} i - index of contact
 */
function getResultItemWithoutSubtask(task, i) {
    return `
    <div onclick="openTaskPopUp(${i})" draggable="true" ondragstart="startDragging(${i})" id="stage-container" class="test">
        <h3 class="task_${task['cat']['categoryColor']}" id="category-${i}">${task['cat']['categoryName']}</h3>
        <h4>${task['description']}</h4>
        <p id="task-title" class="grey">${task['title']}</p>
    <div class="progress-container">
    <div class="subtasks-done"></div>
    </div>

    <div class="contact-priority-container">
    <div id="assigned-contacts-${i}" class="assigned-contact"></div>
    <div class="priority-level">
        <img id="urgent-main-6" class="" src="../assets/icons/urgent.png">
        <img id="medium-main-6" class="d-none" src="../assets/icons/medium.png">
        <img id="low-main-6" class="d-none" src="../assets/icons/low.png"></div>
    </div>
    </div>
    `;
}

/**
 * renders the subtasks to task
 * 
 * @param {string} task - right task
 * @param {string} finishedSubtasks - shows the finished subtasks
 * @param {Array} i - index of contact
 */
function getResultItemWithSubtask(task, finishedSubtasks, i) {
    return `
    <div onclick="openTaskPopUp(${i})" draggable="true" ondragstart="startDragging(${i})" id="stage-container" class="test">
        <h3 class="task_${task['cat']['categoryColor']}" id="category-${i}">${task['cat']['categoryName']}</h3>
        <h4>${task['description']}</h4>
        <p id="task-title" class="grey">${task['title']}</p>

        <div class="progress-container">
        <progress style="width:80%" value="${finishedSubtasks}" max="${task['subtasks'].length}"></progress>
        <div class="subtasks-done">${finishedSubtasks}/${task.subtasks.length} Done</div>
        </div>
    <div class="progress-container">
    <div class="subtasks-done"></div>
    </div>
   
    <div class="contact-priority-container">
    <div id="assigned-contacts-${i}" class="assigned-contact"></div>
    <div class="priority-level">
        <img id="urgent-main-6" class="" src="../assets/icons/urgent.png">
        <img id="medium-main-6" class="d-none" src="../assets/icons/medium.png">
        <img id="low-main-6" class="d-none" src="../assets/icons/low.png"></div>
    </div>
    </div>
    `;
}

/**
 * counts the finished subtasks
 * 
 * @param {string} task - right task
 */-
function getFinishedSubtasks(task) {
    let amount = 0;
    for (let i = 0; i < task.subtasks.length; i++) {
        let subtask = task.subtasks[i];
        if (subtask.status == 'finished') {
            amount++;
        }
    }
    return amount;
}

let categorys = document.getElementById('show-categorys');
let addNewCategory = document.getElementById('add-new-category');
let newCategoryName = document.getElementById('new-category-name');
let categoryAlert = document.getElementById('category-alert');
let newCategoryContainer = document.getElementById('new-category-container');
let newCategory = document.getElementById('new-category');

/**
 * Renders categories from an array.
 * 
 * @param {number} i - The index of the created category.
 * @param {Object} createdCategory - The created category object.
 * @returns {HTMLElement} The category element.
 */
function createCategoryElement(i, createdCategory) {
    let categoryElement = document.createElement('div');
    categoryElement.id = `new-category-${i}`;
    categoryElement.classList.add('new-category');
    categoryElement.innerHTML = `
    <div class="new_category_item">
        <div id="category-name">${createdCategory['categoryName']}</div>
        <div class="${createdCategory['categoryColor']}"></div>
    </div>
    `;
    return categoryElement;
}

/**
 * Creates a remove button for a category.
 * 
 * @param {number} i - The index of the category.
 * @param {Array} createdCategorys - The array of created categories.
 * @returns {HTMLButtonElement} The remove button element.
 */
function createRemoveButton(i, createdCategorys) {
    let removeButton = document.createElement('button');
    removeButton.id = 'remove-button';
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', async function (event) {
        event.stopPropagation();
        if (createdCategorys[i] === document.getElementById('select-category-inner').textContent) {
            document.getElementById('select-category-inner').textContent = 'Select task category';
        }
        createdCategorys.splice(i, 1);
        await backend.setItem('createdCategorys', JSON.stringify(createdCategorys));
        renderCategorys();
    });
    return removeButton;
}

/**
 * Adds a click event to a category element.
 * 
 * @param {HTMLElement} categoryElement - The category element.
 * @param {Object} createdCategory - The created category object.
 */
function addCategoryClickEvent(categoryElement, createdCategory) {
    categoryElement.addEventListener('click', function () {
        document.getElementById('select-category-inner').innerHTML = `
        <div class="new_category_item">
            <div id="category_Name_to_Task">${createdCategory['categoryName']}</div>
            <div class="${createdCategory['categoryColor']}"></div>
        </div>`;
        selectNewCategory = createdCategory;
        document.getElementById('show-categorys').classList.add('d-none');
    });
}

/**
 * Renders the categories on the page.
 */
function renderCategorys() {
    let categorys = document.getElementById('created-categorys');
    categorys.innerHTML = '';
    for (let i = 0; i < createdCategorys.length; i++) {
        let createdCategory = createdCategorys[i];
        let categoryElement = createCategoryElement(i, createdCategory);
        let removeButton = createRemoveButton(i, createdCategorys);
        categoryElement.appendChild(removeButton);
        addCategoryClickEvent(categoryElement, createdCategory);
        categorys.appendChild(categoryElement);
    }
}


// hide or show categorylist
displayCategories.addEventListener('click', async function () {
    if (categorys.classList.contains('d-none')) {
        categorys.classList.remove('d-none');
        newCategory.classList.remove('d-none');
    } else {
        categorys.classList.add('d-none');
        newCategory.classList.add('d-none');
    }
});


// show new category input when clicking on 'create new category'
newCategory.addEventListener('click', function () {
    categorys.classList.add('d-none');
    newCategoryContainer.classList.remove('d-none');
    displayCategories.classList.add('d-none');
});


addNewCategory.addEventListener('click', async function () {
    if (newCategoryName.value == '') {
        categoryAlert.classList.remove('d-none');
    } else {
        let newCategory = {
            categoryName: newCategoryName.value,
            categoryColor: newCategoryColor
        };
        createdCategorys.push(newCategory);
        await backend.setItem('createdCategorys', JSON.stringify(createdCategorys));
        hideNewCategory();
    }
    renderCategorys();
    newCategoryColor = '';
});

/**
 * Displays the selected color and updates the new category color.
 * 
 * @param {string} color - The selected color.
 */
function displayColor(color) {
    let clickedImage = event.target;
    let parentContainer = clickedImage.parentNode;
    let colorImages = parentContainer.querySelectorAll('img');
    colorImages.forEach(image => {
        if (image === clickedImage) {
            newCategoryColor = color;
            image.classList.remove('d-none');
        } else {
            image.classList.add('d-none');
        }
    });
}

/**
 * Hides the new category input and restores the default state.
 */
function hideNewCategory() {
    categorys.classList.remove('d-none');
    document.getElementById('show-categorys').classList.add('d-none');
    displayCategories.classList.remove('d-none');
    newCategoryContainer.classList.add('d-none');
    newCategoryName.value = '';
    categoryAlert.classList.add('d-none');
    let colorImages = document.querySelectorAll('.new-category-colors img');
    colorImages.forEach(image => {
        image.classList.remove('d-none');
    });
}


/**
 * opens the dropdown for to select the contact
 *
 */
function showDropDown(value) {
    if (dropDownShow == false) {
        for (let i = 0; i < contacts.length; i++) {
            let contact = contacts[i];
            document.getElementById(`contact_dropdown_${value}`).innerHTML += `
            <div onclick="selectContact(${i})"  class="dropdown_content"><div>${contact['name']}</div> <div class="dropdown_checkbox" id="dropdown_checkbox${i}">▢</div> </div>`;
        }
        return dropDownShow = true;
    }

    if (dropDownShow == true) {
        document.getElementById(`contact_dropdown_${value}`).innerHTML = '';
        return dropDownShow = false;
    }
}

/**
 * select the contact to the task
 *
 * @param {string} i - index of the contact
 */
function selectContact(i) {
    let contact = contacts[i];
    let alreadyAssigned = alreadyAssignedContact(i);
    if (alreadyAssigned) {
        document.getElementById(`dropdown_checkbox${i}`).innerHTML = '▢';
        let assignedContact = assignedContacts.find(ac => ac.name == contact.name);
        let j = assignedContacts.indexOf(assignedContact);
        assignedContacts.splice(j, i);
    }
    if (!alreadyAssigned) {
        document.getElementById(`dropdown_checkbox${i}`).innerHTML = '▣';
        assignedContacts.push(contacts[i].name);
    }

}

/**
 * the user is already assigned and gets removed from the selection 
 *
 * @param {string} i - index of the contact
 */
function alreadyAssignedContact(i) {
    let container = document.getElementById(`dropdown_checkbox${i}`).innerHTML;
    if (container == '▣') {
        return true;
    }
    if (container == '▢') {
        return false;
    }
}


