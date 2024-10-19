import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SpellScreen from '../../screens/DashboardScreens/SpellsScreen';
import SpellBookScreen from '../../screens/DashboardScreens/SpellBookScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



const Tab = createBottomTabNavigator();



const Navbar = () => {
  
  return (
    <Tab.Navigator
    screenOptions={{
      tabBarStyle: { height: 85, backgroundColor: '#231F20', opacity: 0.9, paddingTop: 5},
      tabBarLabelStyle: { fontSize: 18, color: '#F6E8EA'},
      headerShown: false,
    }}
    >
      
      <Tab.Screen name="Spells" component={SpellScreen} 
      options={{
        tabBarIcon: () => (
          <Icon name="library-books" color= {'#A9FFF7'} size={25} padding={5} />
        ),
      }}/>
      
      <Tab.Screen name="Spell Book" component={SpellBookScreen} options={{
        tabBarIcon: () => (
          <Icon name="book" color= {'#A9FFF7'} size={25} />
        ),
      }}/>

      
      
    </Tab.Navigator>
    
  );
};



export default Navbar;
