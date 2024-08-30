import React, { useState, useEffect } from 'react';
import { Auth0Provider } from 'react-native-auth0';
import * as SecureStore from 'expo-secure-store';

const AuthProvider = ({ children }) => {
  const [auth0Config, setAuth0Config] = useState({ domain: '', clientId: '' });

  useEffect(() => {
    const loadAuthConfig = async () => {
      const domain = await SecureStore.getItemAsync('auth0Domain');
      const clientId = await SecureStore.getItemAsync('auth0ClientId');
      if (domain && clientId) {
        setAuth0Config({ domain, clientId });
      } else {
        console.error('Failed to load Auth0 configuration');
      }
    };

    loadAuthConfig();
  }, []);

  if (!auth0Config.domain || !auth0Config.clientId) {
    return null; 
  }

  return (
    <Auth0Provider domain={auth0Config.domain} clientId={auth0Config.clientId}>
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
