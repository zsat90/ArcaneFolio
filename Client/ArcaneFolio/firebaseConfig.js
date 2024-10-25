import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBTlhBsnTaq-3nGyOWMsZlEhj7h9rj_BTc",
    authDomain: "arcane-folio.firebaseapp.com",
    projectId: "arcane-folio",
    storageBucket: "arcane-folio.appspot.com",
    messagingSenderId: "521683196207",
    appId: "1:521683196207:web:7ae488a4354785c7bae9da",
    measurementId: "G-GTFJBJW4HG"

}

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export {auth}