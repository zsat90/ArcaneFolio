import React from 'react';
import {Stack} from 'expo-router';



export default function App() {
  return (

    <Stack>
      <Stack.Screen name="home"/>
      <Stack.Screen name="login"/>
    </Stack>
   
  );
}


