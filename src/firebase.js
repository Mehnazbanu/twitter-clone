import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc, orderBy, query, getDoc, doc, getDocs, serverTimestamp, updateDoc, setDoc, deleteDoc, where} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2uzLOOHReD0O5MJJ-sPkpeIwF4CZHQ_c",
  authDomain: "twit-75446.firebaseapp.com",
  projectId: "twit-75446",
  storageBucket: "twit-75446.appspot.com",
  messagingSenderId: "1063251428144",
  appId: "1:1063251428144:web:b348749d88bf0663c1bef5",
  measurementId: "G-5E8JXM4GY5"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, storage, collection, addDoc, orderBy, query, createUserWithEmailAndPassword, signInWithEmailAndPassword,auth,getDoc, doc, getDocs, serverTimestamp, updateDoc, setDoc, deleteDoc, where};