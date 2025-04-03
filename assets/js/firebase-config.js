// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkOTgs1dBW2lav5hOJldvGkVPjciaqCNk",
    authDomain: "the-arc-website-956df.firebaseapp.com",
    projectId: "the-arc-website-956df",
    storageBucket: "the-arc-website-956df.firebasestorage.app",
    messagingSenderId: "458743555136",
    appId: "1:458743555136:web:cddf01d6ef439b85f1eba5",
    measurementId: "G-53TBHD6Z4B"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined') {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized from firebase-config.js");
    } else {
        console.log("Firebase already initialized");
    }
} else {
    console.error("Firebase SDK not loaded. Make sure to include Firebase scripts before this file.");
} 