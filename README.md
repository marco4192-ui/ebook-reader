# eBook Reader Pro

Ein **lokaler**, offline-fähiger E-Book-Reader als PWA mit zwei Deploy-Varianten:

| Variante | Enthält | Deployment |
| --- | --- | --- |
| **Server** (standalone) | Alle Funktionen inkl. KI-API-Routen (Zusammenfassung, Chat, Übersetzung, Analyse, Quiz, Auto-Tagging, RSS-Abruf, Wikipedia …) | Vercel / eigener Server |
| **Statisch** (Export) | Bibliothek, alle Reader, TTS, Statistiken – **ohne** Server-Funktionen; die App zeigt dazu beim Start einen ehrlichen Hinweis-Banner | GitHub Pages / Capacitor (Android/iOS) |

> **Ehrlichkeits-Prinzip:** Funktionen, die (noch) nicht existieren, werden als
> „Geplante Funktion“ markiert (`src/components/future-feature-notice.tsx`) –
> es werden keine Schein-Erfolge („Verbunden!“, „E-Mail gesendet!“) angezeigt.

## Funktionen (funktionieren vollständig lokal)

- **Formate:** EPUB, PDF, TXT, MD, MOBI/AZW3 (als Text), FB2, CBZ (ZIP) – Comics als CBR/CB7/CBT/ACV über libarchive (sofern der Browser das Archiv entpacken kann)
- **Bibliothek:** Suche, Tags (manuell + KI-Auto-Tagging*), Smart Shelves, Lesezeichen, Markierungen, Notizen, Lesezeichen-Ordner
- **Reader:** Fortschritt pro Buch, echte Seitenzählung (PDF: Seiten, EPUB: Locations, Text/FB2: Länge-basiert, Comics: Bildseiten), Nacht-/Sepia-Modus, Dyslexie-Font
- **Statistiken:** Streak, Heatmap, Lesegeschwindigkeit, Leseziele, Erfolge
- **TTS** (Sprachausgabe) über die Web Speech API
- **Datenschutz:** Daten liegen ausschließlich lokal (IndexedDB + localStorage), Export/Import als JSON, GDPR-Export
- **PWA:** Service Worker, Manifest, Installation auf dem Homescreen

\* KI-Funktionen benötigen die **Server-Version**; in der statischen Variante erscheint eine Fehlermeldung bzw. der Hinweis-Banner.

## Geplante Funktionen (bewusst als „Geplant“ markiert)

Diese Features existieren **nicht** und tun nur so, als ob: Cloud-Sync
(Google Drive/Dropbox/OneDrive), Goodreads-Sync, Calibre-Sync,
Pocket/Instapaper-Import, Notion/Obsidian-Direktexport (Markdown-Export
funktioniert), Spotify-Integration, Wöchentlicher Digest per E-Mail,
Book-Clubs/Buddy-Reading (soziale Features ohne Backend), Lese-Challenge-Battles.

## Entwicklung

```bash
npm install
npm run dev            # Entwicklung (http://localhost:3000)
npm run typecheck      # TypeScript-Prüfung (strikt)
npm run lint           # ESLint
npm run build          # Server-Build (standalone, mit API-Routen)
npm run start          # Server-Build starten (node)
npm run build:static   # Statischer Export nach ./out/ (API-Routen werden
                       # temporär entfernt und danach wiederhergestellt)
```

### Umgebungsvariablen (Server-Variante)

Die KI-API-Routen nutzen `z-ai-web-dev-sdk` und benötigen die entsprechende
Konfiguration (siehe `src/app/api/*/route.ts`). Die statische Variante
funktioniert ohne jede Konfiguration.

### Architektur-Notiz

Der Code basiert auf einem Monolithen (`src/app/page.tsx`, ~10.000 Zeilen),
der bewusst noch nicht aufgeteilt wurde. Der statische Export und der
Server-Build teilen sich eine `next.config.ts`, die per Umgebungsvariable
`NEXT_PUBLIC_STATIC_EXPORT` zwischen `output: 'export'` und
`output: 'standalone'` verzweigt. PDF.js-Worker wird lokal aus `/public`
ausgeliefert (kein CDN, versionsstabil).

## Projektstruktur

```
src/
  app/
    page.tsx          # Monolith: UI, Reader, Panels
    layout.tsx        # Root-Layout, PWA-Header (relative Pfade)
    api/              # 15 Server-Routen (nur Server-Variante)
  components/
    ui/               # Genutzte shadcn/ui-Komponenten (13)
    future-feature-notice.tsx  # „Geplante Funktion“-Hinweis
  lib/
    book-store.ts     # Zustand-Store (persist + IndexedDB-Hydratation)
    file-storage.ts   # IndexedDB-Dateispeicher (localStorage bleibt klein)
    encryption.ts     # Web-Crypto-Helfer
public/
  sw.js               # Service Worker (relative Pfade)
  manifest.json       # PWA-Manifest (relative Pfade)
  pdf.worker.min.mjs  # Lokaler PDF.js-Worker
scripts/
  build-static.sh     # Statischer Build mit API-Backup/-Restore
```

## Bekannte Grenzen

- CBR/CB7/CBT/ACV-Comics: Das Entpacken erfolgt über `libarchive.js` im Browser; Fehlschläge werden als Fehlermeldung angezeigt (kein Still-Return).
- MOBI/AZW3 werden als einfacher Text angezeigt, DJVU wird noch nicht unterstützt (eigene Hinweisansicht im Reader).
- Die sozialen Features sind ohne Backend nicht funktional und deshalb entfernt bzw. als „geplant“ markiert.
