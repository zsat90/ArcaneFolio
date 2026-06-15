import React from "react";

type HeaderWithCharacterProps = {
    characterName: string;
  };

const CharacterHeader: React.FC<HeaderWithCharacterProps> = ({characterName}) => {
    return (
        <header style={styles.headerContainer}>
            <h2 style={styles.headerText}>{characterName}</h2>
        </header>
    )
}

const styles: Record<string, React.CSSProperties> = { 
    headerContainer: {
        padding: 10,
        backgroundColor: '#6200ee',
      },
      headerText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
      },

};

export default CharacterHeader
