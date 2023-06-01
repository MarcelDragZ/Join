setURL('https://marcel-herzog.developerakademie.net/join/smallest_backend_ever');
let contacts = [];
let letters = [];
let testData = [];
let priority;
let subtaskArray = [];
let dropDownShow = false;
let assignedContacts = [];
let createdCategorys = [];
let displayCategories = document.getElementById('display-categories');
let categorys = document.getElementById('show-categorys');
let addNewCategory = document.getElementById('add-new-category');
let newCategoryName = document.getElementById('new-category-name');
let categoryAlert = document.getElementById('category-alert');
let newCategoryContainer = document.getElementById('new-category-container');
let newCategory = document.getElementById('new-category');
let overlay = document.getElementById('overlay');
let selectNewCategory = '';

/**
 * Creating contanctlist
 */
async function showContacts() {
    await downloadFromServer();
    contacts = await JSON.parse(backend.getItem('contacts')) || [];
    createdCategorys = await JSON.parse(backend.getItem('createdCategorys')) || [];
    testData = await JSON.parse(backend.getItem('testData')) || [];
    let contactContainer = document.getElementById('contactList');
    contactContainer.innerHTML = '';
    sortContacts(contacts);
    await includeHTML();
    creatSingleLetters();
    let greatLetter;
    renderLetterGroups(contactContainer, greatLetter);
    renderContact();
    parseLoggedOnUser()
    getCurrentPage();
    renderCategorys();
}

/**
 * is rendering the current page url into a variable
 *
 */
function getCurrentPage() {
    let currentPagePath = window.location.pathname;
    let htmlName = currentPagePath.split("/").pop().substring(0, currentPagePath.split("/").pop().lastIndexOf("."));
    document.getElementById(`menu_${htmlName}`).classList.add(htmlName);
}

/**
 * parses the logged on user
 *
 */
function parseLoggedOnUser() {
    let loggedOnUser = JSON.parse(localStorage.getItem("loggedOnUser"));
    let loggedOnUserFirstChart = loggedOnUser.charAt(0);
    let loggedOnUserFirstChartToUpperCase = loggedOnUserFirstChart.toUpperCase();
    document.getElementById('display_logged_on_user').innerHTML = `${loggedOnUserFirstChartToUpperCase}`;
}

/**
 * getting the latters of the contact
 *
 * @param {string} contactContainer - the container to get rendered in
 *  * @param {string} greatLetter - the first latter of contact
 */
function renderLetterGroups(contactContainer, greatLetter) {
    for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        if (letter !== greatLetter && null) {
            letters.push(greatLetter);
            contactContainer.innerHTML += renderLetterContainerHTML(letter.toUpperCase(), i);
        }
        else {
            contactContainer.innerHTML += renderLetterContainerHTML(letter.toUpperCase(), i);
        }
    }
}

/**
 * adding a subtask to task
 *
 */
function addSubtask() {
    let subtaskInput = document.getElementById('task-subtask').value;
    if (subtaskInput.length <= 2) {
        alert('Mindestens 3 Zeichen sind nötig um ein Subtask zu');
    }
    else {
        subtaskArray.push(subtaskInput);
        renderSubtasksInPopUp();
        document.getElementById('task-subtask').value = '';
    }
}

/**
 * adding the subtask into the popup task
 *
 */
function renderSubtasksInPopUp() {
    let subTasks = document.getElementById('subtasks');
    subTasks.innerHTML = '';
    for (let i = 0; i < subtaskArray.length; i++) {
        let subtaskInput = subtaskArray[i];
        subTasks.innerHTML += `<li class="subtask-list">${subtaskInput} <button type="button" onclick="deleteSubtask(${i})" id="delete-subtask">❌</button></li>`;
    }

}


/**
 * delete
 * 
 * @param {*} i used to specify the index of the subtask that should be deleted from the subtaskArray
 */
function deleteSubtask(i) {
    subtaskArray.splice(i, 1);
    renderSubtasksInPopUp();
}

/**
 * Rendering the contact
 *
 */
function renderContact() {
    for (let j = 0; j < contacts.length; j++) {
        let contactName = contacts[j]['name'];
        let contactFirstLetter = contactName[0];
        let contactEmail = contacts[j]['email'];
        let contactPhone = contacts[j]['phone'];
        let contactColor = contacts[j]['randomColors'];
        let bothFirstLetter = splitName(contactName);
        let greatLetter = renderBigLetter(contactName);
        let result = firstLetter(contactFirstLetter.toLowerCase());
        if (contactFirstLetter.toLowerCase() === result.letter) {
            let contactPerson = document.getElementById(`contactLetter${result.index}`);
            contactPerson.innerHTML += renderShowContactsHTML(contactColor, bothFirstLetter, contactName, contactEmail, contactPhone, j);
        }
    }

}

/**
 * is to find the category of the task
 *
 */
function findCategory(categoryName) {
    return createdCategorys.find((obj) => obj.categoryName === categoryName);
}

/**
 * creating an element for a category
 *
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
 * remove button from the category
 *
 * @param {string} i - index of task
 * @param {string} createdCategorys - category which is in the task
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
 * adds the category to the available categories
 *
 * @param {string} categoryElement - created element for the category
 * @param {string} createdCategorys - category which is in the task
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
 * adds the category to the available categories into the container
 *
 * @param {string} categoryElement - created element for the category
 * @param {string} createdCategorys - category which is in the task
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

/**
 * finds the first letter from the contact
 *
 * @param {string} contactFirstLetter - gets the first letter from the contact
 */
function firstLetter(contactFirstLetter) {
    let index = letters.indexOf(contactFirstLetter);
    return { letter: contactFirstLetter, index: index };

}

/**
 * adds the category to the available categories
 *
 */
displayCategories.addEventListener('click', async function () {
    if (categorys.classList.contains('d-none')) {
        categorys.classList.remove('d-none');
        newCategory.classList.remove('d-none');
    } else {
        categorys.classList.add('d-none');
        newCategory.classList.add('d-none');
    }
});


/**
 * adds the category to the available categories
 *
 */
newCategory.addEventListener('click', function () {
    categorys.classList.add('d-none');
    newCategoryContainer.classList.remove('d-none');
    displayCategories.classList.add('d-none');
});

/**
 * adds the category to the available categories and the color will be shown
 *
 * @param {string} color - color of the category
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
 * clears the subtasks input value
 *
 */
function clearSubtasksInput() {
    document.getElementById('task-subtask').value = '';
}

/**
 * adds the category to the available categories
 *
 */
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
 * hides the category to the available categories
 *
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
 * Is adding a new contact
 *
 */
async function AddNewContact() {
    let name = document.getElementById('new-contact-name');
    let email = document.getElementById('new-contact-email');
    let phone = document.getElementById('new-contact-phone');
    let color = randomColor();
    contacts.push({ name: name.value, email: email.value, phone: phone.value, randomColors: color });
    document.getElementById('addcontactlayout').classList.add('d-nones');
    await editSave();
}


function openDetailContact(bothFirstLetter, contactColor, contactName, contactEmail, contactPhone, i) {
    let contactDetail = document.getElementById('layout-contact4');
    contactDetail.innerHTML = '';
    contactDetail.innerHTML = renderOpenDetailContact(bothFirstLetter, contactColor, contactName, contactEmail, contactPhone, i);
    highlightClickedContact(i);
}

/**
 * shows and highlights the clicked contact 
 *
 * @param {string} i - index of the clicked contact 
 */
function highlightClickedContact(i) {
    let highlightedContacts = document.getElementsByClassName('highlight_contact');
    while (highlightedContacts.length) {
        highlightedContacts[0].classList.remove('highlight_contact');
    }
    document.getElementById(`contact_nr${i}`).classList.add('highlight_contact');

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
 * closing the overlay
 *
 */
function closeOverlay() {
    closeAddTaskPopUp();
    closeAddTaskPopUp();
}


overlay.addEventListener('click', closeOverlay);


/**
 * opens the popup of the shown task
 *
 */
function openAddTaskPopUp() {
    document.getElementById('overlay').classList.remove('d-none');
    document.querySelector('body').classList.add('overflow-hidden');
    document.getElementById('popup').classList.remove('hide');
    document.getElementById('popup').classList.add('show');
    document.getElementById('popup').classList.remove('d-none');
    document.getElementById('side_bar').style.zIndex = 1;
    let subtaskdiv = document.getElementById('subtasks');
    subtaskdiv.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

/**
 * setting the priority to the task
 *
 * @param {string} value - value of the element
 */
function setPriority(value) {
    priority = value;
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
 * is rendering a contact to the select list
 *
 */
function renderContacts() {
    let contactContainer = document.getElementById('select-contact-add');
    contactContainer.innerHTML = '';
    contactContainer.innerHTML = `<option value="" disabled="" selected="" hidden="">Select contacts to assign</option>`;
    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
        contactContainer.innerHTML += `<option value="${contact['name']}">${contact['name']}</option>`;
    }
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
}


/**
 * is creating a task and opens the details of the task
 *
 */
async function getTaskDetails() {
    let title = document.getElementById('task-title').value;
    let category = getNewCategory();
    let date = document.getElementById('task-date').value;
    let taskDescription = document.getElementById('task-description').value;
    return { title, category, date, taskDescription };
}

/**
 * getting the id of the task
 *
 */
function getLastItemId() {
    let lastItem = testData[testData.length - 1];
    return lastItem ? Number(lastItem.id) : null;
}

/**
 * stores new item and will get into the array
 *
 * @param {string} details - details is the detailes of the task
 * @param {string} id - id of the task
 */
async function createAndStoreNewItem(details, id) {
    let newItem;
    if (id !== null) {
        newItem = getNewItemWithId(details.title, details.category, details.taskDescription, details.date, id);
    } else {
        newItem = getNewItemWithNoId(details.title, details.category, details.taskDescription, details.date);
    }
    testData.push(newItem);
    await backend.setItem('testData', JSON.stringify(testData));
}

/**
 * Is creating the task
 *
 */
async function createTask() {
    let details = await getTaskDetails();
    let lastItemId = getLastItemId();

    if (details.category === 'No-Category') {
        return;
    }
    if (priority === undefined) {
        priorityAlert();
        return;
    }

    let newId = (lastItemId !== null) ? lastItemId + 1 : null;
    await createAndStoreNewItem(details, newId);

    closeAddTaskPopUp();
    clearInputFields();
    removePrioritys();
    selectNewCategory = '';
}


/**
 * the new item will be returned to the creat task function 
 *
 * @param {string} title - title of the task
 * @param {string} category - category of the task
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
        "status": 'todo',
        "priority": priority,
        "date": date,
        "assignedContacts": assignedContacts,
        "subtasks": renderSubtasks(),
        "id": 0
    };
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
        }, 2000);
        return 'No-Category';
    }
    else {
        return selectNewCategory;
    }
}

/**
 * the new item will be returned to the creat task function 
 *
 * @param {string} title - title of the task
 * @param {string} category - category of the task
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
        "status": 'todo',
        "priority": priority,
        "date": date,
        "assignedContacts": assignedContacts,
        "subtasks": renderSubtasks(),
        "id": newId.toString()
    };
}

/**
 * shows an alert when no prio is selected
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
 * removing the prio
 *
 */
function removePrioritys() {
    let priorityImg1 = document.getElementById('img1');
    let priorityImg2 = document.getElementById('img2');
    let priorityImg3 = document.getElementById('img3');
    let urgent = document.getElementById('urgent');
    let medium = document.getElementById('medium');
    let low = document.getElementById('low');
    urgent.classList.remove('urgent');
    priorityImg1.classList.remove('white');
    medium.classList.remove('medium');
    priorityImg2.classList.remove('white');
    low.classList.remove('low');
    priorityImg3.classList.remove('white');
}

/**
 * slides back the create task popup
 *
 */
function slideBack() {
    document.getElementById('detail-main').classList.add('detail-main-slide-back');
    document.getElementById('detail-main').classList.add('d-nones');
}

/**
 * clears the inputs of all fields
 *
 */
function clearInputs() {
    document.getElementById('new-contact-name').value = '';
    document.getElementById('new-contact-email').value = '';
    document.getElementById('new-contact-phone').value = '';
    document.getElementById('display-categories').innerHTML = `
    <p id="select-category-inner">Select task category</p>
    <img id="dropwdown-icon" class="dropdown-icon" src="../assets/icons/dropdown.png" alt="">
    `;
}

/**
 * clears the inputs of all fields
 *
 */
function clearInputFields() {
    let input = document.getElementById('task-title');
    let taskDate = document.getElementById('task-date');
    let taskDescription = document.getElementById('task-description');
    let subtaskdiv = document.getElementById('task-subtask');
    input.value = '';
    taskDate.value = '';
    taskDescription.value = '';
    subtaskdiv.value = '';
}

/**
 * is creating the first letters of the contacts
 *
 */
function creatSingleLetters() {
    filterFirstLetter();
}

/**
 * changes the priority color to urgent
 *
 */
function changeUrgentColor() {
    let priorityImg1 = document.getElementById('img1');
    let priorityImg2 = document.getElementById('img2');
    let priorityImg3 = document.getElementById('img3');
    let urgent = document.getElementById('urgent');
    let medium = document.getElementById('medium');
    let low = document.getElementById('low');
    if (urgent.classList.contains('urgent')) {
        urgent.classList.remove('urgent');
        priorityImg1.classList.remove('white');

    } else {
        urgentChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low);
    }
}


/**
 * changes the priority to the default one
 *
 */
function changeMediumColor() {
    let priorityImg1 = document.getElementById('img1');
    let priorityImg2 = document.getElementById('img2');
    let priorityImg3 = document.getElementById('img3');
    let urgent = document.getElementById('urgent');
    let medium = document.getElementById('medium');
    let low = document.getElementById('low');
    if (medium.classList.contains('medium')) {
        medium.classList.remove('medium');
        priorityImg2.classList.remove('white');

    } else {
        mediumChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low);
    }
}


/**
 * changes the priority to the default one
 *
 */
function changeLowColor() {
    let priorityImg1 = document.getElementById('img1');
    let priorityImg2 = document.getElementById('img2');
    let priorityImg3 = document.getElementById('img3');
    let urgent = document.getElementById('urgent');
    let medium = document.getElementById('medium');
    let low = document.getElementById('low');
    if (low.classList.contains('low')) {
        low.classList.remove('low')
        priorityImg3.classList.remove('white');
    } else {
        lowChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low);
    }
}

/**
 * changes the priority to the default one
 *
 * @param {string} priorityImg1 - urgent prio
 * @param {string} priorityImg2 - medium prio
 * @param {string} priorityImg3 - low prio
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function urgentChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low) {
    urgent.classList.add('urgent');
    low.classList.remove('low');
    medium.classList.remove('medium');
    priorityImg1.classList.add('white');
    priorityImg2.classList.remove('white');
    priorityImg3.classList.remove('white');
}

/**
 * changes the priority to the default one
 *
 * @param {string} priorityImg1 - urgent prio
 * @param {string} priorityImg2 - medium prio
 * @param {string} priorityImg3 - low prio
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function mediumChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low) {
    medium.classList.add('medium');
    urgent.classList.remove('urgent');
    low.classList.remove('low');
    priorityImg1.classList.remove('white');
    priorityImg2.classList.add('white');
    priorityImg3.classList.remove('white');
}

/**
 * changes the priority to the default one
 *
 * @param {string} priorityImg1 - urgent prio
 * @param {string} priorityImg2 - medium prio
 * @param {string} priorityImg3 - low prio
 * @param {string} urgent - urgent prio
 * @param {string} medium - medium prio
 * @param {string} low - low prio
 */
function lowChange(priorityImg1, priorityImg2, priorityImg3, urgent, medium, low) {
    low.classList.add('low')
    urgent.classList.remove('urgent')
    medium.classList.remove('medium')
    priorityImg1.classList.remove('white');
    priorityImg2.classList.remove('white');
    priorityImg3.classList.add('white');
}


/**
 * splits the name into the first two letters and returns
 *
 * @param {string} fullName - full name of the contact
 */
function splitName(fullName) {
    let namePara = fullName.split(" ");
    let firstName = namePara[0];
    let lastName = namePara[namePara.length - 1];
    let bothFirstLetter = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    return bothFirstLetter;
}

/**
 * splits the name into the first two letters and returns
 *
 */
function filterFirstLetter() {
    letters = [];
    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
        let firstLetter = contact['name'].charAt(0).toLowerCase();
        if (!letters.includes(firstLetter)) {
            letters.push(firstLetter);
        }
    }
}

/**
 * makes the letters big to upper case
 *
 * @param {string} contactName - full name of the contact
 */
function renderBigLetter(contactName) {
    let letter = contactName;
    let greatLetter = letter.charAt(0).toUpperCase();
    return greatLetter;
}


/**
 * Sort contacts from a-z
 */
function sortContacts(contacts) {
    contacts = contacts.sort((a, b) => {
        let a1 = a.name.toLowerCase();
        let b1 = b.name.toLowerCase();
        return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
    });
}

/**
 * Generating random bg-color
 */
function randomColor() {
    let r = Math.floor(Math.random() * 246);
    let g = Math.floor(Math.random() * 246);
    let b = Math.floor(Math.random() * 246);

    return `rgb(${r} ,${g} , ${b})`;
}

/**
 * closes the popup to add a contact
 *
 */
function closeAddContact() {
    document.getElementById('addcontactlayout').classList.add('d-nones');
    document.getElementById('editContactLayout').classList.add('d-nones');
}

/**
 * opens the popup to add a contact
 *
 */
function openAddContact() {
    renderAddNewContactTemp();
    document.getElementById('addcontactlayout').classList.remove('d-nones');
}

/**
 * closes the popup to add a contact
 *
 * @param {string} event - submit event beaing created
 */
function doNotClose(event) {
    event.stopPropagation();
}

/**
 * closes the popup to add a contact
 *
 */
function closeAddContact2() {
    document.getElementById('addcontactlayout').classList.add('d-nones');
    document.getElementById('editContactLayout').classList.add('d-nones');
}

/**
 * addes new contact 
 *
 */
function renderAddNewContactTemp() {
    let newContact = document.getElementById('addcontactlayout');
    newContact.innerHTML = '';
    newContact.innerHTML = redenderAddNewContactTemp2();
}

/**
 * opens the edit function for a contact
 *
 * @param {string} contactName - Name of contact
 * @param {string} contactEmail - email of contact
 * @param {string} contactPhone - phone of contact
 * @param {string} contactColor - color of contact
 * @param {string} bothFirstLetter - letters of the contact 
 * @param {string} i - index of the contact
 */
function openEdit(contactName, contactEmail, contactPhone, contactColor, bothFirstLetter, i) {
    document.getElementById('editContactLayout').classList.remove('d-nones');
    let editContact = document.getElementById('editContactLayout');
    editContact.innerHTML = '';
    editContact.innerHTML = renderOpenEdit(contactName, contactEmail, contactPhone, contactColor, bothFirstLetter, i);
}

/**
 * opens the edit function for a contact and saves
 *
 * @param {string} i - index of the contact
 */
async function editContactSave(i) {
    let contact = contacts[i];
    let newName = document.getElementById('new-edit-contact-name');
    let newMail = document.getElementById('new-edit-contact-email');
    let newPhone = document.getElementById('new-edit-contact-phone');
    contact['name'] = newName.value;
    contact['email'] = newMail.value;
    contact['phone'] = newPhone.value;
    await editSave();
    document.getElementById('layout-contact4').innerHTML = '';
    document.getElementById('editContactLayout').classList.add('d-nones');
}


/**
 * saves the contact item to the backed
 *
 */
async function editSave() {
    await backend.setItem('contacts', JSON.stringify(contacts));
    await backend.setItem('letters', JSON.stringify(letters));
    showContacts();
}

/**
 * splices the contact and saves to the backend
 *
 */
async function deleteContact(i) {
    contacts.splice(i, 1);
    slideBack();
    await editSave();
}

/**
 * opens the dropdown for to select the contact
 *
 */
function showDropDown() {
    if (dropDownShow == false) {
        for (let i = 0; i < contacts.length; i++) {
            let contact = contacts[i];
            document.getElementById('contact_dropdown').innerHTML += `
            <div onclick="selectContact(${i})"  class="dropdown_content"><div>${contact['name']}</div> <div class="dropdown_checkbox" id="dropdown_checkbox${i}">▢</div> </div>`;
        }
        return dropDownShow = true;
    }
    if (dropDownShow == true) {
        document.getElementById('contact_dropdown').innerHTML = ``;
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