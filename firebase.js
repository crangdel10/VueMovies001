import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCqgZWxdiCym-Gl9H7__JYdDEvVzDYMqjw',
    authDomain: 'login-history-7dab8.firebaseapp.com',
    projectId: 'login-history-7dab8',
    storageBucket: 'login-history-7dab8.appspot.com',
    messagingSenderId: '327702011476',
    appId: '1:327702011476:web:3f9454f4e7c130698897c1'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 