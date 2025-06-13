// main.js
// firebase-config.js
// Your web app's Firebase configuration

const firebaseConfig = {
apiKey: "AIzaSyAP8Nv5LS_qnspw5InyT3eZisWAbX8dzWQ",
  authDomain: "game-71777.firebaseapp.com",
  databaseURL: "https://game-71777-default-rtdb.firebaseio.com",
  projectId: "game-71777",
  storageBucket: "game-71777.firebasestorage.app",
  messagingSenderId: "217899623657",
  appId: "1:217899623657:web:849307ab5fd7be6c19fc78"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // For storing scores and potentially question data
// const auth = firebase.auth(); // If you need authentication
// script.js (在您的其他程式碼上方或下方)

