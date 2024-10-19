import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import TextInput from "../components/TextInput";
import Buttons from "../components/Login/Button";
import {
  handleEmailChange,
  handleNameChange,
  handlePasswordChange,
  handlePasswordMatch,
} from "../utils/LoginAuth";
import globalStyles from "../styles/styles";
import ImageBackgroundWrapper from "../components/imageBackground";

const CreateAccount = ({navigation}) => {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [confirmPassword, setConfirmPassword] = useState({ value: "", error: "" });

  return (
    <ImageBackgroundWrapper>
    <View style={styles.container}>
      <Text style={globalStyles.title}>Create Account</Text>
      <TextInput
        label="Name"
        onChangeText={(text) => handleNameChange(text, setName)}
        errorText={name.error}
      />
      <TextInput
        label="Email"
        onChangeText={(text) => handleEmailChange(text, setEmail)}
        errorText={email.error}
      />

      <TextInput
        label="Password"
        onChangeText={(text) => handlePasswordChange(text, setPassword)}
        errorText={password.error}
      />

      <TextInput
        label="Confirm Password"
        onChangeText={(text) =>
          handlePasswordMatch(password.value, text, setConfirmPassword)
        }
        errorText={confirmPassword.error}
      />
     <View style={styles.buttonContainer}>
        <Buttons mode="contained">Create your account</Buttons>
      </View>

      <Text style={globalStyles.text}>
        Already have an account?{' '}
        <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
          Login
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

  buttonContainer: {
    width: "90%",
    marginTop: 40,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 18,
    textDecorationLine: 'underline',
    color: '#231F20',
  }
});

export default CreateAccount;
