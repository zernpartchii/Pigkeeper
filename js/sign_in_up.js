import { auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, db, doc, setDoc, getDoc, updateRecord } from './firebaseConfig.js';

/* Log in with Google */
const btn_google = document.querySelector('.btn-google');
btn_google.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user; // The signed-in user

            // Check if the user's document exists in Firestore
            const docRef = doc(db, "Users", user.uid);
            getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        // If the document exists, store the user ID and redirect
                        localStorage.setItem('role', 'admin');
                        localStorage.setItem('username', username);
                        localStorage.setItem('loggedInUserId', user.uid);
                        window.location.href = "Pigkeeper.php";
                    } else {
                        // If no document exists, show an alert and redirect
                        alert("No account found with this email. Please register first.");
                        const user = auth.currentUser;

                        if (user) {
                            deleteUser(user)
                                .then(() => {
                                    console.log("User deleted successfully");
                                    // Optionally, remove the user’s data from Firestore
                                })
                                .catch((error) => {
                                    console.error("Error deleting user:", error);
                                });
                        } else {
                            console.error("No authenticated user to delete.");
                        }
                        window.location.href = "../index.php";
                    }
                })
                .catch((error) => {
                    alert("Error getting document:", error);
                });
        })
        .catch((error) => {
            console.error("Sign-in error:", error);
        });
});

/* Sign in */
const btn_sign_in = document.getElementById('btn-sign-in');
btn_sign_in.addEventListener('click', (e) => {
    e.preventDefault();

    const email = document.getElementById('email1').value;
    const password = document.getElementById('password1').value;

    // Input validation
    if (!email || !password) {
        alert("All fields are required.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Fetch the role from Firestore
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {

                if (userDoc.data().password !== password) {
                    await updateRecord('Users', user.uid, { password: password });
                }

                const role = userDoc.data().role; // Access the role field
                const username = userDoc.data().username; // Access the role field 
                localStorage.setItem("role", role);
                // localStorage.setItem('email', email);
                localStorage.setItem('username', username);
                localStorage.setItem("loggedInUserId", user.uid);// ✅ Store password in session storage after successful authentication
                sessionStorage.setItem("userPassword", password);                
                window.location.href = "Pigkeeper.php"; // Redirect based on role
            } else {
                alert("No user data found in our Records.");
            }
        })
        .catch((error) => {
            // const errorMessage = error.code;
            const errorMessage = getCustomErrorMessage(error.code);
            alert(errorMessage);
        })

});


/* Sign up */
const btn_sign_up = document.getElementById('btn-sign-up');
btn_sign_up.addEventListener('click', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Input validation
    if (!username || !email || !password) {
        alert("All fields are required.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Add role to Firestore
            // await setDoc(doc(db, "Users", user.uid), { role: "admin", username: username, });

            const userData = {
                loggedInUserId: user.uid,
                role: "admin",
                username: username,
                email: email,
                password: password
            }

            const docRef = doc(db, "Users", user.uid);
            getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        // If the document exists, store the user ID and redirect
                        alert('This email is already registered. Please log in or use a different email.');
                    } else {
                        // If no document exists, show an alert and redirect
                        setDoc(docRef, userData).then(() => {
                            // Optionally, redirect to another page
                            localStorage.setItem('role', 'admin');
                            localStorage.setItem('loggedInUserId', user.uid);
                            window.location.href = "Pigkeeper.php";
                        }).catch((error) => {
                            alert(error);
                        });
                    }
                })
                .catch((error) => {
                    alert("Error getting document:", error);
                });
        })
        .catch((error) => {
            // const errorMessage = error.code;
            const errorMessage = getCustomErrorMessage(error.code);
            alert(errorMessage);
        });

});

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});




