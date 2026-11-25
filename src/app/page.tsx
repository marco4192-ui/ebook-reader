'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookIcon, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBookStore, type Book } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { FutureFeatureNotice } from '@/components/future-feature-notice';
import { PWAInstallPrompt } from '@/components/pwa-install';

import { LibraryView } from '@/components/library/library-view';
import { ComicReader } from '@/components/reader/comic-reader';
import { EPUBReader } from '@/components/reader/epub-reader';
import { FB2Reader } from '@/components/reader/fb2-reader';
import { PDFReader } from '@/components/reader/pdf-reader';
import { TextReader } from '@/components/reader/text-reader';
import { dyslexiaFontStyle } from '@/lib/reading/reading-styles';

export default function Page() {
  const [view, setView] = useState<'library' | 'reader'>('library');
  const { currentBook, setCurrentBook, updateProgress, settings } = useBookStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  // Gate: erst rendern, wenn der Dateispeicher (IndexedDB) bereit ist –
  // verhindert White-Screens beim Buchöffnen in frisch geladenen Tabs
  const [filesReady, setFilesReady] = useState(false);
  // Ehrlicher Hinweis im statischen Build (GitHub Pages): API-Routen fehlen dort
  const isStaticBuild = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { await getFile('__probe__'); } catch { /* In-Memory-Fallback aktiv */ }
      if (!cancelled) setFilesReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenBook = (book: Book) => { setCurrentBook(book); setView('reader'); };
  const handleCloseReader = () => { setCurrentBook(null); setView('library'); };
  const handleProgress = (progress: number, location: string, page?: number) => { if (currentBook) updateProgress(currentBook.id, progress, location, page); };

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings.theme]);

  return (
    <main className={`min-h-screen ${settings.theme === 'sepia' ? 'bg-amber-50 text-amber-900' : ''}`}>
      {settings.dyslexiaFont && <style jsx global>{dyslexiaFontStyle}</style>}
      {isStaticBuild && (
        <div className="px-4 pt-3">
          <FutureFeatureNotice
            title="Statischer Build (GitHub Pages)"
            description="Dieser Build läuft ohne Server: KI-Funktionen (Quiz, Zusammenfassung, Analyse, Chat), Cloud-Sync und Export-Dienste sind hier nicht verfügbar und werden als geplante Funktionen gekennzeichnet. Bibliothek, Reader und Offline-Speicher funktionieren vollständig."
          />
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === 'library' ? (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LibraryView onOpenBook={handleOpenBook} />
          </motion.div>
        ) : (
          <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!filesReady ? (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Buchspeicher wird geöffnet…</p>
              </div>
            ) : (
              <>
            {currentBook?.format === 'epub' && <EPUBReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {currentBook?.format === 'pdf' && <PDFReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {(currentBook?.format === 'txt' || currentBook?.format === 'md') && <TextReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {(currentBook?.format === 'cbz' || currentBook?.format === 'cbr' || currentBook?.format === 'cb7' || currentBook?.format === 'cbt' || currentBook?.format === 'acv') && <ComicReader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {(currentBook?.format === 'mobi' || currentBook?.format === 'azw3') && (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                  <CardContent className="p-6 text-center">
                    <BookIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{currentBook.format.toUpperCase()} Format</h2>
                    <p className="text-muted-foreground mb-4">
                      {currentBook.format === 'azw3' ? 'Kindle AZW3-Format' : 'Mobipocket-Format'} wird als Text angezeigt.
                    </p>
                    <TextReader book={{...currentBook, format: 'txt'}} onClose={handleCloseReader} onProgress={handleProgress} />
                  </CardContent>
                </Card>
              </div>
            )}
            {currentBook?.format === 'fb2' && <FB2Reader book={currentBook} onClose={handleCloseReader} onProgress={handleProgress} />}
            {currentBook?.format === 'djvu' && (
              <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
                <Card className="max-w-md">
                  <CardContent className="p-6 text-center">
                    <FileIcon className="w-16 h-16 mx-auto text-amber-600 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">DJVU Format</h2>
                    <p className="text-muted-foreground mb-4">
                      DJVU ist ein spezielles Dokumentenformat mit hoher Kompression. 
                      Vollständige Unterstützung folgt in einem zukünftigen Update.
                    </p>
                    <Button onClick={handleCloseReader}>Zurück zur Bibliothek</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </main>
  );
}
