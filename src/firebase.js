// src/firebase.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseApp = firebase.initializeApp({
      apiKey: "AIzaSyBXWMJUoibEKDE4G1iOsQKR1rxck70k65g",
      authDomain: "facebook-messenger-clone-d509d.firebaseapp.com",
      projectId: "facebook-messenger-clone-d509d",
      storageBucket: "facebook-messenger-clone-d509d.firebasestorage.app",
      messagingSenderId: "1028925554144",
      appId: "1:1028925554144:web:a74d115ff4f795ad4a3f85",
      measurementId: "G-CGMCF8KX4G"
});

const db = firebaseApp.firestore();

export default db;
