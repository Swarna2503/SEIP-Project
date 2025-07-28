// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// ADD FOR AUTHENTICATION
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNR5jON-L4i2NnUIf4Hb_hY9-7z92oCHo",
  authDomain: "dmv-agent-ai.firebaseapp.com",
  projectId: "dmv-agent-ai",
  storageBucket: "dmv-agent-ai.firebasestorage.app",
  messagingSenderId: "622112066084",
  appId: "1:622112066084:web:f22c1c889beba188b226b1",
  measurementId: "G-BV7X3HJQMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// ADD Auth module
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };