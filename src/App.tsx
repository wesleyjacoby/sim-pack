import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store';
import Home from './views/Home';
import PageView from './views/PageView';
import Settings from './views/Settings';

function useHash() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const on = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function Router() {
  const { ready } = useApp();
  const hash = useHash();
  const [, a, b] = hash.split('/');
  useEffect(() => { window.scrollTo({ top: 0 }); }, [hash]);
  if (!ready) return <main />;
  if (a === 'p' && b) return <PageView key={b} id={decodeURIComponent(b)} />;
  if (a === 'settings') return <Settings />;
  return <Home />;
}

export default function App() {
  return <AppProvider><Router /></AppProvider>;
}
