import React, {useState} from "react";
import { Text } from "react-native";
import ImageBackgroundWrapper from '../../components/imageBackground';




const SpellBookScreen: React.FC<any> = () => { 
    // Todo Set the state to use the spells type instead of <any>
    

    return (
        <ImageBackgroundWrapper>
            
            <Text>Spell Book Screen</Text>
        </ImageBackgroundWrapper>
    )
}


export default SpellBookScreen