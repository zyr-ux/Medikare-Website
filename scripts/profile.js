import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBZy4yFDb2nGj8PCeRVeL0H0juJAiA_4ys",
    authDomain: "medikare-kiit.firebaseapp.com",
    projectId: "medikare-kiit",
    storageBucket: "medikare-kiit.firebasestorage.app",
    messagingSenderId: "522506024953",
    appId: "1:522506024953:web:b47dc761f6c13f7f5baf28",
    measurementId: "G-YMNE83R1DC"
};
let manualSignOut = false;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check user login state
onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("user-email").textContent = user.email || "N/A";
      document.getElementById("user-uid").textContent = user.uid || "N/A";
      document.getElementById("user-created").textContent = user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleString()
        : "N/A";
    } else if (!manualSignOut) {
      alert("You are not logged in.");
      window.location.href = "../html/login.html";
    }
  });
// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
    manualSignOut = true;
    signOut(auth).then(() => {
      alert("You have been logged out.");
      window.location.replace("../index.html");
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  });