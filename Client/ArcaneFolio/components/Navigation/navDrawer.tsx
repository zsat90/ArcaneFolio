import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList} from '@react-navigation/drawer';
import CharacterSelectScreen from '../../screens/Characters/CharacterSelectScreen';
import LoginScreen from '../../screens/Login_CreateAccount/LoginScreen';
import Header from '../Header' 
import NavBar from './navBar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Drawer = createDrawerNavigator();

const NavDrawer: React.FC = () => {
    // TODO: Add an element that stores the name of the character that has been selected at the top of the drawer
    return (
        <Drawer.Navigator
        screenOptions={({ navigation }) => ({
            header: () => <Header navigation={navigation} />,
        })}
        drawerContent={props => (
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                <DrawerItemList {...props} />
                <View style={styles.logoutContainer}>
                    <DrawerItem
                        label="Logout"
                        icon={({ color }) => <Icon name="logout" color={color} size={24} />}
                        onPress={() => {
                            // TODO: Handle logout action here
                            props.navigation.navigate('Login');
                        }}
                        labelStyle={styles.logoutLabel} 
                    />
                </View>
            </DrawerContentScrollView>
        )}
        
        >
            <Drawer.Screen name="Home" component={NavBar} options={{
                drawerIcon: ({color}) => (
                    <Icon name='home' color={color} size={24} />
                ),
                drawerLabelStyle: {
                    fontSize: 20
                }
            }} />
            <Drawer.Screen name="Characters" component={CharacterSelectScreen} options={{
                drawerIcon: ({color}) => (
                    <Icon name='person' color={color} size={24} />
                ),
                drawerLabelStyle: {
                    fontSize: 20
                }
            }} />
            
            
        </Drawer.Navigator>
    )

}


const styles = StyleSheet.create({
    drawerContent: {
        flex: 1
    },

    logoutContainer: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        flexGrow: 1,
        paddingBottom: 20,
        justifyContent: 'flex-end'
    },
    logoutLabel: {
        fontSize: 20, 
    },
});


export default NavDrawer