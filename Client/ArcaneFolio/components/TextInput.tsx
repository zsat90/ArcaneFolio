import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput as Input, IconButton } from 'react-native-paper';

type Props = React.ComponentProps<typeof Input> & {
    errorText?: string;
    onIconPress?: () => void;
    icon?: string;
}

const TextInput = ({errorText, icon, onIconPress, ...props}: Props) => {
    return (
        <View style={styles.container}>
           <Input
            style={styles.input}
            mode='outlined'
            right={icon ? <Input.Icon icon={icon} onPress={onIconPress} /> : undefined}
            {...props}
           />
           {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        width: '80%'
    }, 

    input: {
        height: 50,
        width: '100%',
        fontSize: 16

    },

    error: { 
        color: 'red',
    }

})

export default TextInput