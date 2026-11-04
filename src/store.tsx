import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { get, set, del } from 'idb-keyval';
import type { Pack, ReadMap } from './types';

const PACK_KEY = 'sp3:pack';
const READ_KEY = 'sp3:read';

interface Ctx {
  ready: boolean;
  pack: Pack | null;
  read: ReadMap;
  persisted: boolean | null;
  importPack: (text: string) => Promise<string>;
  toggleRead: (id: string) => void;
  exportProgress: () => string;
  importProgress: (text: string) => Promise<string>;
  resetProgress: () => void;
  removePack: () => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider missing');
  return c;
};

function validPack(x: unknown): x is Pack {
  const p = x as Pack;
  return !!p && p.format === 1 && Array.isArray(p.pages) && p.pages.length > 0 &&
    p.pages.every((g) => typeof g.id === 'string' && typeof g.title === 'string' && typeof g.md === 'string');
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);
  const [read, setRead] = useState<ReadMap>({});
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([get<Pack>(PACK_KEY), get<ReadMap>(READ_KEY)]);
        if (validPack(p)) setPack(p);
        if (r && typeof r === 'object') setRead(r);
      } catch { /* storage unavailable: start empty */ }
      try {
        if (navigator.storage?.persist) setPersisted(await navigator.storage.persist());
      } catch { /* ignore */ }
      setReady(true);
    })();
  }, []);

  const saveRead = useCallback((next: ReadMap) => {
    setRead(next);
    set(READ_KEY, next).catch(() => undefined);
  }, []);

  const importPack = useCallback(async (text: string) => {
    let data: unknown;
    try { data = JSON.parse(text); } catch { return 'That file is not valid JSON.'; }
    if (!validPack(data)) return 'That does not look like a notes.json from "npm run pack".';
    setPack(data);
    try { await set(PACK_KEY, data); } catch { return 'Loaded, but this browser would not save it for offline use.'; }
    return `Loaded ${data.pages.length} pages.`;
  }, []);

  const toggleRead = useCallback((id: string) => {
    const next = { ...read };
    if (next[id]) delete next[id]; else next[id] = Date.now();
    saveRead(next);
  }, [read, saveRead]);

  const exportProgress = useCallback(() => JSON.stringify({ format: 3, exportedAt: new Date().toISOString(), read }, null, 2), [read]);

  const importProgress = useCallback(async (text: string) => {
    try {
      const d = JSON.parse(text);
      if (d?.format !== 3 || typeof d.read !== 'object') return 'That is not a progress file from this app.';
      saveRead(d.read as ReadMap);
      return `Restored ${Object.keys(d.read).length} read marks.`;
    } catch { return 'That file is not valid JSON.'; }
  }, [saveRead]);

  const resetProgress = useCallback(() => saveRead({}), [saveRead]);
  const removePack = useCallback(() => { setPack(null); del(PACK_KEY).catch(() => undefined); }, []);

  const value = useMemo(() => ({
    ready, pack, read, persisted, importPack, toggleRead, exportProgress, importProgress, resetProgress, removePack,
  }), [ready, pack, read, persisted, importPack, toggleRead, exportProgress, importProgress, resetProgress, removePack]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
