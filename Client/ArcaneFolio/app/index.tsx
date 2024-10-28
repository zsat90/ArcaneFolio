import React from "react";
import { Text } from "react-native";
import globalStyles from "../styles/styles";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { PaperProvider } from "react-native-paper";
import LandingPage from "../screens/LandingPage";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import CharacterSelectScreen from "../screens/CharacterSelectScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen
            name="Landing"
            component={LandingPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CharacterSelection"
            component={CharacterSelectScreen}
            options={{
              headerStyle: { height: 95 },
              headerTitleAlign: "center",
              headerTitle: () => (
                <Text style={globalStyles.text}>Characters</Text>
              ),
            }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
