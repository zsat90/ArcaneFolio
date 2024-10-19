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
import ImageBackgroundWrapper from "../components/imageBackground";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (

    <ImageBackgroundWrapper>
    
    <View style={styles.container}>
     
      <Text style={globalStyles.title}> Login </Text>
      

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
      <Text style={globalStyles.text}>Forgot Password?</Text>
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

      <Text style={globalStyles.text}>
        Don't have an account?{' '}
        <Text style={styles.registerText} onPress={() => handleCreateAccount(navigation)}>
          Register
        </Text>
      </Text>
    </View>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
    alignItems: 'center',
  },
  
  loginText: {
    fontSize: 35,
    marginBottom: 20,
  },

  registerText: { 
    fontSize: 18,
    textDecorationLine: 'underline',
    color: '#231F20',
    
  },

  buttonContainer: {
    width: "90%",
    marginTop: 40,
    marginBottom: 20,
  },
});

export default LoginScreen;
