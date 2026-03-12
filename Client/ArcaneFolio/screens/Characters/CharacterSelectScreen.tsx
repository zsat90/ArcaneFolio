import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import ImageBackgroundWrapper from "../../components/imageBackground";
import { Character } from "../../types/characterTypes";
import CharacterItems from "../../components/Characters/CharacterItems";
import Buttons from "../../components/Login/Button";
import { StackNavigationProp } from "@react-navigation/stack";
import globalStyles from '../../styles/styles'
import {useAppSelector, useAppDispatch} from '../../redux/hooks'
import { selectCharacter, fetchUserCharacters } from '../../redux/slices/characterSlice'


type CharacterSelectScreenProps = {
  navigation: StackNavigationProp<any>;
};

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch()

  //Get characters from the Redux state. Uses slice
  const characters = useAppSelector((state) => state.character.characterList)
  

  useEffect(() => {
    dispatch(fetchUserCharacters())
  }, [dispatch]);


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
            <Text style={styles.buttonText}>Add A Character</Text>
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
  buttonText: {
    fontSize: 18
  }

});

export default CharacterSelectScreen;
