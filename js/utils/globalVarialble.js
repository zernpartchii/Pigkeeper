// Global Variable
const loggedInUserId = localStorage.getItem('loggedInUserId');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');
// const userEmail = document.getElementById('userEmail');
const toDoPage = document.getElementById('toDoPage');
const staffSidebar = document.getElementById('staffSidebar');
const adminSidebar = document.getElementById("adminSidebar");
const mainPage = document.getElementById("mainPage");
const topButtons = document.getElementById("topButtons");

// Create Task 
const pigletTaskTitle = document.getElementById('pigletTaskTitle');
const btnSaveChangesPigletTask = document.getElementById('btnSaveChangesPigletTask');
const btnSavePigletTask = document.getElementById('btnSavePigletTask');
const taskname = document.getElementById('taskname');
const reminderTime = document.getElementById('reminderTime');
const assignedPerson = document.getElementById('assignedPerson');
const taskID = document.getElementById('taskID');
const taskNotes = document.getElementById('taskNotes');
const btnCloseTask = document.getElementById('btnCloseTask');

// Get reference  
const feedingType = document.getElementById("feedingType");
const assignedPersonFeeding = document.getElementById("assignedPersonFeeding");

const pigIdDivDropdown = document.getElementById("pigIdDivDropdown");
const pigIdDropdown = document.getElementById("pigIdDropdown");
const pigFeedDropdown = document.getElementById("pigFeedDropdown");
const pigTaskDropdown = document.getElementById("pigTaskDropdown");

const type = document.getElementById('categoryType');
const origin = document.getElementById('origin');

// Get Current Year
const currentYear = new Date().getFullYear();

// Default months to ensure categories are always visible
const defaultMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

var pigID = '';

identifyUsers();

function identifyUsers() {
    if (role === 'user') {
        toDoPage.classList.remove('hidden');
        hideElements(adminSidebar);
        hideElements(topButtons);
        hideElements(mainPage);
        showElements(staffSidebar);
    } else {
        hideElements(staffSidebar);
        showElements(adminSidebar);
        showElements(topButtons);
    }
}

function resetTaskFields() {
    taskname.value = '';
    reminderTime.value = '';
    assignedPerson.value = '';
    taskNotes.value = '';
    btnCloseTask.click();
}

function hideElements(element) {
    element.classList.add('d-none');
}

function showElements(element) {
    element.classList.remove('d-none');
}

// Function to generate a random 6-digit number
function generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const shuffled = characters
        .split('') // Convert to an array
        .sort(() => 0.5 - Math.random()) // Shuffle the array
        .join(''); // Convert back to a string
    return shuffled.slice(0, 6); // Return the first 6 characters
}

function extractNumber(value) {
    const number = value.toString().replace(/[^0-9.]/g, ''); // Remove all non-numeric except "."
    return parseFloat(number) || 0; // Convert to float, default to 0 if empty
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function realTimeData(func) {
    setInterval(func, 120000);
}

function setStatus(fromDate, toDate) {
    const now = new Date(); // Get the current date and time
    const from = new Date(fromDate); // Convert `from` to a Date object
    const to = new Date(toDate); // Convert `to` to a Date object

    // Determine the status based on the current date
    if (now < from) {
        return setColorStatus('Upcoming');
    } else if (now >= from && now <= to) {
        return setColorStatus('Ongoing');
    } else if (now > to) {
        return setColorStatus('Completed');
    } else {
        return setColorStatus('Unknown');
    }
}

function setColorStatus(data) {
    const statusClasses = {
        Upcoming: "bg-primary text-white",
        Ongoing: "bg-warning text-dark",
        Completed: "bg-success text-white",
        Unknown: "bg-danger text-white",
        Pending: "bg-warning text-dark",
        Inactive: "bg-warning text-dark",
        Active: "bg-success text-white",
        Low: "bg-danger text-white",
        Medium: "bg-warning text-dark",
        High: "bg-success text-white",
        Profit: "bg-success text-white",
        Loss: "bg-danger text-white",
    };

    const classNames = statusClasses[data];
    return classNames
        ? `<span class="badge ${classNames} text-uppercase">${data}</span>`
        : `<span class="fw-bold">${data}</span>`;
}

function setTaskStatus(data) {
    return setColorStatus(data);
}

function setPigStatus(data) {
    return setColorStatus(data);
}

function setPriorityLevel(data) {
    return setColorStatus(data);
}

function initializeTaskTable(data) {
    document.getElementById(data.title).textContent = 'List of Task';
    // Initialize or reinitialize the DataTable
    $(data.table).DataTable({
        destroy: true, // Destroy existing table to avoid duplication
        data: data.dataSet, // Pass the formatted data to DataTable
        columns: [
            { title: 'Task Name' },
            { title: 'Reminder Time' },
            // { title: 'Priority Level' },
            { title: 'Notes' },
            { title: 'Status' },
            { title: 'Created At' },
        ],
        lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]], // Dropdown options
        pageLength: 10 // Default number of rows displayed
    });
}

function initializeFeedingTable(data) {
    document.getElementById(data.title).textContent = 'List of Feeding Schedule';

    // Initialize or reinitialize the DataTable
    $(data.table).DataTable({
        destroy: true, // Destroy existing table to avoid duplication
        data: data.dataSet, // Pass the formatted data to DataTable
        columns: [
            { title: 'Feed Type' },
            { title: 'Frequency' },
            { title: 'From' },
            { title: 'To' },
            { title: 'Notes' },
            { title: 'Status' },
            { title: 'Created At' },
        ],
        lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]], // Dropdown options
        pageLength: 10 // Default number of rows displayed
    });
}

function initializeExpenseIncomeTable(table, dataSet) {
    // Define common columns
    const columns = [];

    // Add "Category" column only for the Expense table
    if (table === '#expenseTable') {
        columns.push(
            { title: 'No.', className: 'text-center' },
            { title: 'Pig Name' },
            { title: 'Item Name' },
            { title: 'Category' },
            { title: 'Qty' },
            { title: 'Price' },
            { title: 'Total Expenses' },
        );
    } else {
        // Add remaining columns
        columns.push(
            { title: 'No.', className: 'text-center' },
            { title: 'Item Name' },
            { title: 'Qty' },
            { title: 'Price' },
            { title: 'Gross' },
        );
    }
    // Add remaining columns
    columns.push(
        { title: 'Notes' },
        { title: 'Date' },
        { title: 'Status', className: 'text-center' },
        { title: 'Action', className: 'text-center' }
    );

    // Initialize or reinitialize the DataTable
    $(table).DataTable({
        destroy: true, // Destroy existing table to avoid duplication
        data: dataSet, // Pass the formatted data to DataTable
        columns: columns, // Use the dynamically built columns
        order: [[9, 'desc']],
        lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]], // Dropdown options
        pageLength: 10 // Default number of rows displayed
    });
}