const ACTIVE_ACCOUNT_KEY = 'arcane:active-account';
const DEFAULT_ACCOUNT_SCOPE = 'guest';

type AccountUser = {
  uid?: string | null;
  email?: string | null;
};

const normalizeScopeValue = (value: string) => (
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, '-')
);

export const getActiveAccountScope = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNT_SCOPE;
  }

  const storedScope = window.localStorage.getItem(ACTIVE_ACCOUNT_KEY) || '';
  const normalizedScope = normalizeScopeValue(storedScope);

  return normalizedScope || DEFAULT_ACCOUNT_SCOPE;
};

export const setActiveAccountScope = (scope: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedScope = normalizeScopeValue(scope);
  window.localStorage.setItem(
    ACTIVE_ACCOUNT_KEY,
    normalizedScope || DEFAULT_ACCOUNT_SCOPE,
  );
};

export const setActiveAccountFromEmail = (email: string) => {
  const normalizedEmail = normalizeScopeValue(email);
  setActiveAccountScope(normalizedEmail ? `email:${normalizedEmail}` : DEFAULT_ACCOUNT_SCOPE);
};

export const setActiveAccountFromUser = (user?: AccountUser | null) => {
  if (!user) {
    setActiveAccountScope(DEFAULT_ACCOUNT_SCOPE);
    return;
  }

  const uid = normalizeScopeValue(user.uid || '');

  if (uid) {
    setActiveAccountScope(`uid:${uid}`);
    return;
  }

  setActiveAccountFromEmail(user.email || '');
};

export const clearActiveAccountScope = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
};

export const getScopedStorageKey = (baseKey: string) => (
  `${baseKey}:${getActiveAccountScope()}`
);
