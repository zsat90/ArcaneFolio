import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';

type HeaderProps = {
    title: string;
    navigation: DrawerNavigationProp<any>; 
}

const Header: React.FC<HeaderProps> = ({ title, navigation }) => {
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Icon name="menu" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#231F20',
        opacity: 0.9,
    },
    headerText: {
        flex: 1,
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
    },
});

export default Header;
