import React from "react";
import { PaperProvider } from "react-native-paper";
import NavBar from "../components/Nav/navBar";

export default function App() {
  return (
    <PaperProvider>
      <NavBar />
    </PaperProvider>
  );
}

