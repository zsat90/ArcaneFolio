import React from "react";
import { View, StyleSheet} from "react-native";
import CharacterHeader from "@/components/Characters/CharacterHeader";
import NavDrawer from "../../components/Navigation/navDrawer";
import { useCharacterContext } from "@/components/Characters/CharacterContext";

const DashboardScreen: React.FC = () => {
    const { selectedCharacter  } = useCharacterContext()

    return(
            <View style={styles.container}>
                <CharacterHeader characterName={selectedCharacter?.name} magicPoints={selectedCharacter?.magicPoints} />
                
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