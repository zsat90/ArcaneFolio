import React from "react";
import { View, StyleSheet} from "react-native";
import CharacterHeader from "@/components/Characters/CharacterHeader";
import NavDrawer from "../../components/Navigation/navDrawer";
import { useAppSelector } from "@/redux/hooks";

const DashboardScreen: React.FC = () => {
    const selectedCharacter = useAppSelector((state) => state.character.selectedCharacter)
    

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