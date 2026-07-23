// firebase-config.js
// Firebase SDK integration using ES6 Modules from CDN

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace this configuration with your actual Firebase project config

const firebaseConfig = {
  apiKey: "AIzaSyAqU6R1L_WYV-BaBPi0TM5ibA6PTeZUetY",
  authDomain: "student-progress-tracker-a9daf.firebaseapp.com",
  projectId: "student-progress-tracker-a9daf",
  storageBucket: "student-progress-tracker-a9daf.firebasestorage.app",
  messagingSenderId: "903976805391",
  appId: "1:903976805391:web:75c23a625653f2cb24af7a",
  measurementId: "G-X7L08NJ3GE"
};

// Check if Firebase has been configured by the user
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.error("Firebase Initialization failed:", error);
    }
}

// Export instances and configuration flag
export { auth, db, isFirebaseConfigured };
