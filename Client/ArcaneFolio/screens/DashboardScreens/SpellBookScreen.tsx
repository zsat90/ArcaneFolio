import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Searchbar } from "react-native-paper";
import ImageBackgroundWrapper from "../../components/imageBackground";
import { useSpellbook } from "../../components/Spells/SpellContext";
import SpellbookItem from "../../components/Spells/SpellBookItems";
import { fetchSpellbook } from "@/utils/Spells/spellsService";
import { useCharacterContext } from "../../components/Characters/CharacterContext";

const SpellbookScreen = () => {
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

  const [spellSearch, setSpellSearch] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const { selectedCharacter } = useCharacterContext();
  const { spellbook, setSpellbook } = useSpellbook();

  useEffect(() => {
    const fetchSpellbookData = async () => {
      try {
        const data = await fetchSpellbook(selectedCharacter.spellbookId);
        setSpellbook(data);
      } catch (err) {
        throw err;
      }
    };
    if (selectedCharacter?.spellbookId) {
      fetchSpellbookData();
    }
  }, [selectedCharacter?.spellbookId]);

  if (!spellbook || !spellbook.spells || spellbook.spells.length === 0) {
    return (
      <ImageBackgroundWrapper>
        <View style={styles.container}>
          <Text style={styles.text}>
            No spells added to spellbook. Please add spells
          </Text>
        </View>
      </ImageBackgroundWrapper>
    );
  }

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
            onChange={(item) => setSelectedLevel(item.value)}
          />

          <Searchbar
            placeholder="Search Spells"
            // Todo add on change text functionality
            onChangeText={setSpellSearch}
            value={spellSearch}
            style={styles.searchBar}
          />
        </View>

        <FlatList
          data={spellbook?.spells}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <SpellbookItem item={item} />}
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
