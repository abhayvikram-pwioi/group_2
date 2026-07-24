import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration placeholder (Replace with your actual keys)
const firebaseConfig = {
  apiKey: "AIzaSyAqU6R1L_WYV-BaBPi0TM5ibA6PTeZUetY",
  authDomain: "student-progress-tracker-a9daf.firebaseapp.com",
  projectId: "student-progress-tracker-a9daf",
  storageBucket: "student-progress-tracker-a9daf.firebasestorage.app",
  messagingSenderId: "903976805391",
  appId: "1:903976805391:web:75c23a625653f2cb24af7a",
  measurementId: "G-X7L08NJ3GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
