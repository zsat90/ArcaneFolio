import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CharacterSelectScreen from '../../screens/CharacterSelectScreen';
import LoginScreen from '../../screens/LoginScreen';
import Header from '../Header' 
import NavBar from './navBar';

const Drawer = createDrawerNavigator();

const NavDrawer: React.FC = () => {
    return (
        <Drawer.Navigator
        screenOptions={({ route, navigation }) => ({
            header: () => <Header title={route.name} navigation={navigation} />,
        })}
        
        >
            <Drawer.Screen name="Dashboard" component={NavBar} />
            <Drawer.Screen name="Characters" component={CharacterSelectScreen} />
            <Drawer.Screen name="Logout" component={LoginScreen} />
            
        </Drawer.Navigator>
    )

}


export default NavDrawer