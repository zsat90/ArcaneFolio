// AppNavigator.js
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth0 } from "react-native-auth0";
import Login from "../components/Auth/login";
// import Navbar from "./Navbar";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth0(); // Get the authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={Navbar} />
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <Login {...props} onLogin={() => setIsAuthenticated(true)} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
