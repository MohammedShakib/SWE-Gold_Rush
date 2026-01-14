import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCcsbfkhV0_dyPWwU3M1xPed1H_o-ftUkw",
    authDomain: "gold-rush-2025.firebaseapp.com",
    projectId: "gold-rush-2025",
    storageBucket: "gold-rush-2025.firebasestorage.app",
    messagingSenderId: "577579480262",
    appId: "1:577579480262:web:6a8089c995c230fd4dd3c7",
    measurementId: "G-Y77HC6BTR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;
