import React from "react";
import { View, Text, StyleSheet } from 'react-native';

type HeaderWithCharacterProps = {
    characterName: string;
  };

const CharacterHeader: React.FC<HeaderWithCharacterProps> = ({characterName}) => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{characterName}</Text>
        </View>
    )
}

const styles = StyleSheet.create({ 
    headerContainer: {
        padding: 10,
        backgroundColor: '#231F20',
      },
      headerText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
      },

})

export default CharacterHeader