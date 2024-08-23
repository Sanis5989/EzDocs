// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDysPrAzOVQMeevHbItv43ECNeVKXSZYg",
  authDomain: "ez-docs-b1998.firebaseapp.com",
  projectId: "ez-docs-b1998",
  storageBucket: "ez-docs-b1998.appspot.com",
  messagingSenderId: "990563979362",
  appId: "1:990563979362:web:028003e62129fefc93413b",
  measurementId: "G-YLB0EB536G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const auth = initializeAuth(app)

