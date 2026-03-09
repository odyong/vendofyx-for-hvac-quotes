import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA62y1mDaxyTNb43LhE9Zxcd8eLipp5Hu4",
  authDomain: "vendofyx-hvac.firebaseapp.com",
  projectId: "vendofyx-hvac",
  storageBucket: "vendofyx-hvac.firebasestorage.app",
  messagingSenderId: "196974476378",
  appId: "1:196974476378:web:13e958e3e364ccc321ac63"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use initializeFirestore with long-polling to avoid WebSocket issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();
