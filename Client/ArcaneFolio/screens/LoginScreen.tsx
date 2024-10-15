import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import TextInput from "../components/TextInput";
import Buttons from "../components/Login/Button";
import {
  handleLogin,
  handleCreateAccount,
  handleEmailChange,
  handlePasswordChange,
} from "../utils/LoginAuth";
import globalStyles from "../styles/styles";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    
    <View style={globalStyles.container}>
      {/* <Text style={styles.title}>Arcane Folio</Text> */}
      <Text style={styles.loginText}> Login </Text>
      <Text>
        Don't have an account?{' '}
        <Text style={styles.registerText} onPress={() => handleCreateAccount(navigation)}>
          Register
        </Text>
      </Text>

      <TextInput
        label="Email"
        onChangeText={(text) => handleEmailChange(text, setEmail)}
        errorText={email.error}
      />
      <TextInput
        label="Password"
        onChangeText={(text) => handlePasswordChange(text, setPassword)}
        errorText={password.error}
        secureTextEntry={!showPassword}
        onIconPress={() => setShowPassword(!showPassword)}
        icon={showPassword ? "eye" : "eye-off"}
      />
      
      {/* TODO add Forgot Password functionality */} 
      <Text>Forgot Password?</Text>
      <View style={styles.buttonContainer}>
        
        <Buttons
          mode="contained"
          onPress={() =>
            handleLogin(
              email.value,
              password.value,
              navigation,
              setEmail,
              setPassword
            )
          }
        >Login
        </Buttons>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 150,
  },

  loginText: {
    fontSize: 35,
    marginBottom: 20,
  },

  registerText: { 
    fontSize: 18,
    textDecorationLine: 'underline',
    
  },

  buttonContainer: {
    width: "80%",
    marginTop: 40,
  },
});

export default LoginScreen;
