'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Clock,
  Edit3,
  Sparkles,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBookStore, type Book, calculateReadingTime } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { toast } from 'sonner';

import { AISummaryPanel } from '@/components/panels/ai-summary-panel';
import { NotesPanel } from '@/components/panels/notes-panel';
import { NightModeOverlay } from '@/components/reader/night-mode-overlay';
import { SpeedReadingPanel } from '@/components/reader/speed-reading-panel';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import { useTTS } from '@/hooks/use-tts';
import { formatReadingTime } from '@/lib/reading/format';
import { triggerHapticFeedback } from '@/lib/reading/haptics';
import { colorBlindFilters, colorBlindSVGFilters } from '@/lib/reading/reading-styles';

export const EPUBReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);
  const { settings, addBookmark, getBookmarks, removeBookmark, addHighlight, startReadingSession, endReadingSession } = useBookStore();
  const [currentChapter, setCurrentChapter] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentCfi, setCurrentCfi] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const sessionIdRef = useRef<string>('');
  // Echte Fortschrittsverfolgung für die Reading-Session (statt hartkodierter 1)
  const startProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const totalLocationsRef = useRef(0);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showSpeedReading, setShowSpeedReading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [chapters, setChapters] = useState<{ label: string; href: string; readingTime?: number }[]>([]);
  const [currentChapterTime, setCurrentChapterTime] = useState<number | null>(null);
  const [totalReadingTime, setTotalReadingTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tts = useTTS();

  // Gesture navigation
  const goNextCallback = useCallback(() => {
    renditionRef.current?.next();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  }, [settings.hapticFeedback]);

  const goPrevCallback = useCallback(() => {
    renditionRef.current?.prev();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  }, [settings.hapticFeedback]);

  useGestureNavigation(goNextCallback, goPrevCallback, settings.gestureNavigation);

  useEffect(() => {
    sessionIdRef.current = startReadingSession(book.id);
    startProgressRef.current = (book.progress || 0) / 100;
    currentProgressRef.current = startProgressRef.current;
    return () => {
      if (sessionIdRef.current) {
        // Tatsächlich gelesene "Seiten" = Standort-Differenz × erzeugte Locations
        const pagesRead = Math.max(1, Math.round(
          totalLocationsRef.current * Math.max(0, currentProgressRef.current - startProgressRef.current)
        ));
        endReadingSession(sessionIdRef.current, pagesRead);
      }
    };
  }, [book.id]);

  useEffect(() => {
    const initEpub = async () => {
      // Wait for container to be available
      if (!containerRef.current) {
        // Retry after a short delay if container isn't ready
        setTimeout(() => {
          if (containerRef.current) {
            initEpub();
          } else {
            setError('Container nicht verfügbar');
            setLoading(false);
          }
        }, 100);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Set a timeout for loading (30 seconds)
      let loadingTimedOut = false;
      const loadingTimeout = setTimeout(() => {
        loadingTimedOut = true;
        setError('Zeitüberschreitung beim Laden');
        setLoading(false);
      }, 30000);
      
      try {
        const ePub = (await import('epubjs')).default;

        // Buchdatei aus dem Store oder IndexedDB laden
        const file = book.file || (await getFile(book.id)) || '';
        if (!file) {
          setError('Buchdatei nicht gefunden (IndexedDB leer oder Migration ausstehend)');
          setLoading(false);
          return;
        }

        const epubBook = ePub(file);
        bookRef.current = epubBook;
        
        const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
        const rendition = epubBook.renderTo(containerRef.current, { width: '100%', height: '100%', spread: 'none', flow: 'paginated' });
        renditionRef.current = rendition;
        
        rendition.themes.default({
          'body': {
            'font-family': fontFamily,
            'font-size': `${settings.fontSize}px`,
            'line-height': settings.lineHeight.toString(),
            'text-align': settings.textAlign,
            'padding': settings.marginSize === 'small' ? '10px' : settings.marginSize === 'large' ? '30px' : '20px',
          },
        });
        
        await (book.currentLocation ? rendition.display(book.currentLocation) : rendition.display());
        
        rendition.on('locationChanged', (location: any) => {
          const cfi = location.start.cfi;
          const progress = epubBook.locations.percentageFromCfi(cfi);
          if (typeof progress === 'number' && !isNaN(progress)) {
            currentProgressRef.current = progress;
          }
          setCurrentCfi(cfi);
          onProgress(progress * 100, cfi);
          setIsBookmarked(getBookmarks(book.id).some(b => b.cfi === cfi));
        });

        // Get chapter info and calculate reading time
        rendition.on('relocated', async (location: any) => {
          if (location.start?.href) {
            const nav = await epubBook.loaded.navigation;
            const chapter = nav.toc.find((t: any) => t.href === location.start.href);
            if (chapter) setCurrentChapter(chapter.label);
            
            // Calculate chapter reading time
            try {
              const section = epubBook.spine.get(location.start.href);
              if (section) {
                const contents = await section.load(epubBook.load.bind(epubBook));
                const text = contents.textContent || '';
                const wordCount = text.split(/\s+/).length;
                const readingTimeMinutes = calculateReadingTime(wordCount);
                setCurrentChapterTime(readingTimeMinutes);
              }
            } catch {
              setCurrentChapterTime(null);
            }
          }
        });

        rendition.on('selected', (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection()?.toString().trim();
          if (text) {
            addHighlight({ bookId: book.id, text, color: 'yellow', location: cfiRange, cfi: cfiRange });
            toast.success('Markiert!');
          }
        });
        
        // Load chapters and calculate reading times
        const nav = await epubBook.loaded.navigation;
        const spine = await epubBook.loaded.spine;
        
        const chaptersWithTimes = await Promise.all(
          nav.toc.map(async (item: any) => {
            try {
              const section = epubBook.spine.get(item.href);
              if (section) {
                const contents = await section.load(epubBook.load.bind(epubBook));
                const text = contents.textContent || '';
                const wordCount = text.split(/\s+/).length;
                return { label: item.label, href: item.href, readingTime: calculateReadingTime(wordCount) };
              }
            } catch {}
            return { label: item.label, href: item.href };
          })
        );
        setChapters(chaptersWithTimes);
        
        // Calculate total reading time
        const totalTime = chaptersWithTimes.reduce((acc: number, ch: any) => acc + (ch.readingTime || 0), 0);
        setTotalReadingTime(totalTime);
        
        // Locations abwarten, damit die Session-Auswertung echte Werte hat
        await epubBook.locations.generate(1024);
        totalLocationsRef.current = epubBook.locations.length() || 0;
        
        clearTimeout(loadingTimeout);
        if (!loadingTimedOut) {
          setLoading(false);
        }
      } catch (error: any) {
        clearTimeout(loadingTimeout);
        console.error('EPUB loading error:', error);
        if (!loadingTimedOut) {
          setError(error?.message || 'Fehler beim Laden des Buches');
          toast.error('Fehler beim Laden des EPUB');
          setLoading(false);
        }
      }
    };

    initEpub();
    return () => { if (bookRef.current) bookRef.current.destroy(); };
  }, [book.file, settings.dyslexiaFont]);

  const goNext = () => {
    renditionRef.current?.next();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  };
  const goPrev = () => {
    renditionRef.current?.prev();
    if (settings.hapticFeedback) triggerHapticFeedback('light');
  };

  const toggleBookmark = () => {
    if (!currentCfi) return;
    const existing = getBookmarks(book.id).find(b => b.cfi === currentCfi);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: currentChapter || book.title, location: currentCfi, cfi: currentCfi }); toast.success('Lesezeichen gesetzt'); }
    setIsBookmarked(!isBookmarked);
  };

  const handleTTS = () => {
    if (tts.isSpeaking) { tts.stop(); return; }
    const contents = renditionRef.current?.getContents()[0];
    const text = contents?.document?.body?.textContent || '';
    if (text) { setCurrentText(text); tts.speak(text.substring(0, 5000)); }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      style={{ filter: colorBlindFilters[settings.colorBlindMode] }}
    >
      {/* SVG Filters for color blind modes */}
      {settings.colorBlindMode !== 'none' && (
        <div dangerouslySetInnerHTML={{ __html: colorBlindSVGFilters }} />
      )}

      {/* Night mode overlay */}
      <NightModeOverlay enabled={settings.nightModeEnabled} intensity={settings.nightModeIntensity} />

      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{book.title}</h2>
              {currentChapter && <p className="text-xs text-muted-foreground truncate">{currentChapter}</p>}
              {/* Chapter Reading Time */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {currentChapterTime ? `Kapitel: ~${currentChapterTime} Min` : ''}
                  {totalReadingTime > 0 ? ` • Gesamt: ~${formatReadingTime(totalReadingTime)}` : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShowSpeedReading(true)} title="Speed Reading">
                <Zap className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleTTS}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}>{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAISummary(true)}><Sparkles className="w-5 h-5 text-amber-500" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-20">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-muted-foreground">Buch wird geladen...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-20 p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Fehler beim Laden</h2>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Das EPUB-Format könnte inkompatibel oder beschädigt sein.
          </p>
          <Button onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Schließen
          </Button>
        </div>
      )}

      <div className="flex-1 relative" onClick={() => setShowMenu(!showMenu)}>
        <div ref={containerRef} className="absolute inset-0" />
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} />
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Button variant="ghost" size="lg" onClick={goPrev}><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex-1 flex items-center gap-2">
              <Progress value={book.progress} className="h-2" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(book.progress)}%</span>
            </div>
            <Button variant="ghost" size="lg" onClick={goNext}><ChevronRight className="w-6 h-6" /></Button>
          </motion.footer>
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
      {showAISummary && currentText && <AISummaryPanel text={currentText} onClose={() => setShowAISummary(false)} />}
      <SpeedReadingPanel text={currentText} open={showSpeedReading} onOpenChange={setShowSpeedReading} />
    </div>
  );
};
