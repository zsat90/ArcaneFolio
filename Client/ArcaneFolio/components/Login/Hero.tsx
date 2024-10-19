import React from "react";
import { Image, StyleSheet, View} from 'react-native'


const Hero = () => { 
    return (
        <View>
            <Image source={require('../../assets/images/wizard.webp')} style={styles.image} />
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 400,
        marginBottom: 100,
    }

})


export default Hero;