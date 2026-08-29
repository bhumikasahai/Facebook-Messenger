// src/firebase.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBXWMJUoibEKDE4G1iOsQKR1rxck70k65g",
  authDomain: "facebook-messenger-clone-d509d.firebaseapp.com",
  projectId: "facebook-messenger-clone-d509d",
  storageBucket: "facebook-messenger-clone-d509d.firebasestorage.app",
  messagingSenderId: "1028925554144",
  appId: "YOUR_EXISTING_APP_ID",
  measurementId: "YOUR_EXISTING_MEASUREMENT_ID"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

export { auth };
export default db;