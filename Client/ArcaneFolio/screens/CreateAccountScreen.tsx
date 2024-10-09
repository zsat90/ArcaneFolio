import React, {useState} from 'react'
import {View} from 'react-native'
import TextInput from "../components/TextInput";
import Buttons from "../components/Login/Button";



const CreateAccount = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    
    return(
        <View>
            <TextInput
                label="Email"
                onChangeText={handleEmailChange}
                errorText={email.error}
            />
        </View>
    )

}


export default CreateAccount