import { FirebaseApp, initializeApp, getApps } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    setPersistence,
    updateProfile,
    signOut,
} from 'firebase/auth';
import {
    setActiveAccountFromUser,
} from './accountScope';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
let persistenceInitPromise: Promise<void> | null = null;

export const getFirebaseApp = (): FirebaseApp => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missingKeys.length) {
        throw new Error(`Missing Firebase web config: ${missingKeys.join(', ')}`);
    }

    return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());

let firestoreInstance: Firestore | null = null;

export const getFirebaseFirestore = () => {
    if (!firestoreInstance) {
        firestoreInstance = getFirestore(getFirebaseApp());
        console.log('[firebase] Firestore initialized', {
            projectId: getFirebaseApp().options.projectId,
            authAppName: getFirebaseAuth().app.name,
            firestoreAppName: firestoreInstance.app.name,
            sameFirebaseApp: getFirebaseAuth().app.name === firestoreInstance.app.name,
        });
    }

    return firestoreInstance;
};

export const ensureAuthTokenReady = async () => {
    await ensureAuthPersistence();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return null;
    }

    await currentUser.getIdToken();
    return currentUser.uid;
};

const getAuthErrorCode = (error: unknown) => (
    typeof error === 'object' && error && 'code' in error
        ? String(error.code)
        : 'unknown'
);

const logAuthError = (context: string, error: unknown) => {
    console.error(`[firebase-auth:${context}] code=${getAuthErrorCode(error)}`, error);
};

const ensureAuthPersistence = async () => {
    if (!persistenceInitPromise) {
        const auth = getFirebaseAuth();
        persistenceInitPromise = setPersistence(auth, browserLocalPersistence)
            .catch((error) => {
                persistenceInitPromise = null;
                logAuthError('setPersistence', error);
                throw error;
            });
    }

    await persistenceInitPromise;
};

const shouldUseRedirectGoogleSignIn = () => {
    if (typeof navigator === 'undefined') {
        return false;
    }

    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
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
        case 'auth/popup-blocked':
            return 'Your browser blocked the pop-up. Trying redirect sign-in usually fixes this.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for Firebase sign-in.';
        default:
            return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    }
};

export const login = async (email: string, password: string) => {
    try {
        await ensureAuthPersistence();
        const auth = getFirebaseAuth();
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential;
    } catch (error) {
        logAuthError('login', error);
        throw error;
    }
}


export const signup = async (email: string, password: string, displayName?: string) => {
    try {
        await ensureAuthPersistence();
        const auth = getFirebaseAuth();
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
            await updateProfile(credential.user, { displayName });
        }

        return credential;
    } catch (error) {
        logAuthError('signup', error);
        throw error;
    }
}

export type GoogleSignInResult = 'popup' | 'redirect';

export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    await ensureAuthPersistence();
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (shouldUseRedirectGoogleSignIn()) {
        console.log('[firebase-auth] Google sign-in using redirect');
        await signInWithRedirect(auth, provider);
        return 'redirect';
    }

    try {
        const credential = await signInWithPopup(auth, provider);
        console.log('[firebase-auth] Google sign-in success uid', credential.user.uid);
        return 'popup';
    } catch (error) {
        const code = getAuthErrorCode(error);
        logAuthError('signInWithGoogle-popup', error);

        if (code === 'auth/popup-blocked') {
            console.log('[firebase-auth] Google popup blocked; falling back to redirect');
            await signInWithRedirect(auth, provider);
            return 'redirect';
        }

        throw error;
    }
}

export const handleGoogleRedirectResult = async () => {
    await ensureAuthPersistence();
    const auth = getFirebaseAuth();

    try {
        const result = await getRedirectResult(auth);
        console.log('[firebase-auth] getRedirectResult result', {
            uid: result?.user?.uid ?? null,
            hasResult: Boolean(result),
        });

        if (result?.user) {
            return true;
        }

        return false;
    } catch (error) {
        logAuthError('getRedirectResult', error);
        throw error;
    }
}

export const getIdToken = async () => {
    await ensureAuthPersistence();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    return currentUser ? await currentUser.getIdToken() : null;
  };

export const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setActiveAccountFromUser(null);
};
