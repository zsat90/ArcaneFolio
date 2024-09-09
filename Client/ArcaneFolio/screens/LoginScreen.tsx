import React from "react";
import { View, StyleSheet } from "react-native";
import Logo from "../components/Login/Logo";


const LoginScreen = () => {
    return (
        <View style={styles.container}> 
            <Logo />
        </View> 
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default LoginScreen;