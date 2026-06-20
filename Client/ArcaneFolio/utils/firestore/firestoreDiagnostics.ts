import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from '../auth/authService';

export const EXPECTED_FIREBASE_PROJECT_ID = 'arcane-folio';

export const getConfiguredFirebaseProjectId = () => (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || getFirebaseApp().options.projectId || 'unknown'
);

export const getFirestoreErrorDetails = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error
    ? String(error.code)
    : 'unknown';
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : 'Unknown error';

  return { code, message };
};

export const logFirestoreDiagnostics = (context: string, details: Record<string, unknown> = {}) => {
  const projectId = getConfiguredFirebaseProjectId();
  const uid = getFirebaseAuth().currentUser?.uid ?? null;
  const authAppName = getFirebaseAuth().app.name;
  const firestoreAppName = getFirebaseFirestore().app.name;

  console.log(`[firestore:${context}]`, {
    projectId,
    expectedProjectId: EXPECTED_FIREBASE_PROJECT_ID,
    projectIdMatches: projectId === EXPECTED_FIREBASE_PROJECT_ID,
    uid,
    authAppName,
    firestoreAppName,
    sameFirebaseApp: authAppName === firestoreAppName,
    ...details,
  });

  if (projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
    console.warn(
      `[firestore:${context}] Firebase project id "${projectId}" does not match expected "${EXPECTED_FIREBASE_PROJECT_ID}".`,
    );
  }
};

export const logFirestoreError = (context: string, error: unknown, details: Record<string, unknown> = {}) => {
  const { code, message } = getFirestoreErrorDetails(error);

  console.error(`[firestore:${context}] error code=${code} message=${message}`, {
    ...details,
    error,
  });
};

export const toFirestoreUserError = (error: unknown, action: string) => {
  const { code, message } = getFirestoreErrorDetails(error);

  if (message.includes('Saving took too long') || message.includes('Loading characters took too long')) {
    return message;
  }

  if (code === 'permission-denied') {
    return `Firestore denied ${action}. Deploy firestore.rules for project ${EXPECTED_FIREBASE_PROJECT_ID}.`;
  }

  return `Failed to ${action}: ${message}`;
};
