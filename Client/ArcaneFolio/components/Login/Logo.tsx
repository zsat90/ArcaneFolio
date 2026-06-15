import React from 'react'
import spellbook from '../../assets/images/spellbook.jpg';



const Logo = () => {
    return (
        <span style={styles.container}>
            <img src={typeof spellbook === 'string' ? spellbook : spellbook.src} style={styles.image} alt="" />
        </span>
    );
}


const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'inline-flex',
    },
    image: {
        width: 60,
        height: 60,
        objectFit: 'cover',
    }
};


export default Logo
