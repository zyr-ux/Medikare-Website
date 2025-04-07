import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return;

  // Initially hide button
  loginBtn.style.opacity = "0";
  loginBtn.style.pointerEvents = "none";

  onAuthStateChanged(auth, (user) => {
    // Add fade-out effect
    loginBtn.style.transition = "opacity 0.3s ease";
    loginBtn.style.opacity = "0";

    // Wait a bit before updating the content
    setTimeout(() => {
      if (user) {
        loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> Show Profile`;
        loginBtn.href = "profile.html";
      } else {
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
        loginBtn.href = "login.html";
      }

      // Fade back in
      loginBtn.style.opacity = "1";
      loginBtn.style.pointerEvents = "auto";
    }, 300);
  });
});