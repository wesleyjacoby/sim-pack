import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { render } from '../markdown';
import { Check } from '../ui';
import { GROUP_LABEL } from '../types';

export default function PageView({ id }: { id: string }) {
  const { pack, read, toggleRead } = useApp();
  const page = pack?.pages.find((p) => p.id === id);
  const [cover, setCover] = useState(false);
  const [sources, setSources] = useState(false);
  const body = useRef<HTMLElement>(null);
  const heroEl = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  const { html, toc } = useMemo(() => (page ? render(page.md, page.cover) : { html: '', toc: [] }), [page]);

  // reset reveals whenever Cover is switched on, or the page changes
  useEffect(() => {
    body.current?.querySelectorAll('.on').forEach((el) => el.classList.remove('on'));
  }, [cover, id]);

  useEffect(() => {
    const el = heroEl.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: '-70px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [id, !!page]);

  useEffect(() => {
    const onScroll = () => {
      let cur = '';
      for (const t of toc) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top < 150) cur = t.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  if (!page || !pack) {
    return (
      <main className="narrow">
        <p><a href="#/">‹ Back</a></p>
        <h1>Page not found</h1>
        <p className="muted">Load your notes file from the home screen first.</p>
      </main>
    );
  }

  const idx = pack.pages.findIndex((p) => p.id === id);
  const next = pack.pages[idx + 1];
  const isRead = !!read[id];

  const onTap = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('.cv, .cvb');
    if (el && cover) el.classList.toggle('on');
  };

  return (
    <>
      <div className={`topbar page ${scrolled ? 'scrolled' : ''}`}>
        <div className="topbar-in">
          <a className="back" href="#/" aria-label="Back to pages">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Pages</span>
          </a>
          <div className="title">{page.title}</div>
          <div className="tools">
            {page.cover !== 'none' && (
              <button className={`toggle ${cover ? 'on' : ''}`} aria-pressed={cover} onClick={() => setCover(!cover)}><i className="dot" />Cover</button>
            )}
            <button className={`toggle ${sources ? 'on' : ''}`} aria-pressed={sources} onClick={() => setSources(!sources)}><i className="dot" />Sources</button>
          </div>
        </div>
        {toc.length > 1 && (
          <nav className="toc" aria-label="Sections">
            {toc.map((t) => <a key={t.id} className={active === t.id ? 'on' : ''} href={`#/p/${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t.text}</a>)}
          </nav>
        )}
      </div>

      <main className="page">
        <header className="page-hero" ref={heroEl}>
          <div className="ph-top">
            <p className="hero-kicker">{GROUP_LABEL[page.group]}</p>
            <span className={`status ${isRead ? 'done' : ''}`}>{isRead ? 'Read' : 'Unread'}</span>
          </div>
          <h1 className="page-title">{page.title}</h1>
          {page.summary && <p className="page-sub">{page.summary}</p>}
          <div className="ph-meta">
            {toc.length > 1 && <span>{toc.length} sections</span>}
            {page.cover !== 'none' && <span>Cover mode</span>}
            <span>{idx + 1} of {pack.pages.length}</span>
          </div>
        </header>
        <article
          ref={body}
          className={`prose page-${page.id} ${page.cover === 'none' ? 'rd' : ''} ${cover ? 'covered' : ''} ${sources ? 'show-src' : ''}`}
          onClick={onTap}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="page-end">
          <button className={`btn big ${isRead ? '' : 'primary'}`} onClick={() => toggleRead(id)}>
            <Check on={isRead} /> {isRead ? 'Marked as read' : 'Mark as read'}
          </button>
          {next && <a className="btn big" href={`#/p/${next.id}`}>Next: {next.title} ›</a>}
        </div>
      </main>
    </>
  );
}