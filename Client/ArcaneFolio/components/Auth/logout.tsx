// src/components/Logout.js
import React from 'react';
import { Button, View, Text } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

const Logout = ({ onLogout }) => {
  const { clearSession } = useAuth0();

  const handleLogout = async () => {
    try {
      await clearSession();
      if (onLogout) onLogout(); // Callback for handling post-logout navigation
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Are you sure you want to log out?</Text>
      <Button title="Log out" onPress={handleLogout} />
    </View>
  );
};

export default Logout;
