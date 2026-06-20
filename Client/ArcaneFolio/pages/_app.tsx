import '../styles/global.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { setActiveAccountFromUser } from '../utils/auth/accountScope';
import { getFirebaseAuth, handleGoogleRedirectResult } from '../utils/auth/authService';
import { clearSessionCharacterState } from '../utils/character/characterState';
import { runFirestoreMigrationIfNeeded } from '../utils/firestore/migrateLocalStorage';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const previousUidRef = useRef<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const completeGoogleRedirect = async () => {
      try {
        const hasRedirectResult = await handleGoogleRedirectResult();

        if (!isActive || !hasRedirectResult) {
          return;
        }

        if (router.pathname === '/login' || router.pathname === '/create-account') {
          router.replace('/characters');
        }
      } catch (error) {
        console.error('[firebase-auth:app-redirect] Failed to resolve redirect result.', error);
      }
    };

    completeGoogleRedirect();

    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid ?? null;
      const previousUid = previousUidRef.current;

      if (previousUid !== null && previousUid !== nextUid) {
        clearSessionCharacterState();
      }

      setActiveAccountFromUser(user);

      if (!user) {
        clearSessionCharacterState();
      } else {
        void runFirestoreMigrationIfNeeded(user.uid);
      }

      previousUidRef.current = nextUid;
    });

    return () => unsubscribe();
  }, []);

  return <Component {...pageProps} />;
}
