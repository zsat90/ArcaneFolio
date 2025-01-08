import React from "react";
import { Text } from "react-native";
import globalStyles from "../styles/styles";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { PaperProvider } from "react-native-paper";
import { Provider } from 'react-redux'
import {store} from '../redux/store'
import Toast from "react-native-toast-message";
import LandingPage from "../screens/LandingPage";
import LoginScreen from "../screens/Login_CreateAccount/LoginScreen";
import DashboardScreen from "../screens/DashboardScreens/DashboardScreen";
import CreateAccountScreen from "../screens/Login_CreateAccount/CreateAccountScreen";
import CharacterSelectScreen from "../screens/Characters/CharacterSelectScreen";
import AddCharacterScreen from '../screens/Characters/AddCharacterScreen'
import EditCharacterScreen from '../screens/Characters/EditCharacterScreen'
import SpellDetails from '../screens/Spells/SpellDetail'


const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
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
            name="Characters"
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
            name="AddCharacter"
            component={AddCharacterScreen}
            options={{
              headerStyle: { height: 95 },
              headerTitleAlign: "center",
              headerTitle: () => (
                <Text style={globalStyles.text}></Text>
              ),
            }}
          
          />

          <Stack.Screen
            name="EditCharacter"
            component={EditCharacterScreen}
            options={{
              headerStyle: { height: 95 },
              headerTitleAlign: "center",
              headerTitle: () => (
                <Text style={globalStyles.text}></Text>
              ),
            }}
          
          />

          <Stack.Screen
            name="SpellDetails"
            component={SpellDetails}
            options={{
              headerStyle: { height: 95 },
              headerTitleAlign: "center",
              headerTitle: () => (
                <Text style={globalStyles.text}></Text>
              ),
            }}
          
          />

          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      < Toast />
    </PaperProvider>
    </Provider>
  );
}
