import React from 'react';
import Logo from '../components/Login/Logo'

type HeaderProps = {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header style={styles.headerContainer}>
            <button type="button" onClick={onMenuClick} aria-label="Open menu" style={styles.menuButton}>
                Menu
            </button>
            <div style={styles.titleContainer}>
                <Logo />
                <span style={styles.headerText}>Adventurer's Codex</span>
            </div>
        </header>
    );
};

const styles: Record<string, React.CSSProperties> = {
    headerContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#231F20',
        opacity: 0.9,
        
    },

    titleContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'

    },

    headerText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Courier'
    },
    menuButton: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 8,
        color: '#fff',
        cursor: 'pointer',
        padding: '8px 10px',
    },
};

export default Header;
