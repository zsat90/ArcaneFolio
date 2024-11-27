import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";


const SpellDetails = ({ route }) => {
  const { spell } = route.params;

  return (
    
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.spellName}>{spell.name}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Level: {spell.level}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Components: {spell.components}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Range: {spell.range}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Area Of Effect: {spell.areaOfEffect}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Save: {spell.save}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Casting Time: {spell.castingTime}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Magic Point Cost: {spell.magicPointCost}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Duration: {spell.duration}</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.infoContainer}>
          <Text style={styles.text}>Description:</Text>
          <Text style={styles.description}>{spell.description}</Text>
        </View>
      </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },

  spellName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  infoContainer: {
    paddingVertical: 10,
  },

  text: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },

  description: {
    fontSize: 20,
    fontWeight: "normal",
    marginTop: 5,
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
});

export default SpellDetails;
