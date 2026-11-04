import { Marked } from 'marked';
import type { CoverMode } from './types';

/**
 * Page syntax on top of normal Markdown:
 *   ==text==   value that Cover mode hides until tapped
 *   [#]        FCOM memory-item marker
 *   {FCOM x}   small source tag (hidden unless Sources is on)
 * In pages with cover: blocks, every list and table is one tap-to-reveal block.
 */
export interface Heading { id: string; text: string }
export interface Rendered { html: string; toc: Heading[] }

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const strip = (s: string) =>
  s.replace(/<span class="(?:src|mem)"[^>]*>.*?<\/span>/g, '').replace(/<[^>]+>/g, '').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(md: string): string {
  return md
    .replace(/\[#\]/g, '<span class="mem" title="FCOM memory item">#</span>')
    .replace(/==([^=]+?)==/g, '<span class="cv">$1</span>')
    .replace(/\{([^{}]+)\}/g, (_, t: string) => `<span class="src">${esc(t)}</span>`);
}

export function render(md: string, cover: CoverMode): Rendered {
  const toc: Heading[] = [];
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      heading(text: string, level: number, raw: string) {
        const id = slug(strip(raw));
        if (level === 2) toc.push({ id, text: strip(raw) });
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      table(header: string, body: string) {
        return `<div class="tw${cover === 'blocks' ? ' cvb' : ''}"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
      },
      tablecell(content: string, flags: { header: boolean; align: 'center' | 'left' | 'right' | null }) {
        const tag = flags.header ? 'th' : 'td';
        const align = flags.align ? ` align="${flags.align}"` : '';
        if (cover === 'values' && !flags.header && content.includes('class="cv"')) {
          // one covered value per cell, so Cover never leaves half a value showing
          const srcs = (content.match(/<span class="src">.*?<\/span>/g) ?? []).join('');
          const body = content
            .replace(/<span class="src">.*?<\/span>/g, '')
            .replace(/<span class="cv">([\s\S]*?)<\/span>/g, '$1')
            .trim();
          return `<${tag}${align}><span class="cv">${body}</span>${srcs}</${tag}>\n`;
        }
        return `<${tag}${align}>${content}</${tag}>\n`;
      },
      blockquote(quote: string) {
        const m = quote.match(/^\s*<p><strong>([^<:]+)/);
        const label = (m?.[1] ?? '').toLowerCase();
        const kind = label.startsWith('conflict') ? 'warn' : label.startsWith('check') ? 'check' : 'note';
        return `<blockquote class="callout ${kind}">${quote}</blockquote>\n`;
      },
      list(body: string, ordered: boolean, start: number | '') {
        const tag = ordered ? 'ol' : 'ul';
        const attr = ordered && start !== 1 && start !== '' ? ` start="${start}"` : '';
        const inner = body.replace(/<div class="cvb">([\s\S]*?)<\/div>/g, '$1');
        const list = `<${tag}${attr}>${inner}</${tag}>`;
        return cover === 'blocks' ? `<div class="cvb">${list}</div>\n` : `${list}\n`;
      },
    },
  });
  // Inline syntax runs on the Markdown text; marked leaves the resulting inline HTML alone.
  const html = marked.parse(inline(md), { async: false }) as string;
  return { html, toc };
}