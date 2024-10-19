import React from "react";
import { View, StyleSheet, Text } from "react-native";
import CharacterHeader from "@/components/Characters/CharacterHeader";
import NavDrawer from "../components/Navigation/navDrawer";

const DashboardScreen: React.FC = ({ route }: any) => {
    const { selectedCharacter } = route.params;

    return(
            <View style={styles.container}>
                {/* <CharacterHeader characterName={selectedCharacter?.name} /> */}
                
                <NavDrawer />
                
            </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
    

})


export default DashboardScreen