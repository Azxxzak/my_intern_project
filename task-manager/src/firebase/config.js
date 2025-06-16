// src/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBumsJxK4s15vpHUDZjpqjE2YsX8nol8uo",
  authDomain: "task-manager-892b6.firebaseapp.com",
  projectId: "task-manager-892b6",
  storageBucket: "task-manager-892b6.firebasestorage.app",
  messagingSenderId: "995741718003",
  appId: "1:995741718003:web:85d293feda5d603d7b6e86",
  measurementId: "G-Z09VTPYTF3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
