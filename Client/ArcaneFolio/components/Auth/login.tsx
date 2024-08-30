// src/components/Login.js
import React from 'react';
import { Button, View, Text } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

const Login = ({ onLogin }) => {
  const { authorize } = useAuth0();

  const handleLogin = async () => {
    try {
      await authorize();
      if (onLogin) onLogin(); // Callback for handling post-login navigation
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome! Please log in.</Text>
      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
};

export default Login;
