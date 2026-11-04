import { describe, expect, it } from 'vitest';
import { render } from '../src/markdown';

describe('render', () => {
  it('turns ==x== into a cover span and [#] into a memory badge', () => {
    const { html } = render('| A | B |\n|---|---|\n| Tailwind [#] | ==10 kt== |', 'values');
    expect(html).toContain('<span class="cv">10 kt</span>');
    expect(html).toContain('class="mem"');
    expect(html).toContain('<div class="tw">');
  });
  it('shows source tags as spans', () => {
    expect(render('Text {FCOM L.10.2}', 'none').html).toContain('<span class="src">FCOM L.10.2</span>');
  });
  it('builds a table of contents from h2 headings and strips tags from the text', () => {
    const { toc } = render('## Limits {FCOM x}\n\ntext\n\n## Fuel\n\ntext', 'none');
    expect(toc).toEqual([{ id: 'limits', text: 'Limits' }, { id: 'fuel', text: 'Fuel' }]);
  });
  it('wraps each top-level list once in blocks mode, nested lists included', () => {
    const { html } = render('1. one\n2. two\n   - sub\n   - sub2\n3. three', 'blocks');
    expect(html.match(/class="cvb"/g)?.length).toBe(1);
    expect(render('- a\n- b', 'values').html).not.toContain('cvb');
    expect(render('| a | b |\n|---|---|\n| 1 | 2 |', 'blocks').html).toContain('class="tw cvb"');
  });
  it('classifies callouts', () => {
    expect(render('> **Conflict:** x', 'none').html).toContain('callout warn');
    expect(render('> **Check:** x', 'none').html).toContain('callout check');
    expect(render('> **Note:** x', 'none').html).toContain('callout note');
  });

  it('covers a whole table cell as one value in values mode', () => {
    const { html } = render('| A | B |\n|---|---|\n| x | ==1==, whichever is lower {FCOM L.1} |', 'values');
    expect(html).toContain('<span class="cv">1, whichever is lower</span><span class="src">FCOM L.1</span>');
  });
});