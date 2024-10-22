import React from 'react'
import { Image, StyleSheet, Text} from 'react-native'



const Logo = () => {
    return (
        <Text style={styles.container}>
            <Image source={require('../../assets/images/spellbook.jpg')} style={styles.image} />
        </Text>
    )
}


const styles = StyleSheet.create({
    container: {
       
        
        
    },
    image: {
        width: 60,
        height: 60,
        
        
    }


})


export default Logo