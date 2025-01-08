import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ImageBackgroundWrapper from "../../components/imageBackground";
import TextInput from "../../components/TextInput";
import {
  handleNameChange,
  handleMagicPointChange,
} from "../../utils/Validation/userInputs";
import { Dropdown } from "react-native-element-dropdown";
import Buttons from "../../components/Login/Button";
import globalStyles from "../../styles/styles";
import { ScrollView } from "react-native-gesture-handler";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { editCharacter } from "@/redux/slices/characterSlice";

type EditCharacterScreenProps = {
  navigation: StackNavigationProp<any>;
};

const EditCharacter: React.FC<EditCharacterScreenProps> = ({ navigation }) => {
  // level array
  const levels = [
    { label: "1st", value: 1 },
    { label: "2nd", value: 2 },
    { label: "3rd", value: 3 },
    { label: "4th", value: 4 },
    { label: "5th", value: 5 },
    { label: "6th", value: 6 },
    { label: "7th", value: 7 },
    { label: "8th", value: 8 },
    { label: "9th", value: 9 },
  ];

  const selectedCharacter = useAppSelector((state) => state.character.selectedCharacter)
  const dispatch = useAppDispatch()

  // States
  const [name, setName] = useState({
    value: selectedCharacter?.name || "",
    error: "",
  });
  const [magicPoints, setMagicPoints] = useState<{
    value: number;
    error: string;
  }>({ 
    value: selectedCharacter?.magicPoints ?? 0,
    error: ''
  })
  const [level, setLevel] = useState<{ label: string; value: number } | null>(
    selectedCharacter ? levels.find((lvl) => lvl.value === selectedCharacter.level) : null
  );
  const [characterClass, setCharacterClass] = useState<{
    value: string;
    error: string;
  }>({
    value: selectedCharacter?.characterClass,
    error: "",
  });

  const handleEditSave = () => {
    const updatedCharacter = {
      characterId: selectedCharacter.id,
      characterParams: {
        name: name.value,
        magicPoints: magicPoints.value,
        level: level?.value || 1,
        characterClass: characterClass.value,
      },
    };

    dispatch(editCharacter(updatedCharacter))
    navigation.navigate('Dashboard', {selectedCharacter: updatedCharacter})

  }

  if (!selectedCharacter) {
    return <Text>Loading...</Text>;
  }

  return (
    <ImageBackgroundWrapper>
      <Text style={globalStyles.title}>Edit Character</Text>
      <ScrollView contentContainerStyle={styles.ScrollViewcontainer}>
    
        <View style={styles.nameContainer}>
          <TextInput
            label="Character Name"
            value={name.value}
            onChangeText={(text) => handleNameChange(text, setName)}
            errorText={name.error}
            style={styles.input}
          />
        </View>

        <View style={styles.mpLevelContainer}>
          <View style={styles.mpContainer}>
            <TextInput
              label="MP"
              keyboardType="numeric"
              value={magicPoints.value ? magicPoints.value.toString() : ''}
              onChangeText={(text) =>
                handleMagicPointChange(text, setMagicPoints)
              }
              errorText={name.error}
              style={styles.magicPointsInput}
            />

            <View style={styles.dropdownContainer}>
              <Dropdown
                style={styles.dropdown}
                data={levels}
                labelField="label"
                valueField="value"
                placeholder="Level"
                value={level || { label: "1st", value: 1 }}
                onChange={(item) => setLevel(item)}
              />
            </View>
          </View>
        </View>
        

        <View style={styles.buttonContainer}>
          <Buttons
            mode="contained"
            onPress={handleEditSave} 
          >
            <Text style={styles.saveText}>Save</Text>
          </Buttons>
        </View>
      </ScrollView>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  ScrollViewcontainer: {
    flexGrow: 1,
    padding: 10,
    width: "100%",
    height: '100%',
  },

  nameContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  input: {
    width: "100%",
    marginRight: 10,
  },

  mpLevelContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },

  mpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '70%'
  },

  magicPointsInput: {
    width: '50%',
  },

  dropdownContainer: {
    width: '50%',
    height: 50,
    marginTop: 5
  },

  dropdown: {
    flex: 1,
    height: 50,
    borderColor: "black",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F1F1F1",
  },

  saveText: {
    fontSize: 18
  },

  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20
  },
});

export default EditCharacter;
