import { useState } from 'react';
import { useApp } from '../store';
import { GROUP_LABEL, GROUP_ORDER } from '../types';
import { Bar, Check, ImportButton, Section } from '../ui';

export default function Home() {
  const { pack, read } = useApp();
  const [msg, setMsg] = useState('');

  if (!pack) {
    return (
      <main className="narrow">
        <div className="welcome">
          <div className="logo" aria-hidden="true">737</div>
          <h1>Sim Pack</h1>
          <p>Your recurrent study pack. The app is empty until you load your notes file. It is stored on this device only and works offline afterwards.</p>
          <div className="actions center"><ImportButton onDone={setMsg} /></div>
          {msg && <p className="muted small">{msg}</p>}
          <p className="muted small">Build the file on your computer with <code>npm run pack</code>. It lands in <code>pack/notes.json</code>.</p>
        </div>
      </main>
    );
  }

  const total = pack.pages.length;
  const done = pack.pages.filter((p) => read[p.id]).length;
  const next = pack.pages.find((p) => !read[p.id]);

  return (
    <main>
      <header className="hero">
        <div className="hero-top">
          <div className="brand">
            <div className="logo sm" aria-hidden="true">737</div>
            <div>
              <p className="hero-kicker">Boeing 737-800 · Recurrent</p>
              <h1>Sim Pack</h1>
            </div>
          </div>
          <a className="icon-btn dark" href="#/settings" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /><circle cx="16" cy="7" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="8" cy="17" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          </a>
        </div>
        <div className="hero-progress">
          <div className="hero-count"><strong>{done}</strong><span>/ {total} pages read</span></div>
          <Bar value={done} max={total} />
          {next ? <a className="btn accent" href={`#/p/${next.id}`}>{done ? 'Continue' : 'Start'} · {next.title}</a> : <span className="done-note">All pages read</span>}
        </div>
      </header>

      {GROUP_ORDER.map((g) => {
        const pages = pack.pages.filter((p) => p.group === g);
        if (!pages.length) return null;
        return (
          <Section key={g} title={GROUP_LABEL[g]}>
            <div className="cards">
              {pages.map((p) => (
                <a key={p.id} className={`card ${read[p.id] ? 'is-read' : ''}`} href={`#/p/${p.id}`}>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div className="card-foot">
                    {p.cover !== 'none' ? <span className="chip">Cover mode</span> : <span />}
                    <Check on={!!read[p.id]} />
                  </div>
                </a>
              ))}
            </div>
          </Section>
        );
      })}
    </main>
  );
}
