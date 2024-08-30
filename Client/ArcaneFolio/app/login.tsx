import React from 'react';
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

const Login = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
      <Link href="/home">Go to Home</Link>
    </View>
  );
};

export default Login;

