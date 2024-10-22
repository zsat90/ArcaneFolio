import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import ImageBackgroundWrapper from "../../components/imageBackground";
import { Searchbar, SegmentedButtons } from "react-native-paper";
import {Dropdown} from 'react-native-element-dropdown'
import Icon from "react-native-vector-icons/MaterialIcons";

const SpellsScreen: React.FC<any> = () => {
  // Todo Set the state to use the spells type instead of <any>
  const [spells, setSpells] = useState<any[]>([]);
  const [spellSearch, setSpellSearch] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // TODO: Add filtered spell function that handles the filtering of levels. Best to put it in it's own file

  // level array
  const levels = [
    { label: "All Levels", value: "All" },
    { label: "1st", value: "1" },
    { label: "2nd", value: "2" },
    { label: "3rd", value: "3" },
    { label: "4th", value: "4" },
    { label: "5th", value: "5" },
    { label: "6th", value: "6" },
    { label: "7th", value: "7" },
    { label: "8th", value: "8" },
    { label: "9th", value: "9" },
  ];

  return (
    <ImageBackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
            <Dropdown
                style={styles.dropdown}
                data={levels}
                labelField="label"
                valueField='value'
                value={selectedLevel}
                placeholder="Level"
                onChange={item => setSelectedLevel(item.value)}

            />


          <Searchbar
            placeholder="Search Spells"
            // Todo add on change text functionality
            onChangeText={setSpellSearch}
            value={spellSearch}
            style={styles.searchBar}
          />

          
        </View>

        {/* TODO: Use flatlist for spells*/}
      </View>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  dropdown: {
    flex: 1,
    height: 55,
    borderColor: 'black',
    borderRadius: 20,
    marginRight: 5,
    paddingHorizontal: 8,
    backgroundColor: '#F1F1F1'
},

  searchBar: {
    flex: 2,
    height: 55,
    backgroundColor: '#F1F1F1'
  },
});
export default SpellsScreen;
