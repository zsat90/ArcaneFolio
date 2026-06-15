import { initializeApp, getApps } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const getFirebaseAuth = () => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missingKeys.length) {
        throw new Error(`Missing Firebase web config: ${missingKeys.join(', ')}`);
    }

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    return getAuth(app);
};

export const getAuthErrorMessage = (error: unknown) => {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

    switch (code) {
        case 'auth/email-already-in-use':
            return 'That email is already registered.';
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Email or password is incorrect.';
        case 'auth/popup-closed-by-user':
            return 'Google sign-in was closed before it finished.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for Firebase sign-in.';
        default:
            return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    }
};

export const login = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    return signInWithEmailAndPassword(auth, email, password);
}


export const signup = async (email: string, password: string, displayName?: string) => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
        await updateProfile(credential.user, { displayName });
    }

    return credential;
}

export const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
}

export const getIdToken = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    return currentUser ? await currentUser.getIdToken() : null;
  };

export const logout = async () => {
    const auth = getFirebaseAuth();
    return signOut(auth);
};
