import React from "react";
import wizard from '../../assets/images/wizard.webp';


const Hero = () => { 
    return (
        <div>
            <img src={typeof wizard === 'string' ? wizard : wizard.src} style={styles.image} alt="" />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    image: {
        width: '100%',
        height: 400,
        objectFit: 'cover',
        marginBottom: 100,
    }
};


export default Hero;
