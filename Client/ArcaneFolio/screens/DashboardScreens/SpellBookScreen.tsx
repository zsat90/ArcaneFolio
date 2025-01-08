import React, { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Searchbar } from "react-native-paper";
import ImageBackgroundWrapper from "../../components/imageBackground";
import SpellbookItem from "../../components/Spells/SpellBookItems";
import debounce from "lodash/debounce";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchSpellbook, fetchFilteredSpells } from "@/redux/slices/spellbookSlice";


const SpellbookScreen = () => {
  // level array
  const levels = [
    { label: "All Levels", value: "0" },
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

  const selectedCharacter = useAppSelector((state) => state.character.selectedCharacter)
  const filteredSpells = useAppSelector((state) => state.spellbook.filteredSpells)
  const dispatch = useAppDispatch()
  const [spellSearch, setSpellSearch] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("0");


  const characterClass = selectedCharacter?.characterClass

  useEffect(() => {
    if (selectedCharacter?.spellbookId) {
      dispatch(fetchFilteredSpells({
        characterClass,
        level: selectedLevel,
        search: spellSearch,
        spellbookId: selectedCharacter.spellbookId
      }))
    }
  }, [selectedCharacter?.spellbookId, dispatch]);

  const debounceSpells = useMemo(
    () =>
      debounce(async (level: string, text: string) => {
        try {
          await dispatch(fetchFilteredSpells({ 
            characterClass, 
            level, 
            search: text, 
            spellbookId: selectedCharacter.spellbookId 
          })).unwrap(); 
        } catch (err) {
          console.error(err);
        }
      }, 500),
    [selectedCharacter]
  );

  const handleSearch = async (text: string) => {
    setSpellSearch(text);
    debounceSpells(selectedLevel, text);
  };

  const handleLevelChange = async (item: any) => {
    setSelectedLevel(item.value);
    debounceSpells(item.value, search);
  };

  return (
    <ImageBackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Dropdown
            style={styles.dropdown}
            data={levels}
            labelField="label"
            valueField="value"
            value={selectedLevel}
            placeholder="Level"
            onChange={handleLevelChange}
          />

          <Searchbar
            placeholder="Search Spells"
            onChangeText={handleSearch}
            value={spellSearch}
            style={styles.searchBar}
          />
        </View>

        <FlatList
          data={filteredSpells}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <SpellbookItem item={item} />}
          ListEmptyComponent={
            <Text style={styles.text}>
              {spellSearch || selectedLevel !== '0'
                ? "No spells Found."
                : "No spells added to spellbook. Please add spells!"}
            </Text>
          }
        />
      </View>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
  },

  text: {
    fontSize: 26,
    textAlign: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdown: {
    flex: 1,
    height: 55,
    borderColor: "black",
    borderRadius: 20,
    marginRight: 5,
    paddingHorizontal: 8,
    backgroundColor: "#F1F1F1",
  },

  searchBar: {
    flex: 2,
    height: 55,
    backgroundColor: "#F1F1F1",
  },
});

export default SpellbookScreen;
