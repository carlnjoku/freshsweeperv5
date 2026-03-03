// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, collection } from "firebase/firestore";
import { getDatabase,ref,set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyClmoZ1gPGB3c9tQAR0gvrQsaAZkov-9UU",
    authDomain: "fresh-sweeper.firebaseapp.com",
    databaseURL: "https://fresh-sweeper-default-rtdb.firebaseio.com",
    projectId: "fresh-sweeper",
    storageBucket: "fresh-sweeper.appspot.com",
    messagingSenderId: "283581670255",
    appId: "1:283581670255:web:57c798307d12b0bf94be9a",
    measurementId: "G-B774TTK72R"
};


// Check if Firebase app is already initialized
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getDatabase(firebaseApp);
// Initialize Storage
export const storage = getStorage(firebaseApp);











// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA7BGN9UVL-OUm3MxedoS4k4W4WEEl2GJc",
//   authDomain: "freshsweeper-256ba.firebaseapp.com",
//   projectId: "freshsweeper-256ba",
//   storageBucket: "freshsweeper-256ba.firebasestorage.app",
//   messagingSenderId: "352563621238",
//   appId: "1:352563621238:web:e2f7b25aa72d6fbe8b5e57",
//   measurementId: "G-GPVV3MFCMP"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
