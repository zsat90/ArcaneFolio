import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="hero">
      <div className="hero-content">
        <section className="hero-text">
          <h1 className="hero-title">Arcane Folio</h1>
          <p className="hero-subtitle">Arcane Folio helps spellcasters quickly access and manage spells from different tomes — organized, searchable, and ready at your fingertips.</p>
          <div className="cta-buttons">
            <Link href="/login"><a className="cta-btn primary">Login</a></Link>
            <Link href="/create-account"><a className="cta-btn secondary">Create Account</a></Link>
          </div>
        </section>

        <aside className="hero-media">
          <div className="card">
            <p>Arcane Folio is a web companion for spellcasters: create and manage characters, organize spellbooks, and quickly look up spells while you play. Your data syncs with your account and is organized for fast access.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
