import React, { useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { Character } from "@/types/characterTypes";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from 'react-native-toast-message'
import { useAppDispatch } from "../../redux/hooks";
import {
  selectCharacter,
  deleteCharacter,
} from "@/redux/slices/characterSlice";

interface CharacterItemProps {
  item: Character;
  navigation: any;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ item, navigation }) => {
  const dispatch = useAppDispatch()
  const swipeableRef = useRef(null);

  const handleSelectCharacter = async () => {
    dispatch(selectCharacter(item))
    navigation.navigate('Dashboard')
  };

  const handleEditCharacter = (characterId: number) => {
    dispatch(selectCharacter(item))
    swipeableRef.current?.close()
    navigation.navigate('EditCharacter', {characterId})
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Character",
      `Are you sure you want to delete ${item.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              dispatch(deleteCharacter(item.id))
              Toast.show({
                type: 'success',
                text1: `${item.name} deleted successfully`,
                visibilityTime: 3000
              })
            } catch (error) {
              console.error("Failed to delete character:", error);
            }
          },
        },
      ]
    );
  };

  const RightAction = (
    progress: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 140 }],
      };
    });

    return (
      <Reanimated.View style={[animatedStyle, styles.rightActionContainer]}>
        <Reanimated.View style={styles.iconButton1}>
          <Text style={styles.actionText} onPress={() => handleEditCharacter(item.id)}>
            <Icon name="edit" size={30} />
          </Text>
        </Reanimated.View>

        <Reanimated.View style={styles.iconButton2}>
          <Text style={styles.actionText} onPress={handleDeletePress}>
            <Icon name="delete" size={30} />
          </Text>
        </Reanimated.View>
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
      <TouchableOpacity onPress={handleSelectCharacter}>
        <View style={styles.characterItem}>
          <View style={styles.textContainer}>
            <Text style={styles.characterName}>{item.name}</Text>
            <Text style={styles.characterClass}>
              Class: {item.characterClass}
            </Text>
            <Text style={styles.characterLevel}>Level: {item.level}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  characterItem: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 15,
    marginBottom: 15,
    marginTop: 15,
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
    height: 90,
  },

  textContainer: {
    flex: 1,
    paddingRight: 10,
    marginTop: 5,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  characterClass: {
    fontSize: 14,
    color: "gray",
    marginBottom: 5,
  },

  characterLevel: {
    fontSize: 14,
    color: "gray",
  },

  rightActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },

  iconButton1: {
    backgroundColor: "green",
    height: 85,
    width: 70,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton2: {
    backgroundColor: "#e0040c",
    height: 85,
    width: 70,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CharacterItem;
