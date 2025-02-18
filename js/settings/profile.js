import { auth, db, doc, getDocs, getDoc, collection, updateRecord, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '../firebaseConfig.js';

// Reset profile username when clicking outside 
const profile = document.getElementById("profile");
const profileName = document.getElementById("profileName");
const profileID = document.getElementById("profileID");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const btnEditSave = document.getElementById("btnEditSave");

// Reset profile username when clicking outside 
const staffProfileInfo = document.getElementById("staffProfileInfo");
const staffProfileName = document.getElementById("staffProfileName");
const staffProfileID = document.getElementById("staffProfileID");
const staffProfileUsername = document.getElementById("staffProfileUsername");
const staffProfileEmail = document.getElementById("staffProfileEmail");
const btnStaffEditSave = document.getElementById("btnStaffEditSave");

const btnChangePass = document.getElementById("btnChangePass");
const btnCancel = document.getElementById("btnCancel");
const currentPass = document.getElementById("currentPass");
const newPass = document.getElementById("newPass");
const repeatPass = document.getElementById("repeatPass");

let correctCurrentPass = ""; // Replace this with actual verification
let originalUsername = ""; // Variable to store the original username


// Add event listener for clicks outside the input
document.addEventListener("click", (event) => {
    if (event.target !== profileUsername && event.target !== btnEditSave) {
        // Reset to the original username if not saved
        if (btnEditSave.classList.contains("bi-check-circle-fill")) {
            profileUsername.value = originalUsername;
        }
    }

    if (event.target !== staffProfileUsername && event.target !== btnStaffEditSave) {
        // Reset to the original username if not saved
        if (btnStaffEditSave.classList.contains("bi-check-circle-fill")) {
            staffProfileUsername.value = originalUsername;
        }
    }
});

btnEditSave.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEditMode(btnEditSave, profileUsername, loggedInUserId);
});

btnStaffEditSave.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEditMode(btnStaffEditSave, staffProfileUsername, loggedInUserId);
});

btnChangePass.addEventListener("click", () => {
    validatePasswordChange(currentPass.value, newPass.value, repeatPass.value);
});

function toggleEditMode(button, username, userID) {
    if (button.classList.contains("bi-pencil-square")) {
        username.removeAttribute("readonly");
        username.classList.add("border-bottom");
        button.classList.remove("bi-pencil-square");
        button.classList.add("bi-check-circle-fill");
    } else {
        username.setAttribute("readonly", true);
        username.classList.remove("border-bottom");
        button.classList.add("bi-pencil-square");
        button.classList.remove("bi-check-circle-fill");

        try {
            updateRecord('Users', userID, { username: username.value });
            showMessage("success", "Username changed successfully!", "Change Username");
            document.getElementById("user").innerText = "Hello " + username.value + "!";
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Current password is incorrect. Please try again.");
        }
    }
}

// Generate random color except black
function generateSubtleColor() {
    let r = Math.floor(Math.random() * 128) + 128; // Restrict to lighter shades
    let g = Math.floor(Math.random() * 128) + 128;
    let b = Math.floor(Math.random() * 128) + 128;
    let a = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function resetFields() {
    currentPass.value = "";
    newPass.value = "";
    repeatPass.value = "";
    btnCancel.click();
}

// Function to validate the passwords
export async function validatePasswordChange(currentPass, newPass, repeatPass) {
    // Check if new password is empty
    if (!currentPass) {
        alert("Current password cannot be empty!");
        return false;
    }

    // Check if new password is empty
    if (!newPass) {
        alert("New password cannot be empty!");
        return false;
    }

    // Check if repeat password matches new password
    if (newPass !== repeatPass) {
        alert("New passwords do not match!");
        return false;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("No user is currently logged in.");
        return false;
    }


    try {
        // Reauthenticate the user (optional but recommended)v
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);

        await updateRecord('Users', user.uid, { password: newPass });
        // Update the password
        await updatePassword(user, newPass);
        showMessage("success", "Password changed successfully!", "Change Password");
        resetFields();

    } catch (error) {
        console.error("Error resetting password:", error);
        alert("Current password is incorrect. Please try again.");
    }
}

export async function fetchUserProfileData() {
    try {
        const userQuery = collection(db, "Users");
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const docId = doc.id;

                if (docId === loggedInUserId && data.role === "admin") {
                    profile.style.backgroundColor = generateSubtleColor();
                    profileID.value = 'ID: ' + loggedInUserId;
                    profileEmail.value = 'Email: ' + data.email
                    profileUsername.value = capitalizeWords(data.username);
                    profileName.textContent = capitalizeWords(data.username.charAt(0));
                    originalUsername = data.username;
                    correctCurrentPass = data.password;
                    document.getElementById("btnStaffEditSave").classList.remove("d-none");
                } else if (docId === loggedInUserId && data.role === "user") {
                    staffProfileInfo.style.backgroundColor = generateSubtleColor();
                    staffProfileID.value = 'ID: ' + loggedInUserId;
                    staffProfileEmail.value = 'Email: ' + data.email;
                    staffProfileUsername.value = capitalizeWords(data.username);
                    staffProfileName.textContent = capitalizeWords(data.username.charAt(0));
                    originalUsername = data.username;
                    correctCurrentPass = data.password;
                    document.getElementById("btnStaffEditSave").classList.add("d-none");
                }

            });
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        showMessage('error', error, 'Pigkeeper');
    }
}

function capitalizeWords(text) {
    return text.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}