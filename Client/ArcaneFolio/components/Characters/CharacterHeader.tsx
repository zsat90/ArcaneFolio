import React from "react";
import { View, Text, StyleSheet } from 'react-native';



type HeaderWithCharacterProps = {
    characterName: string;
    magicPoints: number
  };

const CharacterHeader: React.FC<HeaderWithCharacterProps> = ({characterName, magicPoints}) => {

    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{characterName}</Text>
            <Text style={styles.text}>Magic Points: {magicPoints}</Text>
        </View>
    )
}

const styles = StyleSheet.create({ 
    headerContainer: {
        padding: 10,
        backgroundColor: '#231F20',
        flexDirection: 'row',
        justifyContent: 'space-between'
      },
      headerText: {
        fontSize: 20,
        color: 'white',
      },
      text: {
        fontSize: 20,
        color: 'white',
      }

})

export default CharacterHeader