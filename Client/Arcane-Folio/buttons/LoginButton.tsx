import React from "react";
import { LoginButtonProps } from "./types";
import { TouchableOpacity, Text } from "react-native";

const LoginButton: React.FC<LoginButtonProps> = ({onPress, label}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text >{label}</Text>
        </TouchableOpacity>
    )

}



export default LoginButton