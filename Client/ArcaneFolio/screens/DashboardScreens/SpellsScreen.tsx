import React, {useState} from "react";
import { Text } from "react-native";
import ImageBackgroundWrapper from '../../components/imageBackground';




const SpellsScreen: React.FC<any> = () => { 
    // Todo Set the state to use the spells type instead of <any>
    const [spells, setSpells] = useState<any[]>([])

    return (
        <ImageBackgroundWrapper>
            
            <Text>Spells Screen</Text>
        </ImageBackgroundWrapper>
    )
}


export default SpellsScreen