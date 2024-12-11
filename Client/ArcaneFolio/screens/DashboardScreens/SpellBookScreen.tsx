import React, { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Searchbar } from "react-native-paper";
import ImageBackgroundWrapper from "../../components/imageBackground";
import SpellbookItem from "../../components/Spells/SpellBookItems";
import { fetchSpellbook, filterSpells } from "@/utils/Spells/spellsService";
import { useCharacterContext } from "../../components/Characters/CharacterContext";
import debounce from "lodash/debounce";
import { useSpellbook } from "@/components/Spells/SpellContext";

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

  const [spellSearch, setSpellSearch] = useState<string>("");
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("0");
  const { selectedCharacter } = useCharacterContext();
  const {spellbook} = useSpellbook()

  const characterClass = selectedCharacter.characterClass

  useEffect(() => {
    const fetchSpellbookData = async () => {
      try {
        const data = await fetchSpellbook(selectedCharacter.spellbookId);
        setFilteredSpells(data.spells);
        
      } catch (err) {
        throw err;
      }
    };
    if (selectedCharacter?.spellbookId) {
      fetchSpellbookData();
    }
  }, [selectedCharacter.spellbookId, spellbook]);

  const debounceSpells = useMemo(
    () =>
      debounce(async (level: string, text: string) => {
        try {
          const filtered = await filterSpells(
            characterClass,
            level,
            text,
            selectedCharacter.spellbookId
          );
          setFilteredSpells(filtered);
        } catch (err) {
          console.error(err);
        }
      }, 500),
    []
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
