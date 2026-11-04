import { useRef, type ReactNode } from 'react';
import { useApp } from './store';

export function ImportButton({ label = 'Import notes.json', primary = true, onDone }: { label?: string; primary?: boolean; onDone?: (msg: string) => void }) {
  const { importPack } = useApp();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button className={`btn ${primary ? 'primary' : ''}`} onClick={() => ref.current?.click()}>{label}</button>
      <input
        ref={ref} type="file" accept="application/json,.json" hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const msg = await importPack(await f.text());
          e.target.value = '';
          onDone?.(msg);
        }}
      />
    </>
  );
}

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Check({ on }: { on: boolean }) {
  return (
    <span className={`tick ${on ? 'on' : ''}`} aria-label={on ? 'Read' : 'Not read'}>
      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  return <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemax={max}><i style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="group"><h2 className="eyebrow">{title}</h2>{children}</section>;
}
