import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAit3DBaX7SeA3f9P17cPJssN2_ZGyjEeA",
  authDomain: "midnight-lantern.firebaseapp.com",
  projectId: "midnight-lantern",
  storageBucket: "midnight-lantern.firebasestorage.app",
  messagingSenderId: "714830160870",
  appId: "1:714830160870:web:bbebb72d25a083ce8dac27",
  measurementId: "G-7P69JDJF7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
