import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5oIW9gZQ-dOJpdnOlGU8rfJNHtQYOrtg",
  authDomain: "students-c4093.firebaseapp.com",
  projectId: "students-c4093",
  storageBucket: "students-c4093.appspot.com",
  messagingSenderId: "694439696959",
  appId: "1:694439696959:web:01d49d28c8f59cc099768a",
  measurementId: "G-YPQEEE90FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
