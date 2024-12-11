import React, { useEffect, useState, useMemo } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import ImageBackgroundWrapper from "../../components/imageBackground";
import { Searchbar } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { filterSpells, getSpellsByClass } from "../../utils/Spells/spellsService";
import SpellItem from "../../components/Spells/spellItems";
import debounce from "lodash/debounce"; 

const SpellsScreen: React.FC<any> = ({characterClass}) => {
  // Todo Set the state to use the spells type instead of <any>
  const [spells, setSpells] = useState<any[]>([]);
  const [spellSearch, setSpellSearch] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSpell, setSelectedSpell] = useState("");


  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const spellData = await getSpellsByClass(characterClass);
        
        setSpells(spellData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSpells();
  }, [characterClass]);

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

  const debounceSpells = useMemo(
    () =>
      debounce(async (level: string, text: string) => {
        try {
          const filtered = await filterSpells(characterClass, level, text);
          setSpells(filtered);
        } catch (err) {
          console.error(err);
        }
      }, 500),
    [characterClass]
  );

  const handleSearch = async (text: string) => {
    setSpellSearch(text);
    debounceSpells(selectedLevel, text);
  };

  const handleLevelChange = async (item: any) => {
    setSelectedLevel(item.value);
    debounceSpells(item.value,spellSearch)
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

        <View>
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={spells}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <SpellItem item={item} addSpellToSpellbook={setSelectedSpell} />
            )}
            ListEmptyComponent={
              <Text style={styles.text}>
                {spells.length === 0
                  ? "No spells Found."
                  : "No spells added to spellbook. Please add spells!"}
              </Text>
            }
            
          />
        </View>
      </View>
    </ImageBackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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

  listContainer: {
    paddingBottom: 70,
  },
});
export default SpellsScreen;
