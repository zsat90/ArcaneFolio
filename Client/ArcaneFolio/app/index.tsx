import React from "react";
import { PaperProvider } from "react-native-paper";
import LandingScreen from '../screens/LandingScreen';

export default function App() {
  return (
    <PaperProvider>
      <LandingScreen />
    </PaperProvider>
  );
}

