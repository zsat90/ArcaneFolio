import '../styles/global.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { setActiveAccountFromUser } from '../utils/auth/accountScope';
import { getFirebaseAuth } from '../utils/auth/authService';
import { clearSessionCharacterState } from '../utils/character/characterState';
import { runFirestoreMigrationIfNeeded } from '../utils/firestore/migrateLocalStorage';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const previousUidRef = useRef<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('[firebase-auth:app-state]', {
      authLoading,
      currentUser: currentUser?.uid ?? null,
      route: router.pathname,
    });
  }, [authLoading, currentUser, router.pathname]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid ?? null;
      const previousUid = previousUidRef.current;
      const routeBeforeNavigation = router.pathname;

      console.log('[firebase-auth:onAuthStateChanged] fired', {
        uid: nextUid,
        routeBeforeNavigation,
      });

      if (previousUid !== null && previousUid !== nextUid) {
        clearSessionCharacterState();
      }

      setCurrentUser(user);
      setAuthLoading(false);
      setActiveAccountFromUser(user);
      console.log('[firebase-auth:onAuthStateChanged] auth state updated', {
        authLoading: false,
        currentUser: nextUid,
      });

      if (!user) {
        clearSessionCharacterState();
        if (router.pathname !== '/login' && router.pathname !== '/create-account') {
          console.log('[firebase-auth:onAuthStateChanged] navigating to login', {
            routeBeforeNavigation,
          });
          void router.replace('/login').then(() => {
            console.log('[firebase-auth:onAuthStateChanged] route after navigation', '/login');
          });
        }
      } else {
        void runFirestoreMigrationIfNeeded(user.uid);
        if (router.pathname === '/login' || router.pathname === '/create-account') {
          console.log('[firebase-auth:onAuthStateChanged] navigating to characters', {
            uid: user.uid,
            routeBeforeNavigation,
          });
          void router.replace('/characters').then(() => {
            console.log('[firebase-auth:onAuthStateChanged] route after navigation', '/characters');
          });
        }
      }

      previousUidRef.current = nextUid;
    });

    return () => unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}
