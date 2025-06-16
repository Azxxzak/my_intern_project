// src/firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Firebase config from your console
const firebaseConfig = {
  apiKey: "AIzaSyBumsJxK4s15vpHUDZjpqjE2YsX8nol8uo",
  authDomain: "task-manager-892b6.firebaseapp.com",
  projectId: "task-manager-892b6",
  storageBucket: "task-manager-892b6.firebasestorage.app",
  messagingSenderId: "995741718003",
  appId: "1:995741718003:web:85d293feda5d603d7b6e86",
  measurementId: "G-Z09VTPYTF3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export auth and Firestore DB
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
