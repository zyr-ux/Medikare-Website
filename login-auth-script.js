// Import functions from Firebase v9 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBZy4yFDb2nGj8PCeRVeL0H0juJAiA_4ys",
  authDomain: "medikare-kiit.firebaseapp.com",
  projectId: "medikare-kiit",
  storageBucket: "medikare-kiit.firebasestorage.app",
  messagingSenderId: "522506024953",
  appId: "1:522506024953:web:b47dc761f6c13f7f5baf28",
  measurementId: "G-YMNE83R1DC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM
const loader = document.getElementById("loading-overlay");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authBtn = document.getElementById("auth-btn");
const toggleBtn = document.getElementById("toggle-btn");
const googleBtn = document.getElementById("google-btn");
const formTitle = document.getElementById("form-title");

let isLogin = true;

// Loader
function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

async function saveUserToFirestore(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email,
    createdAt: serverTimestamp(),
    uid: user.uid
  }, { merge: true }); // merge is safe but not strictly necessary for first time
}

// Login/Register Button
authBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  showLoader();
  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCredential.user);
    }
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  } finally {
    hideLoader();
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  showLoader();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save only if new user
    if (result._tokenResponse?.isNewUser) {
      await saveUserToFirestore(user);
    }

    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  } finally {
    hideLoader();
  }
}); 

// Toggle Login/Register
toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  authBtn.textContent = isLogin ? "Login" : "Register";
  formTitle.textContent = isLogin ? "Login" : "Register";
  toggleBtn.textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});