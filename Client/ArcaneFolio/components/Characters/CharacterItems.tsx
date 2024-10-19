import React from "react";
import { View, StyleSheet, Text, Button } from "react-native";
import {handleCharacterSelect} from '../../utils/character/CharacterActions'

const CharacterItem = ({ item, navigation, setSelectedCharacter }) => {
  return (
    
    <View style={styles.characterItem}>
      <View style={styles.textContainer}>
        <Text style={styles.characterName}>{item.name}</Text>
        <Text style={styles.characterClass}>{item.class}</Text>
      </View>
      <Button title="Select" onPress={() => handleCharacterSelect(item, navigation, setSelectedCharacter)} />
    </View>
    
  );
};

const styles = StyleSheet.create({
  characterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 15,
    marginTop: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    paddingRight: 10,
    marginTop: 5,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  characterClass: {
    fontSize: 14,
    color: "gray",
  },
});

export default CharacterItem;
