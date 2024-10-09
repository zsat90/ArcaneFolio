// This component is for what the buttons will look like throughout the app
import React from 'react'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native'

type Props = React.ComponentProps<typeof Button>

const Buttons = ({mode, icon, children, ...props}: Props) => {
    return(
    <Button icon={icon} mode={mode} {...props} style={styles.button} >
        {children}
    </Button>

    )

}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5299D3',
        
    }

})


export default Buttons



