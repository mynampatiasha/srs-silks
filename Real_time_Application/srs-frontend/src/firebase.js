import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL-pumD2KEz2nLR2SGv7mDBOJH8zLnXUU",
  authDomain: "srs-silk-traders.firebaseapp.com",
  projectId: "srs-silk-traders",
  storageBucket: "srs-silk-traders.firebasestorage.app",
  messagingSenderId: "173136009650",
  appId: "1:173136009650:web:01b18fbb38e050d04c6cab",
  measurementId: "G-46PEXZZYZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
