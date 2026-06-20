import { ensureAuthTokenReady } from '../auth/authService';
import {
  getFirestoreErrorDetails,
  logFirestoreDiagnostics,
  logFirestoreError,
  toFirestoreUserError,
} from './firestoreDiagnostics';

export const FIRESTORE_TIMEOUT_MS = 10000;

export const sanitizeForFirestore = <T extends Record<string, unknown>>(value: T) => (
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T
);

export const withFirestoreTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timeoutId: number | null = null;
  let settled = false;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      if (!settled) {
        reject(new Error(message));
      }
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]) as T;
    settled = true;
    return result;
  } catch (error) {
    settled = true;
    promise.catch((lateError) => {
      logFirestoreError('timeout-late-failure', lateError);
    });
    throw error;
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
};

export const requireOwnerId = async () => {
  const ownerId = await ensureAuthTokenReady();

  if (!ownerId) {
    throw new Error('You must be logged in to access Firestore.');
  }

  return ownerId;
};

export const runFirestoreOperation = async <T,>(
  context: string,
  documentPath: string,
  operation: string,
  action: string,
  runner: () => Promise<T>,
  details: Record<string, unknown> = {},
): Promise<T> => {
  logFirestoreDiagnostics(`before-${context}`, { documentPath, operation, ...details });

  try {
    const result = await runner();
    logFirestoreDiagnostics(`after-${context}`, { documentPath, operation, success: true, ...details });
    return result;
  } catch (error) {
    const { code, message } = getFirestoreErrorDetails(error);
    logFirestoreError(`${context}-failed`, error, { documentPath, operation, code, message, ...details });
    throw new Error(toFirestoreUserError(error, action));
  }
};
