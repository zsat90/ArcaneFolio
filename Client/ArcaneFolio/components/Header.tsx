import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Logo from '../components/Login/Logo'


type HeaderProps = {
    navigation: DrawerNavigationProp<any>; 
}

const Header: React.FC<HeaderProps> = ({ navigation }) => {

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Icon name="menu" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
            <Logo />
            <Text style={styles.headerText}>Arcane Folio</Text>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#231F20',
        opacity: 0.9,
        
    },

    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'

    },

    headerText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Courier'
    },
});

export default Header;
