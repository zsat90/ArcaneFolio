import {
  emailValidator,
  passwordValidator,
  nameValidator,
  checkPasswordMatch,
} from "../Validation/validator";
import API_ENDPOINTS from "../apiConfig";
import axiosInstance from "../axiosInstance";
import * as SecureStore from "expo-secure-store";
import { LoginParams, RegisterParams } from "../auth/authTypes";

// Handle password and confirm password
export const handlePasswordMatch = (
  password: string,
  confirmPassword: string,
  setConfirmPassword: any
) => {
  const error = checkPasswordMatch(password, confirmPassword);
  setConfirmPassword({ value: confirmPassword, error: error });
};

// Handle login press(send request to backend, check errors, handle action)
export const handleLogin = async (loginParams: LoginParams) => {
  const { email, password, setEmail, setPassword, setToken, navigation } =
    loginParams;

  const emailError = emailValidator(email);
  const passwordError = passwordValidator(password);

  if (emailError || passwordError) {
    setEmail((prev) => ({ ...prev, error: emailError }));
    setPassword((prev) => ({ ...prev, error: passwordError }));
    return;
  }

  try {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
      email: email.toLowerCase(),
      password,
    });

    const token = response.data.accessToken;

    await SecureStore.setItemAsync("token", token);

    setToken(token);

    navigation.navigate("Characters");
  } catch (err) {
    console.error("Login error", err);
  }
};

// Handle register request
export const handleRegister = async (registerParams: RegisterParams) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setToken,
    navigation,
  } = registerParams;

  const nameError = nameValidator(name);
  const emailError = emailValidator(email);
  const passwordError = passwordValidator(password);
  const checkPasswordError = checkPasswordMatch(password, confirmPassword);

  if (nameError || emailError || passwordError || checkPasswordError) {
    setName((prev) => ({ ...prev, error: nameError }));
    setEmail((prev) => ({ ...prev, error: emailError }));
    setPassword((prev) => ({ ...prev, error: passwordError }));
    setConfirmPassword((prev) => ({ ...prev, error: checkPasswordError }));
    return;
  }

  try {
    const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, {
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = response.data.accessToken;

    setToken(token);

    navigation.navigate("Characters");
  } catch (err) {
    console.error("register error", err);
  }
};

// Handle login press
export const loginPress = (navigation: any) => {
  navigation.navigate("Login");
};

// Handle Create Account press
export const handleCreateAccount = (navigation: any) => {
  navigation.navigate("CreateAccount");
};
