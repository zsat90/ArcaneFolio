import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const ImageBackgroundWrapper = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/images/wizard.webp')}
      style={styles.background}
      imageStyle={{ opacity: 0.2 }}
      resizeMode="cover" 
      
    >
      
        {children}
      
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
});

export default ImageBackgroundWrapper;
