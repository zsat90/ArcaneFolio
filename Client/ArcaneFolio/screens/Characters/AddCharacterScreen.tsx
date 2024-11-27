import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ImageBackgroundWrapper from "../../components/imageBackground";
import TextInput from "../../components/TextInput";
import { handleNameChange, handleMagicPointChange } from "@/utils/Validation/userInputs";
import { Dropdown } from "react-native-element-dropdown";
import Buttons from "../../components/Login/Button";
import globalStyles from "@/styles/styles";
import { ScrollView } from "react-native-gesture-handler";
import { handleCreateCharacter } from "@/utils/Character/characterService";

type AddCharacterScreenProps = {
  navigation: StackNavigationProp<any>;
};


const AddCharacter: React.FC<AddCharacterScreenProps> = ({ navigation }) => {
  // Class array
  const characterClasses = [
    { label: "Wizard", value: "Wizard" },
    { label: "Priest", value: "Priest" },
  ];

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

  const [name, setName] = useState({ value: "", error: "" });
  const [characterClass, setCharacterClass] = useState(null);
  const [level, setLevel] = useState(null);
  const [magicPoints, setMagicPoints] = useState(null)

  return (
    <ImageBackgroundWrapper>
      <Text style={globalStyles.title}>Add Character</Text>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
        <TextInput
          label="Character Name"
          onChangeText={(text) => handleNameChange(text, setName)}
          errorText={name.error}
          style={styles.input}
        />

        <TextInput
          label="MP"
          keyboardType="numeric"
          onChangeText={(text) => handleMagicPointChange(text, setMagicPoints)}
          errorText={name.error}
          style={styles.magicPointsInput}
        />

        </View>

        <View style={styles.dropdownContainer}>
          <Dropdown
            style={[styles.dropdown, styles.leftDropdown]}
            data={characterClasses}
            labelField="label"
            valueField="value"
            value={characterClass}
            placeholder="Classes"
            onChange={(item) => setCharacterClass(item)}
          />

          <Dropdown
            style={[styles.dropdown, styles.rightDropdown]}
            data={levels}
            labelField="label"
            valueField="value"
            value={level}
            placeholder="Level"
            onChange={(item) => setLevel(item)}
          />
        </View>

        

        <View style={styles.buttonContainer}>
          <Buttons
            mode="contained"
            onPress={() =>
              handleCreateCharacter({
                name: name.value,
                characterClass: characterClass.value,
                level: level.value,
                magicPoints: magicPoints.value,
                navigation,
                setName,
                setCharacterClass,
                setLevel,
                setMagicPoints
              })
            }
          >
            Add Character
          </Buttons>
        </View>
      </ScrollView>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%'
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 16

  },

  input: {
    width: '95%'
  },

  magicPointsInput: {
    width: '30%'
  },

  

  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 16,
    width: '100%'
  },

  dropdown: {
    flex: 1,
    height: 50,
    borderColor: "black",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F1F1F1",
  },

  leftDropdown: {
    marginRight: 8,
  },

  rightDropdown: {
    marginLeft: 8,
  },


  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});

export default AddCharacter;
