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

const CreateAccount = () => {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [confirmPassword, setConfirmPassword] = useState({ value: "", error: "" });

  return (
    <View style={globalStyles.container}>
      <Text>Create Account</Text>
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

      <Buttons mode="contained">Create your account</Buttons>
    </View>
  );
};

const styles = StyleSheet.create({});

export default CreateAccount;
