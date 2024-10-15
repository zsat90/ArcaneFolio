import React from "react";
import { View, StyleSheet } from "react-native";
import Buttons from "../components/Login/Button";
import { loginPress, handleCreateAccount } from "../utils/LoginAuth";

const LandingPage = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonWrapper}>
                <Buttons 
                    mode="contained"
                    icon={'login'}
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
                    icon={'account-plus'}
                    onPress={() => handleCreateAccount(navigation)} 
                    style={styles.buttons}
                    labelStyle={styles.buttonText}
                >
                    Create Account
                </Buttons>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',   
        paddingHorizontal: 20,
        marginTop: 200,
    },
    buttonWrapper: {
        width: '100%',   
        marginBottom: 25, 
    },
    buttons: {
        width: '100%',  
        paddingVertical: 12, 
        borderRadius: 5, 
    },
    buttonText: {
        fontSize: 18, 
        lineHeight: 21, 
    },
});

export default LandingPage;
