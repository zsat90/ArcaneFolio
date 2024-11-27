import React, {useRef} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCharacterContext } from "../Characters/CharacterContext";
import {addSpellsToSpellbook} from '../../utils/Spells/spellsService'
import { useSpellbook } from "./SpellContext";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";



const SpellItem = ({ item, addSpellToSpellbook }) => {
    const {selectedCharacter} = useCharacterContext()
    const {spellbook, setSpellbook} = useSpellbook()
    const swipeableRef = useRef(null)
    

    const navigation = useNavigation<any>()
    
    const handlePress = () => {
        navigation.navigate('SpellDetails', {spell: item})
    }

    const handleAddSpell = async () => {
        const spellbookId = selectedCharacter?.spellbookId;
        const spellId = item.id

        try{
          const response = await addSpellsToSpellbook(spellbookId, spellId)

          if(response.success){
            const updatedSpellbook = {...spellbook , spells:[...spellbook.spells, item]}

            setSpellbook(updatedSpellbook)

            Alert.alert('Spell successfully added to Spellbook')

            if(swipeableRef.current){
              swipeableRef.current.close();
            }

          }else{
            Alert.alert(response.message)
          }

        }catch(err){
          console.error("Error adding spell to spellbook:", err);
        }

    }

    const RightAction = (progress: SharedValue<number>, drag: SharedValue<number>) => {
      const animatedStyle = useAnimatedStyle(() => {
        
        return {
          transform: [{ translateX: drag.value + 60 }],
        }
      })
  
      return(
        <Reanimated.View style={[animatedStyle, styles.rightActionContainer]}>
          <Text style={styles.actionText} onPress={handleAddSpell}><Icon name="add" size={30}/></Text>
        </Reanimated.View>
      )
    }



  return (
    
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={RightAction}
    >
    <TouchableOpacity
        onPress={handlePress}
        style={styles.spellItem}
    >
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
    backgroundColor: "green",
    marginTop: 10, 
    height: 80,
    width: 60,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});


export default SpellItem;
