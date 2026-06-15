const DEFAULT_API_URL = '/api';

export const getApiUrl = () => {
  return DEFAULT_API_URL;
};

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${getApiUrl()}${normalizedPath}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};
