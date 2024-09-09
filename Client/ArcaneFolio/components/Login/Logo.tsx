import React from 'react'
import { Image, StyleSheet, Text} from 'react-native'



const Logo = () => {
    return (
        <Text>
            <Image source={require('../../assets/images/spellbook.jpg')} style={styles.image} />
        </Text>
    )
}


const styles = StyleSheet.create({
    image: {
        width: 300,
        height: 300,
        marginBottom: 200,
    }


})


export default Logo