# Sim Pack

B737-800 recurrent study pack. A small offline PWA that shows your own notes as clean reading pages.

- **Memorise** pages (Limitations, AWOPS, Memory Items) have a **Cover** toggle that hides the values so you can test yourself.
- **Sources** toggle shows where each value came from.
- Mark pages as read. Progress lives on the device.

## Edit content

Each page is one Markdown file in `content/`, with a small header:

```
---
id: limits
title: Limitations
group: memorise      # memorise | reference | review
order: 1
cover: values        # none | values | blocks
summary: One line shown on the home screen.
---
```

Page syntax on top of Markdown:

| Write | Result |
|---|---|
| `==10 kt==` | A value that Cover mode hides until tapped |
| `[#]` | Red badge for an FCOM memory item |
| `{FCOM L.10.2}` | Small source tag, shown when Sources is on |
| `> **Conflict:** ...` | Amber callout (also `Check`, `Note`) |
| `cover: blocks` | In the page header: every list becomes one tap-to-reveal block |

## Commands

```
npm install
npm run pack      # content/*.md -> pack/notes.json
npm run dev       # local preview
npm test
npm run build     # production build in dist/
```

## Keeping manual content private

`content/`, `pack/` and `sources/` are git-ignored. Only the app code goes to GitHub. Publish `dist/`, then on the iPad open the app and import `pack/notes.json` once (Settings, or the first screen). The notes are stored on the device and work offline.
