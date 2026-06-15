import React from 'react';
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: 12, backgroundColor: '#231F20' }}>
      <Link href="/dashboard/spells" legacyBehavior><a style={{ color: '#A9FFF7', textDecoration: 'none' }}>Spells</a></Link>
      <Link href="/dashboard/spellbook" legacyBehavior><a style={{ color: '#A9FFF7', textDecoration: 'none' }}>Spell Book</a></Link>
    </nav>
  );
};

export default NavBar;
