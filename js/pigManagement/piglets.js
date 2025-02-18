import { db, collection, getDoc, getDocs, query, where, doc, updateDoc, deleteOneRecord, createRecord, updateRecord, addNotificationData, deleteAllRecords, displayFeedingSchedule, displayPigTask } from '../firebaseConfig.js';
import { getFinancialRecordQuery, loadDropdownData } from '../dropdown.js';
import { resetFeedingInputFields } from '../feedingSchedule/feedingSchedule.js';
import { fetchPigsData } from '../analytics/analytics.js';
import { fetchExpenseIncome, removedAttributes } from '../expenseIncome/expenseIncome.js';
import { fetchPigDataSoldDeceased } from '../dashboard/dashboard.js';

// Initialize 
const pigCategory = document.getElementById('pigCategory');
const dateOfBirth = document.getElementById('dateOfBirth');
const batch = document.getElementById('batch');
const numberOfPig = document.getElementById('numberOfPig');
const notes = document.getElementById('notes');
const pigletsID = document.getElementById('pigletsID');
const addPiglets = document.getElementById('addPiglets');
const btnSave = document.getElementById('btnSavePiglets');
const staticBackdropLabel = document.getElementById('staticBackdropLabel');
const btnSaveChanges = document.getElementById('btnSaveChanges');
const btnClosePiglets = document.getElementById('btnClosePiglets');
const btnCloseSoldPiglets = document.getElementById('btnCloseSoldPiglets');
const btnCloseDeceased = document.getElementById('btnCloseDeceased');

const pigletIdDetail = document.getElementById('pigletIdDetail');
const pigletOrigin = document.getElementById('pigletOrigin');
const pigCategoryDetails = document.getElementById('pigCategoryDetails');
const pigletDateOfBirthDetail = document.getElementById('pigletDateOfBirthDetail');
const pigletNumberOfDaysDetail = document.getElementById('pigletNumberOfDaysDetail');
const pigletBatchDetail = document.getElementById('pigletBatchDetail');
const pigletNumberOfPigsDetail = document.getElementById('pigletNumberOfPigsDetail');
const pigletRemainingPigsDetail = document.getElementById('pigletRemainingPigsDetail');
const pigletNoteDetail = document.getElementById('pigletNoteDetail');
const pigletStatusDetail = document.getElementById('pigletStatusDetail');

const pigletManagement = document.getElementById('pigletManagement');
const pigletDetails = document.getElementById('pigletDetails');
const pigletBackBtn = document.getElementById('pigletBackBtn');

const dateSold = document.getElementById('dateSold');
const numberOfPigSold = document.getElementById('numberOfPigSold');
const soldNotes = document.getElementById('soldNotes');
const pricePerHead = document.getElementById('pricePerHead');
const btnSold = document.getElementById('btnSold');

const dateDeceased = document.getElementById('dateDeceased');
const numberOfPigDeceased = document.getElementById('numberOfPigDeceased');
const deceasedNotes = document.getElementById('deceasedNotes');
const btnMarkAsDeceased = document.getElementById('btnMarkAsDeceased');

const btnSavePigletTask = document.getElementById('btnSavePigletTask');
const totalPiglets = document.getElementById('totalPiglets');
const totalFattening = document.getElementById('totalFattening');
const totalLetchon = document.getElementById('totalLetchon');

// Attach the event listener to the save button
btnSave.addEventListener('click', addNewPiglet);
btnSold.addEventListener('click', updatePigletStatusSold);
btnMarkAsDeceased.addEventListener('click', updatePigletStatusDeceased);
btnSaveChanges.addEventListener('click', updatePiglet);

addPiglets.addEventListener('click', () => {
    resetFields();
    btnSaveChanges.classList.add('d-none');
    btnSave.classList.remove('d-none');
    staticBackdropLabel.textContent = 'Add Piglets';
});

pigletBackBtn.addEventListener('click', () => {
    pigletManagement.classList.remove('d-none');
    pigletDetails.classList.add('d-none');
});

// Delegated Event Listeners
document.querySelector('#pigletsTable').addEventListener('click', async (event) => {
    const target = event.target;

    if (target.classList.contains('btn-AddSched')) {
        const pigletID = target.getAttribute('data-id');
        pigID = pigletID;
        resetFeedingInputFields();
        pigFeedDropdown.value = pigID;
        // Call the reusable function with pigletID
        await getFinancialRecordQuery(pigletID);
    }

    if (target.classList.contains('btn-AddExpense')) {
        removedAttributes();
        const pigletID = target.getAttribute('data-id');
        pigIdDropdown.value = pigletID;
        type.value = "Expense";
    }

    if (target.classList.contains('btn-CreateTask')) {
        const docId = target.getAttribute('data-id');
        pigID = docId;
        pigTaskDropdown.value = docId;
        pigletTaskTitle.textContent = 'Create a Task for Piglets';
        btnSaveChangesPigletTask.classList.add('d-none');
        btnSavePigletTask.classList.remove('d-none');
        resetTaskFields();
    }

    if (target.classList.contains('btn-Sold')) {
        const dataId = target.getAttribute('data-id');
        pigID = dataId;
    }

    if (target.classList.contains('btn-Deceased')) {
        const dataId = target.getAttribute('data-id');
        pigID = dataId;
    }

    // Handle View Button
    if (target.classList.contains('btn-MoreDetails')) {
        const docId = target.getAttribute('data-id');
        viewPigletDetails(docId);
    }

    // Handle Edit Button
    if (target.classList.contains('btn-edit')) {
        const docId = target.getAttribute('data-id');
        viewPiglet(docId);
    }

    // Handle Delete Button
    if (target.classList.contains('btn-delete')) {
        const dataId = target.getAttribute('data-id'); // Get the concatenated data-id
        const [docId, pigID] = dataId.split('|');
        deletePiglet(docId, pigID);
    }
});

function getPigletsData(includeId = true) {
    const pigletsData = {
        loggedInUserId: loggedInUserId,
        origin: origin.value,
        pigCategory: pigCategory.value,
        dateOfBirth: dateOfBirth.value,
        batch: batch.value,
        numberOfPig: numberOfPig.value,
        remainingPig: numberOfPig.value,
        notes: notes.value,
        status: 'Active',
        createdAt: new Date()
    }

    // Only add the ID if includeId is true
    if (includeId) {
        pigletsData.pigID = 'LET-' + generateRandomId();
    }

    return pigletsData;
}

function resetFields() {
    pigCategory.value = "";
    origin.value = "";
    dateOfBirth.value = "";
    batch.value = "";
    numberOfPig.value = "";
    notes.value = "";
    btnClosePiglets.click();
}

// Function to add a new piglet with a random 6-digit ID
async function addNewPiglet() {

    if (!origin.value) {
        showMessage('warning', 'Please select the origin of the pig', 'Piglet Management');
        return;
    }

    if (!pigCategory.value) {
        showMessage('warning', 'Please select the category of the pig', 'Piglet Management');
        return;
    }

    if (!dateOfBirth.value) {
        showMessage('warning', 'Please enter the date of birth of the pig', 'Piglet Management');
        return;
    }
    if (!batch.value) {
        showMessage('warning', 'Please enter the batch of the pig', 'Piglet Management');
        return;
    }
    if (!numberOfPig.value) {
        showMessage('warning', 'Please enter the number of the pigs', 'Piglet Management');
        return;
    }
    if (numberOfPig.value <= 0) {
        showMessage('warning', 'The number of pigs must be a positive integer (greater than zero).', 'Piglet Management');
        return;
    }

    const selectedDate = new Date(dateOfBirth.value); // Parse the value into a Date object
    const today = new Date(); // Get the current date 

    if (selectedDate > today) {
        showMessage("warning", "Selected date cannot be in the future.", "Piglet Management");
        return;
    }

    try {
        // Add new piglet with the generated ID
        const pigQuery = query(
            collection(db, "Piglets"),
            where("origin", "==", origin.value),
            where("pigCategory", "==", pigCategory.value),
            where("batch", "==", batch.value),
            where("loggedInUserId", "==", loggedInUserId)
        );
        const querySnapshot = await getDocs(pigQuery);

        if (querySnapshot.empty) {
            // No existing piglet with the same batch
            createRecord("Piglets", getPigletsData(true));
            showMessage('success', 'Added successfully', 'Piglet Management');
            resetFields();
            await loadDropdownData();
            fetchPigletData(); // Refresh the displayed data 
        } else {
            // A piglet with the same batch number already exists. Please check the batch number and try again.
            showMessage('warning', 'A pig with the same batch already exists. Please check the batch number and try again.', 'Piglet Management');
        }


    } catch (error) {
        console.error("Error adding document:", error);
        alert('An error occurred: ' + error.message);
    }
}

async function fetchPigletData() {
    try {
        // Create a query to filter documents by loggedInUserId
        const pigQuery = query(
            collection(db, "Piglets"),
            where("loggedInUserId", "==", loggedInUserId)
        );

        // Execute the query
        const querySnapshot = await getDocs(pigQuery);

        const dataSet = []; // Array to hold rows of data
        let Piglets = 0;
        let Fattening = 0;
        let Letchon = 0;
        let counter = 1;
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const docId = doc.id; // Firestore document ID

                let status = "", days = "";

                if (data.status === 'Inactive') {
                    status = setPigStatus(data.status);
                    days = data.daysInactive;
                } else {
                    status = setPigStatus(data.status);
                    days = calculateTotalDays(data.dateOfBirth, getTodayInISOFormat(new Date()));
                }

                switch (data.pigCategory) {
                    case 'Piglets': Piglets += parseInt(data.remainingPig, 10); break;
                    case 'Letchon': Letchon += parseInt(data.remainingPig, 10); break;
                    case 'Fattening': Fattening += parseInt(data.remainingPig, 10); break;
                    default:
                        break;
                }

                // Add a row of data to the dataSet array
                dataSet.push([
                    // counter++,
                    data.pigID || 'N/A',
                    data.origin || 'N/A',
                    data.pigCategory || 'N/A',
                    data.batch || 'N/A',
                    dateFormatter(data.dateOfBirth) || 'N/A',
                    days || 'N/A',
                    data.numberOfPig || '0',
                    data.remainingPig || '0',
                    `<div class="d-inline-block text-truncate" style="max-width: 150px;">${data.notes}</div>` || 'N/A',
                    status || 'N/A',
                    data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A',
                    `<div class="dropdown">
                        <button class="btn btn-outline-dark border-0 bi-pencil-fill" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                        <ul class="dropdown-menu">
                            <li class="border-bottom"><button class="dropdown-item btn-MoreDetails" type="button" data-bs-toggle="modal" data-bs-target="#" data-id="${docId}">More Details</button></li>
                            <div class="${data.status === 'Inactive' ? 'd-none' : ''}">
                                <li class="border-bottom"><button class="dropdown-item btn-CreateTask" type="button" data-bs-toggle="modal" data-bs-target="#pigletTaskModal" data-id="${data.pigID}">Create Task</button></li>
                                <li class="border-bottom"><button class="dropdown-item btn-AddSched" type="button" data-bs-toggle="modal" data-bs-target="#feedingModal" data-id="${data.pigID}">Add Feeding Schedule</button></li>
                                <li class="border-bottom"><button class="dropdown-item btn-AddExpense" type="button" data-bs-toggle="modal" data-bs-target="#inventoryModal" data-id="${data.pigID}">Add Expense</button></li>
                                <li class="border-bottom"><button class="dropdown-item btn-Sold" type="button" data-bs-toggle="modal" data-bs-target="#dateSoldModal" data-id="${docId}">Mark as Sold</button></li>
                                <li class="border-bottom"><button class="dropdown-item btn-Deceased" type="button" data-bs-toggle="modal" data-bs-target="#dateDeceasedModal" data-id="${docId}">Mark as Deceased</button></li>
                                <li class="border-bottom"><button class="dropdown-item btn-edit" type="button" data-bs-toggle="modal" data-bs-target="#pigletsModal" data-id="${docId}">Edit</button></li>
                            </div>
                            <li class=""><button class="dropdown-item btn-delete" type="button" data-id="${docId}|${data.pigID}">Delete</button></li>
                        </ul>
                    </div>`
                ]);
            });
        }

        totalFattening.textContent = Fattening;
        totalLetchon.textContent = Letchon;
        totalPiglets.textContent = Piglets;

        // Initialize or reinitialize the DataTable
        $('#pigletsTable').DataTable({
            destroy: true, // Destroy existing table to avoid duplication
            data: dataSet, // Pass the formatted data to DataTable
            columns: [
                // { title: 'Piglet ID' },
                { title: 'ID', className: 'text-center' },
                { title: 'Origin' },
                { title: 'Pig Category' },
                { title: 'Batch' },
                { title: 'Date of Birth' },
                { title: 'Age' },
                { title: 'Number of Pigs' },
                { title: 'Remaining Pigs' },
                { title: 'Notes' },
                { title: 'Status', className: 'text-center' },
                { title: 'Created At' },
                { title: 'Action', className: 'text-center' }
            ],
            order: [[9, 'asc']],
            lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]], // Dropdown options
            pageLength: 10 // Default number of rows displayed
        });

    } catch (error) {
        console.error("Error deleting document:", error);
        alert('An error occurred: ' + error.message);
    }
}

async function updatePigletStatusDeceased() {

    if (!confirm('Are you sure you want to mark as desceased this pig?')) return;

    try {
        const pigletDocRef = doc(db, "Piglets", pigID);
        const pigletDoc = await getDoc(pigletDocRef);
        const pigDeceased = extractNumber(numberOfPigDeceased.value);

        if (pigletDoc.exists()) {
            const data = pigletDoc.data();

            if (!dateDeceased.value) {
                showMessage('warning', 'Please enter the date deceased of the pig', 'Piglet Management');
                return
            }

            if (pigDeceased > data.remainingPig) {
                showMessage('warning', 'The number of pigs deceased is greater than the remaining pigs.', 'Piglet Management');
                return
            }

            if (pigDeceased <= 0) {
                showMessage('warning', 'The number of pigs must be a positive integer (greater than zero).', 'Piglet Management');
                return;
            }

            const remainingPig = data.remainingPig - pigDeceased
            data.remainingPig = remainingPig

            if (remainingPig == 0) {
                data.status = 'Inactive';
                data.daysInactive = calculateTotalDays(data.dateOfBirth, dateDeceased.value);
                const notificationData = {
                    pigID: data.pigID,
                    origin: data.origin,
                    pigCategory: data.pigCategory,
                    batch: data.batch,
                    dateOfBirth: data.dateOfBirth,
                    numberOfPigs: data.numberOfPig,
                    notes: data.notes,
                    createdAt: getTodayInISOFormat(new Date()),
                    status: 'Inactive'
                };
                addNotificationData(notificationData);
            }

            const PigletsRecords = {
                loggedInUserId: loggedInUserId,
                pigID: data.pigID,
                date: dateDeceased.value,
                numberOfPig: pigDeceased,
                notes: deceasedNotes.value,
                status: 'Deceased'
            }

            createRecord("PigletsRecords", PigletsRecords);
            await updateDoc(pigletDocRef, data);

            showMessage('success', 'Data saved successfully', 'Piglet Management')
            numberOfPigDeceased.value = "1";
            fetchPigletData(); // Refresh the displayed data
            fetchPigDataSoldDeceased();
            btnCloseDeceased.click();
        } else {
            console.warn("No such document!");
        }
    } catch (error) {
        console.error("Error updating document:", error);
        alert('An error occurred: ' + error.message);
    }
}

async function updatePigletStatusSold() {

    if (!confirm('Are you sure you want to mark as sold this pig?')) return;
    try {
        const pigletDocRef = doc(db, "Piglets", pigID);
        const pigletDoc = await getDoc(pigletDocRef);

        const pigSold = extractNumber(numberOfPigSold.value);

        if (pigletDoc.exists()) {
            const data = pigletDoc.data();

            if (!dateSold.value) {
                showMessage('warning', 'Please enter the date sold of the pig', 'Piglet Management');
                return
            }

            if (!pricePerHead.value) {
                showMessage('warning', 'Please enter the Price per head of the pig', 'Piglet Management');
                return
            }

            if (pigSold > data.remainingPig) {
                showMessage('warning', 'The number of pigs sold is greater than the remaining pigs.', 'Piglet Management');
                return
            }

            if (pigSold <= 0) {
                showMessage('warning', 'The number of pigs must be a positive integer (greater than zero).', 'Piglet Management');
                return;
            }

            const remainingPig = data.remainingPig - pigSold
            data.remainingPig = remainingPig

            if (remainingPig == 0) {
                data.status = 'Inactive';
                data.daysInactive = calculateTotalDays(data.dateOfBirth, dateSold.value);

                const notificationData = {
                    pigID: data.pigID,
                    batch: data.batch,
                    dateOfBirth: data.dateOfBirth,
                    numberOfPigs: data.numberOfPig,
                    notes: data.notes,
                    createdAt: getTodayInISOFormat(new Date()),
                    status: 'Inactive'
                };

                // Add notification
                addNotificationData(notificationData);
                updateFinancialStatus(data, dateSold.value,);

            }

            let itemName;

            switch (data.pigCategory) {
                case 'Piglets': itemName = "Piglets"; break;
                case 'Letchon': itemName = "Letchon"; break;
                case 'Fattening': itemName = "Fattening"; break;
                default: break;
            }

            const IncomeRecords = {
                loggedInUserId: loggedInUserId,
                pigId: data.pigID,
                pigName: itemName + ' - ' + data.batch,
                origin: data.origin,
                itemName: 'Sold ' + itemName,
                qty: pigSold,
                price: pricePerHead.value,
                dateFinance: dateSold.value,
                financialNotes: soldNotes.value,
                type: "Income",
                createdAt: new Date()
            };

            const PigletsRecords = {
                loggedInUserId: loggedInUserId,
                pigID: data.pigID,
                date: dateSold.value,
                numberOfPig: pigSold,
                notes: soldNotes.value,
                status: 'Sold'
            }
            await createRecord("FinancialRecord", IncomeRecords);
            await createRecord("PigletsRecords", PigletsRecords);

            await updateDoc(pigletDocRef, data);

            showMessage('success', 'Data saved successfully', 'Piglet Management')
            fetchPigletData(); // Refresh the displayed data 
            fetchExpenseIncome();
            fetchPigsData();
            fetchPigDataSoldDeceased();

            btnCloseSoldPiglets.click();
            numberOfPigSold.value = "1";
            soldNotes.value = "";
            pricePerHead.value = "";
            dateSold.value = "";

        } else {
            console.warn("No such document!");
        }
    } catch (error) {
        console.error("Error updating document:", error);
        alert('An error occurred: ' + error.message);
    }
}

export async function updateFinancialStatus(pigData, dateSold) {
    // Update status in Financial Record 
    const querySnapshot = await getDocs(query(collection(db, "FinancialRecord")));

    const dataSet = [];
    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.docId = doc.id;

            if (pigData.origin === data.pigName && data.status === 'Ongoing') {

                const qty = extractNumber(data.qty || 0); // Ensure default 0 if null
                const price = extractNumber(data.price || 0);
                const total = qty * price;

                // Get the total expenses of pigsow reference by piglets
                dataSet.push({
                    name: data.itemName || 'N/A',
                    quantity: data.qty || 0,
                    price: data.price || 0,
                    total: total || 0,
                });

                updateRecord("FinancialRecord", data.docId, { status: 'Completed', });
            }

            if (data.pigId === pigData.pigID && data.type === 'Expense') {
                updateRecord("FinancialRecord", data.docId, { status: 'Completed' });
            }

            if (data.pigId === pigData.pigsowID && data.type === 'Expense') {

                const qty = extractNumber(data.qty || 0); // Ensure default 0 if null
                const price = extractNumber(data.price || 0);
                const total = qty * price;

                // Get the total expenses of pigsow reference by piglets
                dataSet.push({
                    name: data.itemName || 'N/A',
                    quantity: data.qty || 0,
                    price: data.price || 0,
                    total: total || 0,
                });

                updateRecord("FinancialRecord", data.docId, { status: 'Completed' });
            }
        });
    }

    const listOfPigsowExpenses = {
        loggedInUserId: loggedInUserId,
        dataSet: dataSet,
        origin: pigData.origin || 'Purchased',
        pigID: pigData.pigID || pigData.pigsowID,
        pigName: ('Origin: ' + pigData.origin + ' & ' + pigData.pigCategory + ' - ' + pigData.batch) || pigData.sowName,
        date: dateFormatter(dateSold),
    }
    // if(dataSet.length != 0){
    await createRecord("ListOfPigsowExpenses", listOfPigsowExpenses);
    // }


}

async function displayPigletRecords(pigID) {

    try {
        const pigletRecordsQuery = query(
            collection(db, "PigletsRecords"),
            where("pigID", "==", pigID)
        );

        // Execute the query
        const querySnapshot = await getDocs(pigletRecordsQuery);
        const dataSet = []; // Array to hold rows of data

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const docId = doc.id; // Firestore document ID

                var status = '';

                if (data.status === 'Sold') {
                    status = `<span class="badge bg-danger text-white text-uppercase">${data.status}</span>`;
                } else if (data.status === 'Deceased') {
                    status = `<span class="badge bg-warning text-dark text-uppercase">${data.status}</span>`;
                }

                // Add a row of data to the dataSet array
                dataSet.push([
                    dateFormatter(data.date) || 'N/A',
                    data.numberOfPig || 'N/A',
                    data.notes || 'N/A',
                    status || 'N/A',
                ]);
            });

            document.getElementById('pigletRecordsTitle').textContent = 'Record History';
            // Initialize or reinitialize the DataTable
            $('#pigletRecordsTable').DataTable({
                destroy: true, // Destroy existing table to avoid duplication
                data: dataSet, // Pass the formatted data to DataTable
                columns: [
                    { title: 'Date' },
                    { title: 'Number of Pigs' },
                    { title: 'Notes' },
                    { title: 'Status' },
                ],
            });
        }
    } catch (error) {
        console.error("Error deleting document:", error);
        alert('An error occurred: ' + error.message);
    }
}

async function viewPigletDetails(pigID) {

    pigletManagement.classList.add('d-none');
    pigletDetails.classList.remove('d-none');

    try {
        const pigletDocRef = doc(db, "Piglets", pigID);
        const docSnap = await getDoc(pigletDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            var days = '';
            if (data.status === 'Inactive') {
                days = data.daysInactive;
            } else {
                days = calculateTotalDays(data.dateOfBirth, getTodayInISOFormat(new Date()))
            }

            pigletIdDetail.textContent = data.pigID || 'N/A';
            pigletOrigin.textContent = data.origin || 'N/A';
            pigCategoryDetails.textContent = data.pigCategory || 'N/A';
            pigletDateOfBirthDetail.textContent = dateFormatter(data.dateOfBirth) || 'N/A';
            pigletNumberOfDaysDetail.textContent = days || 'N/A';
            pigletBatchDetail.textContent = data.batch || 'N/A';
            pigletNumberOfPigsDetail.textContent = data.numberOfPig || '0';
            pigletRemainingPigsDetail.textContent = data.remainingPig || '0';
            pigletNoteDetail.textContent = data.notes || 'N/A';
            pigletStatusDetail.innerHTML = setPigStatus(data.status) || 'N/A';

            const taskData = {
                title: 'pigletActivityTitle',
                table: '#pigletActivityTable',
                dataSet: await displayPigTask(data.pigID)
            }
            initializeTaskTable(taskData);

            const feedingData = {
                title: 'pigletfeedingTitle',
                table: '#pigletfeedingTable',
                dataSet: await displayFeedingSchedule(data.pigID)
            }

            initializeTaskTable(taskData);
            initializeFeedingTable(feedingData);
            displayPigletRecords(data.pigID);

        } else {
            alert('No data found for the selected record.');
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        alert('An error occurred: ' + error.message);
    }
}

// Function to view a single piglet's data
async function viewPiglet(pigID) {
    btnSaveChanges.classList.remove('d-none');
    btnSave.classList.add('d-none');
    staticBackdropLabel.textContent = 'Update Piglets';
    try {
        const pigletDocRef = doc(db, "Piglets", pigID);
        const docSnap = await getDoc(pigletDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            pigletsID.value = pigID;
            dateOfBirth.value = data.dateOfBirth;
            origin.value = data.origin;
            batch.value = data.batch;
            numberOfPig.value = data.numberOfPig;
            notes.value = data.notes;

        } else {
            alert('No data found for the selected record.');
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        alert('An error occurred: ' + error.message);
    }
}

// Function to update a piglet
async function updatePiglet() {

    if (!origin.value) {
        showMessage('warning', 'Please select the origin of the pig', 'Piglet Management');
        return;
    }

    if (!pigCategory.value) {
        showMessage('warning', 'Please select the categoty of the pig', 'Piglet Management');
        return;
    }

    if (!dateOfBirth.value) {
        showMessage('warning', 'Please enter the date of birth of the pig', 'Piglet Management');
        return;
    }
    if (!batch.value) {
        showMessage('warning', 'Please enter the batch of the pig', 'Piglet Management');
        return;
    }
    if (!numberOfPig.value) {
        showMessage('warning', 'Please enter the number of the pigs', 'Piglet Management');
        return;
    }

    const selectedDate = new Date(dateOfBirth.value); // Parse the value into a Date object
    const today = new Date(); // Get the current date 

    if (selectedDate > today) {
        showMessage("warning", "Selected date cannot be in the future.", "Piglet Management");
        return;
    }

    try {
        updateRecord("Piglets", pigletsID.value, getPigletsData(false));
        showMessage('success', 'Updated successfully', 'Piglet Management')
        fetchPigletData(); // Refresh the displayed data
    } catch (error) {
        console.error("Error updating document:", error);
        alert('An error occurred: ' + error.message);
    }
}

// Function to delete a piglet
async function deletePiglet(id, pigID) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {

        await deleteOneRecord("Piglets", id);
        await deleteAllRecords("Task", "pigID", pigID);
        await deleteAllRecords("FeedingSchedule", "pigID", pigID);
        await deleteAllRecords("NotificationData", "pigID", pigID);
        await deleteAllRecords("PigletsRecords", "pigID", pigID);
        await deleteAllRecords("FinancialRecord", "pigId", pigID);
        await deleteAllRecords("ListOfPigsowExpenses", "pigID", pigID);

        showMessage('success', 'Deleted successfully', 'Piglet Management')
        fetchPigletData(); // Refresh the displayed data
        fetchExpenseIncome();
        await loadDropdownData();
    } catch (error) {
        console.error("Error deleting document:", error);
        alert('An error occurred: ' + error.message);
    }

}

// Call the function to fetch and display data
fetchPigletData();