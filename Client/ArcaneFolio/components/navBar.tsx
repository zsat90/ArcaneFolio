import React, { useState } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';


const HomeRoute = () => <Text>Home</Text>;
const LoginRoute = () => <Text>Login</Text>;


const Navbar = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', focusedIcon: "home" },
    { key: 'login', title: 'Login', focusedIcon: 'login' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    login: LoginRoute,
  });

  return (
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        
      />
    
    
  );
};

export default Navbar;
