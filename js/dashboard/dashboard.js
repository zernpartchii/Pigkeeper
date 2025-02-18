import { auth, onAuthStateChanged, signOut, db, doc, getDoc,getDocs,query,where,collection } from '../firebaseConfig.js';
import { fetchUserProfileData } from '../settings/profile.js';

const totalPigSold = document.getElementById('totalPigSold');
const totalPigDeceased = document.getElementById('totalPigDeceased');

const currentYear = new Date().getFullYear(); // Get the current year

export async function fetchPigDataSoldDeceased() {
    let soldCounter = 0; // Counter for sold pigs
    let deceasedCounter = 0; // Counter for deceased pigs

    // Fetch all PigletsRecords for the logged-in user
    const totalPigsDeceasedSnapshot = await getDocs(query(
        collection(db, "PigletsRecords"), 
        where("loggedInUserId", "==", loggedInUserId)
    ));

    if (!totalPigsDeceasedSnapshot.empty) {
        totalPigsDeceasedSnapshot.forEach((doc) => {
            const data = doc.data();
            // Check if the date starts with the current year
            if (data.date.includes(currentYear)) { 
                if (data.status === 'Sold') {
                    soldCounter += data.numberOfPig; // Increment sold counter
                } else if (data.status === 'Deceased') {
                    deceasedCounter += data.numberOfPig; // Increment deceased counter
                }
            }
        });

        // Update the DOM with the counts
        totalPigSold.innerHTML = soldCounter;
        totalPigDeceased.innerHTML = deceasedCounter;
    } else {
        // If no data, set counters to 0
        totalPigSold.innerHTML = 0;
        totalPigDeceased.innerHTML = 0;
    }
}

fetchPigDataSoldDeceased(); 

onAuthStateChanged(auth, (user) => {
    if (loggedInUserId) {
        const docRef = doc(db, "Users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById("user").innerText = "Hello " + userData.username + "!";
                    fetchUserProfileData();
                } else {
                    window.location.href = "../index.php";
                }
            }).catch((error) => {
                alert("Error getting document:", error);
            });
    } else {
        window.location.href = "../index.php";
    }
})

const btnLogout = document.getElementById('btnLogout');
btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
        signOut(auth)
            .then(() => {
                localStorage.removeItem('loggedInUserId');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                window.location.href = "../index.php";
            })
            .catch((error) => {
                alert(error);
            });
    }
});
