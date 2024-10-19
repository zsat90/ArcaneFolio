import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Buttons from "../components/Login/Button";
import { loginPress, handleCreateAccount } from "../utils/LoginAuth";
import globalStyles from "../styles/styles";
import ImageBackgroundWrapper from "@/components/imageBackground";

const LandingPage = ({ navigation }) => {
  return (
    <ImageBackgroundWrapper>
      <View style={styles.container}>
        <Text style={globalStyles.title}>Arcane Folio</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Buttons
              mode="contained"
              icon={"login"}
              onPress={() => loginPress(navigation)}
              style={styles.buttons}
              labelStyle={styles.buttonText}
            >
              Login
            </Buttons>
          </View>
          <View style={styles.buttonWrapper}>
            <Buttons
              mode="contained"
              icon={"account-plus"}
              onPress={() => handleCreateAccount(navigation)}
              style={styles.buttons}
              labelStyle={styles.buttonText}
            >
              Create Account
            </Buttons>
            <Text style={styles.subtitle}>
              Arcane Folio is an Advanced Dungeons & Dragons app for
              spellcasters to quickly access and manage spells from different
              tomes.
            </Text>
          </View>
        </View>
      </View>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  buttonContainer: {
    marginTop: 200,
    width: "100%",
  },

  buttonWrapper: {
    marginBottom: 30,
    width: "100%",
  },
  buttons: {
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    
  },
  subtitle: {
    fontSize: 16,
    marginTop: 290,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "Courier",
  },
});

export default LandingPage;
