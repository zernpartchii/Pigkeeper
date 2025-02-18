import { firebaseConfig, initializeApp, getAuth, createUserWithEmailAndPassword, deleteUser, db, doc, getDocs, getDoc, setDoc, query, collection, where, deleteOneRecord, signInWithEmailAndPassword, deleteDoc } from '../firebaseConfig.js';
import { loadDropdownData } from '../dropdown.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';

const staffUsername = document.getElementById('staffUsername');
const staffEmail = document.getElementById('staffEmail');
const staffPassword = document.getElementById('staffPassword');
const btnAddStaff = document.getElementById('btnAddStaff');
const btnCloseStaff = document.getElementById('btnCloseStaff');

btnAddStaff.addEventListener('click', addStaff);

// Delegated Event Listeners
document.querySelector('#staffTable').addEventListener('click', (event) => {
    const target = event.target;
    // Handle Delete Button
    if (target.classList.contains('btn-delete')) {
        const data = target.getAttribute('data-id');
        const [docId, email, password] = data.split('|');
        deleteStaff(docId, email, password);
    }
    // Handle Show Password Button
    if (target.classList.contains('btn-showPass')) {
        const docId = target.getAttribute('data-id');
        const passwordInput = document.getElementById(`password-${docId}`);
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'; // Show the password
            target.classList.remove('bi-eye-fill');
            target.classList.add('bi-eye-slash-fill'); // Change icon to indicate "Hide Password"
        } else {
            passwordInput.type = 'password'; // Hide the password
            target.classList.remove('bi-eye-slash-fill');
            target.classList.add('bi-eye-fill'); // Change icon back to "Show Password"
        }
    }
});

function resetFields() {
    staffUsername.value = '';
    staffEmail.value = '';
    staffPassword.value = '';
    btnCloseStaff.click();
}

async function addStaff() {
    if (!staffUsername.value || !staffEmail.value || !staffPassword.value) {
        showMessage('warning', "All fields are required.", 'Staff Management');
        return;
    }

    try {
        // Add user to Firebase Authentication only after ensuring Firestore data is valid
        const userCredential = await createUserWithEmailAndPassword(auth, staffEmail.value, staffPassword.value);
        const user = userCredential.user;

        const userData = {
            loggedInUserId: loggedInUserId,
            role: "user",
            username: staffUsername.value,
            email: staffEmail.value,
            password: staffPassword.value,
            createdAt: new Date()
        };


        // Add user data to Firestore
        await setDoc(doc(db, "Users", user.uid), userData);

        showMessage('success', 'Account created successfully!', 'Staff Management');
        fetchStaffData();
        resetFields();
        loadDropdownData();

    } catch (error) {
        const errorMessage = getCustomErrorMessage(error.code);
        console.error("Error during sign-in:", error);
        alert(errorMessage);
    }
}

async function fetchStaffData() {
    try {
        const userQuery = query(collection(db, "Users"), where("loggedInUserId", "==", loggedInUserId));
        const querySnapshot = await getDocs(userQuery);
        const dataSet = [];
        let no = 1;
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
                const data = doc.data();
                const docId = doc.id;
                // Add data to the table
                if (data.role === 'user') {
                    dataSet.push([
                        no++ || 'N/A',
                        data.username || 'N/A',
                        data.email || 'N/A',
                        `<input type="password" id="password-${docId}" class="form-control bg-transparent border-0" disabled value="${data.password}" />` || 'N/A',
                        data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A',
                        `<button class="bi-eye-fill border-0 btn btn-outline-dark btn-showPass" type="button" data-id="${docId}"></button>
                    <button class="bi-trash-fill border-0 btn btn-outline-danger btn-delete" type="button" data-id="${docId}|${data.email}|${data.password}"></button>`
                    ]);
                }
            });
        }

        // Initialize or reinitialize the DataTable
        $('#staffTable').DataTable({
            destroy: true, // Destroy existing table to avoid duplication
            data: dataSet, // Pass the formatted data to DataTable
            columns: [
                { title: 'No.', className:'text-center' },
                { title: 'Username' },
                { title: 'Email' },
                { title: 'Password' },
                { title: 'Account Created On' },
                { title: 'Action' }
            ],
            order: [[0, 'desc']],
            lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]], // Dropdown options
            pageLength: 10 // Default number of rows displayed
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function deleteStaff(docId, email, password) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        // Fetch the current authenticated user
        const user = auth.currentUser;

        if (!user || user.email !== email) {
            // Sign in to ensure the correct user
            await signInWithEmailAndPassword(auth, email, password);
        }

        const currentUser = auth.currentUser;

        if (currentUser && currentUser.uid === docId) {
            // Proceed to delete the user from Firebase Authentication
            await deleteUser(currentUser);

            // Delete the Firestore document
            try {
                await deleteDoc(doc(db, "Users", docId)); // Step 2: Delete the user from Firestore
                showMessage('success', 'User deleted successfully!', 'Staff Management');
                fetchStaffData(); // Refresh the displayed data
                loadDropdownData();
            } catch (firestoreError) {
                console.error("Error deleting Firestore document:", firestoreError);
                alert("Error deleting user from Firestore: " + firestoreError.message);
            }
        } else {
            alert("No authenticated user to delete, or the user ID does not match.");
        }
    } catch (error) {
        const errorMessage = getCustomErrorMessage(error.code);
        console.error("Error during sign-in:", error);
        alert(errorMessage);
    }
}


fetchStaffData();