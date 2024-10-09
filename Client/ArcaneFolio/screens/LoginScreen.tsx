import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import TextInput from "../components/TextInput";
import Buttons from "../components/Login/Button";
import {emailValidator, passwordValidator} from '../utils/validator'
import {handleLogin, handleCreateAccount} from '../utils/LoginAuth'


const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Handle email validation and input change
  const handleEmailChange = (text: string) => {
    const error = emailValidator(text)
    setEmail({value: text, error: error})
  }

  // Handle password validation and input change
  const handlePasswordChange = (text: string) => {
    const error = passwordValidator(text)
    setPassword({value: text, error: error})
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arcane Folio</Text>

      <TextInput
        label="Email"
        onChangeText={handleEmailChange}
        errorText={email.error}
      />
      <TextInput
        label="Password"
        onChangeText={handlePasswordChange}
        errorText={password.error}
        secureTextEntry={!showPassword}
        onIconPress={() => setShowPassword(!showPassword)}
        icon={showPassword ? 'eye' : 'eye-off'}
        
      />
      <View style={styles.buttonContainer}>
        <Buttons mode="contained" onPress={() => handleCreateAccount(navigation)}>Create Account</Buttons>
        <Buttons mode="contained" onPress={() => handleLogin(email.value, password.value, navigation, setEmail, setPassword)}>Login</Buttons>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10
  },

  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 150
    
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20
  }
});

export default LoginScreen;
