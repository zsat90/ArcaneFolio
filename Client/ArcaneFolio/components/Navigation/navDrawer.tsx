import React, { useState } from "react";
import { View, StyleSheet, Button, Text, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import CharacterSelectScreen from "../../screens/Characters/CharacterSelectScreen";
import Header from "../Header";
import NavBar from "./navBar";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import TextInput from "../TextInput";
import { handleAddMagicPoints } from "@/utils/Validation/userInputs";
import { addMagicPoints, resetMagicPoints } from "../../utils/navDrawer/navService";
import { useCharacterContext } from "../Characters/CharacterContext";

const Drawer = createDrawerNavigator();

const NavDrawer: React.FC = () => {
  const [magicPoint, setMagicPoints] = useState(null);
  const [name, setName] = useState({ value: "", error: "" });
  const { selectedCharacter, setSelectedCharacter } = useCharacterContext();

  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        header: () => <Header navigation={navigation} />,
      })}
      drawerContent={(props) => (
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerContent}
        >
          <DrawerItemList {...props} />
          <View style={styles.labelContainer}>
            <Text style={styles.magicPointsLabel}>Magic Points</Text>
          </View>
          {/* Reset Magic Points Section */}
          <View style={styles.magicPointsContainer}>
            {/* Add/Reset Magic Points Section */}
            <View style={styles.campfireContainer}>
              <TouchableOpacity
                style={styles.campfireIcon}
                onPress={() => {
                  resetMagicPoints(selectedCharacter.id, setSelectedCharacter)

                }}
              >
                <CommunityIcon
                  name="campfire"
                  size={40}
                  color="#231F20"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.addMagicPointsContainer}>
              <TextInput
                label="Add"
                keyboardType="numeric"
                value={magicPoint || ""}
                onChangeText={(text) =>
                  handleAddMagicPoints(text, setMagicPoints)
                }
                style={styles.textInput}
                errorText={name.error}
              />

              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  addMagicPoints(
                    selectedCharacter.id,
                    magicPoint.value,
                    setSelectedCharacter
                  );
                  setMagicPoints(null);
                }}
              >
                <Icon
                  name="add-box"
                  size={50}
                  color="#4A6FA5"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.logoutContainer}>
            <DrawerItem
              label="Logout"
              icon={({ color }) => (
                <Icon name="logout" color={color} size={24} />
              )}
              onPress={() => {
                // TODO: Handle logout action here
                props.navigation.navigate("Login");
              }}
              labelStyle={styles.logoutLabel}
            />
          </View>
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="Home"
        component={NavBar}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="home" color={color} size={24} />
          ),
          drawerLabelStyle: {
            fontSize: 20,
          },
        }}
      />
      <Drawer.Screen
        name="Characters"
        component={CharacterSelectScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="person" color={color} size={24} />
          ),
          drawerLabelStyle: {
            fontSize: 20,
          },
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },

  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  logoutLabel: {
    fontSize: 20,
  },

  labelContainer: {
    marginTop: 40,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  magicPointsLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#231F20",
  },

  magicPointsContainer: {
    marginBottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: 'flex-start'
  },

  campfireContainer: {
    alignItems: "center",
    marginRight: 10,
  },

  campfireIcon: {
    marginTop: 5,
    marginLeft: 20
  },

  addMagicPointsContainer: {
    flexDirection: "row",
    width: "25%",
    marginLeft: 70
  },

  textInput: {
    height: 40,
    fontSize: 15,
  },

  iconContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
  },

  icon: {
    marginTop: 5,
    marginRight: 15,
  },

});

export default NavDrawer;
