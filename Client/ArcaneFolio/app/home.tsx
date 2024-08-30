import React from "react";
import { View, Text, Button } from "react-native";
import { PaperProvider } from "react-native-paper";
import NavBar from "../components/Nav/navBar";

const Home = () => {
  return (
    <PaperProvider>
      <View>
        <NavBar />
      </View>
    </PaperProvider>
  );
};

export default Home;
