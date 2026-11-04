import { useRef, useState } from 'react';
import { useApp } from '../store';
import { download, ImportButton } from '../ui';

export default function Settings() {
  const app = useApp();
  const [msg, setMsg] = useState('');
  const restore = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="topbar page"><div className="topbar-in"><a className="back" href="#/" aria-label="Back to pages"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Pages</span></a></div></div>
      <main className="narrow">
        <header className="page-hero">
          <div className="ph-top"><p className="hero-kicker">Sim Pack</p></div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Notes file, reading progress and storage.</p>
        </header>
        <section className="panel">
          <h2>Notes file</h2>
          <p className="muted">{app.pack ? `${app.pack.pages.length} pages, built ${new Date(app.pack.builtAt).toLocaleString()}.` : 'No notes loaded.'} Import a new <code>notes.json</code> any time you change your content. Your read marks are kept.</p>
          <div className="actions">
            <ImportButton label={app.pack ? 'Replace notes.json' : 'Import notes.json'} onDone={setMsg} />
            {app.pack && <button className="btn" onClick={() => { if (confirm('Remove the notes from this device?')) app.removePack(); }}>Remove</button>}
          </div>
        </section>

        <section className="panel">
          <h2>Progress</h2>
          <p className="muted">{Object.keys(app.read).length} pages marked as read.</p>
          <div className="actions">
            <button className="btn" onClick={() => download('sim-pack-progress.json', app.exportProgress())}>Export progress</button>
            <button className="btn" onClick={() => restore.current?.click()}>Restore progress</button>
            <button className="btn" onClick={() => { if (confirm('Clear all read marks?')) app.resetProgress(); }}>Clear read marks</button>
            <input ref={restore} type="file" accept="application/json,.json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setMsg(await app.importProgress(await f.text()));
              e.target.value = '';
            }} />
          </div>
        </section>

        <section className="panel">
          <h2>Storage</h2>
          <p className="muted">
            {app.persisted === true && 'This device has agreed to keep the data. '}
            {app.persisted === false && 'This browser has not promised to keep the data. Add the app to your Home Screen to make it durable. '}
            Everything is stored on this device only. Nothing is sent anywhere.
          </p>
        </section>
        {msg && <p className="toast" role="status">{msg}</p>}
      </main>
    </>
  );
}