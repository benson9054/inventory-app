import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5GDSZwQtMh4s8oEU6oa-Xi0hmcjQj7Ok",
  authDomain: "restaurant-inventory-de15d.firebaseapp.com",
  projectId: "restaurant-inventory-de15d",
  storageBucket: "restaurant-inventory-de15d.firebasestorage.app",
  messagingSenderId: "290873555234",
  appId: "1:290873555234:web:5b7bf97d32f278cc548d7b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);