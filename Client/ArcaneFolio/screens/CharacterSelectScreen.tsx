import React, {useState} from 'react';
import { View, StyleSheet, Text, FlatList, Button } from 'react-native';
import ImageBackgroundWrapper from '../components/imageBackground';
import { Character } from '../types/characterTypes';
import CharacterItems from '../components/Characters/CharacterItems';
import Buttons from '../components/Login/Button';
import { StackNavigationProp } from '@react-navigation/stack';

type CharacterSelectScreenProps = {
    navigation: StackNavigationProp<any>;
  };


const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({navigation }) => {
    const [characters, setCharacters] = useState<Character[]>([
        { id: 1, name: 'Gandalf', class: 'Wizard' },
        { id: 2, name: 'Frodo', class: 'Rogue' },
        { id: 3, name: 'Aragorn', class: 'Fighter' },
    ]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);


    return (
        <ImageBackgroundWrapper>
        <View style={styles.container}>
            <FlatList 
                data={characters} 
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <CharacterItems 
                        item={item} 
                        navigation={navigation}
                        setSelectedCharacter={setSelectedCharacter}
                    />
                )}
                
            />
            <View style={styles.buttonContainer}>
                <Buttons 
                    mode='contained'
                    onPress={() => console.log('Add Character')}
                    >Add Character
                </Buttons>
            </View>
        </View>
        </ImageBackgroundWrapper>
    )


};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        padding: 10
    },

    buttonContainer: {
        marginBottom: 50,
          
    },
    

});


export default CharacterSelectScreen