import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCharacterContext } from "../Characters/CharacterContext";
import { useSpellbook } from "./SpellContext";
import { removeSpellsFromSpellbook } from "@/utils/Spells/spellsService";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const SpellbookItem = ({ item }) => {
  const { selectedCharacter } = useCharacterContext();
  const { spellbook, setSpellbook } = useSpellbook();
  const swipeableRef = useRef(null);

  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate("SpellDetails", { spell: item });
  };

  const handleRemoveSpell = async () => {
    const spellbookId = selectedCharacter?.spellbookId;
    const spellId = item.id;

    try {
      const response = await removeSpellsFromSpellbook(spellbookId, spellId);

      if (response.success) {
        const updatedSpellbook = {
          ...spellbook,
          spells: spellbook.spells.filter(spell => spell.id !== spellId),
        };

        setSpellbook(updatedSpellbook);

        Alert.alert("Spell successfully removed from Spellbook");

        if (swipeableRef.current) {
          swipeableRef.current.close();
        }
      } else {
        Alert.alert(response.message);
      }
    } catch (err) {
      console.error("Error removing spell", err);
    }
  };

  const RightAction = (
    progress: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 60 }],
      };
    });
    return (
      <Reanimated.View style={[animatedStyle, styles.rightActionContainer]}>
        <Text style={styles.actionText} onPress={handleRemoveSpell}>
          <Icon name='delete' size={30}/>
        </Text>
      </Reanimated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={RightAction}
    >
      <TouchableOpacity onPress={handlePress} style={styles.spellItem}>
        <View style={styles.textContainer}>
          <Text style={styles.spellName}>{item.name}</Text>
          <Text>Level: {item.level}</Text>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};

export const styles = StyleSheet.create({
  spellItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    paddingRight: 10,
    marginTop: 5,
  },

  spellName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  rightActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0040c",
    marginTop: 10,
    height: 80,
    width: 60,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default SpellbookItem;
