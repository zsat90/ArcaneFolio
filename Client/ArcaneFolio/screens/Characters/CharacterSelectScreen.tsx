import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import ImageBackgroundWrapper from "../../components/imageBackground";
import { Character } from "../../types/characterTypes";
import CharacterItems from "../../components/Characters/CharacterItems";
import Buttons from "../../components/Login/Button";
import { StackNavigationProp } from "@react-navigation/stack";
import { fetchUserCharacters } from "../../utils/Character/characterService";
import globalStyles from '../../styles/styles'
import { useCharacterContext } from "@/components/Characters/CharacterContext";
import {handleCharacterSelect} from '../../utils/Character/CharacterActions'


type CharacterSelectScreenProps = {
  navigation: StackNavigationProp<any>;
};

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  navigation,
}) => {
  const [characters, setCharacters] = useState<Character[]>();
  const {selectCharacter} = useCharacterContext()
  

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const charactersData = await fetchUserCharacters();
        setCharacters(charactersData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCharacters();
  }, []);

  return (
    <ImageBackgroundWrapper>
      <View style={styles.container}>
        {characters && characters.length > 0 ? (
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CharacterItems
                item={item}
                navigation={navigation}
                handleCharacterSelect={handleCharacterSelect}
                setSelectedCharacter={selectCharacter}
              />
            )}
          />
        ) : (
          <Text style={globalStyles.text}>No characters found. Please add a character to continue.</Text>
        )}

        <View style={styles.buttonContainer}>
          <Buttons
            mode="contained"
            onPress={() => navigation.navigate("AddCharacter")}
          >
            Add A Character
          </Buttons>
        </View>
      </View>
    </ImageBackgroundWrapper>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 10,
  },

  buttonContainer: {
    marginBottom: 50,
    marginTop: 50
  },

});

export default CharacterSelectScreen;
