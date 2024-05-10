// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu2CQ20BuMplL6bU3VZl69YphFIy6Q1d8",
  authDomain: "ece464-ceb3d.firebaseapp.com",
  projectId: "ece464-ceb3d",
  storageBucket: "ece464-ceb3d.appspot.com",
  messagingSenderId: "630475569925",
  appId: "1:630475569925:web:5668ee0a876bb480ca556c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;