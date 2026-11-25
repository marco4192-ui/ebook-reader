'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Clock,
  Edit3,
  Languages,
  Sparkles,
  Zap,
  MessageCircle,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBookStore, type Book, type Highlight, calculateReadingTime } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { toast } from 'sonner';

import { AIChatPanel } from '@/components/panels/ai-chat-panel';
import { AISummaryPanel } from '@/components/panels/ai-summary-panel';
import { BookAnalysisPanel } from '@/components/panels/book-analysis-panel';
import { NotesPanel } from '@/components/panels/notes-panel';
import { NightModeOverlay } from '@/components/reader/night-mode-overlay';
import { SpeedReadingPanel } from '@/components/reader/speed-reading-panel';
import { TranslationPopup } from '@/components/reader/translation-popup';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import { useTTS } from '@/hooks/use-tts';
import { applyBionicReading } from '@/lib/reading/bionic';
import { triggerHapticFeedback } from '@/lib/reading/haptics';
import { colorBlindFilters, colorBlindSVGFilters, highlightColors } from '@/lib/reading/reading-styles';

export const TextReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [content, setContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(book.progress);
  const contentRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  // Echte Fortschrittsverfolgung für die Reading-Session (statt hartkodierter 1)
  const startProgressRef = useRef((book.progress || 0) / 100);
  const currentProgressRef = useRef((book.progress || 0) / 100);
  const contentLengthRef = useRef(0);
  const { settings, addBookmark, getBookmarks, removeBookmark, addHighlight, startReadingSession, endReadingSession } = useBookStore();
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSpeedReading, setShowSpeedReading] = useState(false);
  const [showCharacterNetwork, setShowCharacterNetwork] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tts = useTTS();

  // Gesture navigation
  const goBack = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      if (settings.hapticFeedback) triggerHapticFeedback('light');
    }
  }, [settings.hapticFeedback]);

  const goForward = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      if (settings.hapticFeedback) triggerHapticFeedback('light');
    }
  }, [settings.hapticFeedback]);

  useGestureNavigation(goForward, goBack, settings.gestureNavigation);

  useEffect(() => {
    sessionIdRef.current = startReadingSession(book.id);
    startProgressRef.current = (book.progress || 0) / 100;
    currentProgressRef.current = startProgressRef.current;
    return () => {
      if (sessionIdRef.current) {
        // Gelesene Seiten ≈ Fortschritts-Differenz × geschätzte Seiten
        // (Annahme: ca. 1800 Zeichen pro Buchseite)
        const pagesRead = Math.max(1, Math.round(
          (currentProgressRef.current - startProgressRef.current) * contentLengthRef.current / 1800
        ));
        endReadingSession(sessionIdRef.current, pagesRead);
      }
    };
  }, [book.id]);

  useEffect(() => {
    const loadText = async () => {
      setLoading(true);
      setError(null);
      try {
        // Buchdatei aus dem Store oder IndexedDB laden
        const file = book.file || (await getFile(book.id)) || '';
        if (!file) {
          setError('Buchdatei nicht gefunden (IndexedDB leer oder Migration ausstehend)');
          setLoading(false);
          return;
        }
        // Handle different file formats
        if (file.startsWith('data:')) {
          // Data URL format
          const base64 = file.split(',')[1];
          if (base64) {
            // Decode base64 properly handling UTF-8
            const decoded = decodeURIComponent(atob(base64).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            contentLengthRef.current = decoded.length;
            setContent(decoded);
          } else {
            setError('Ungültiges Dateiformat');
          }
        } else {
          // Plain text
          contentLengthRef.current = file.length;
          setContent(file);
        }
      } catch (err) {
        console.error('Text loading error:', err);
        setError('Fehler beim Laden der Datei');
      }
      setLoading(false);
    };
    loadText();
  }, [book.id, book.file]);

  useEffect(() => {
    if (contentRef.current && book.currentLocation) {
      const scrollTop = parseInt(book.currentLocation);
      if (!isNaN(scrollTop)) contentRef.current.scrollTop = scrollTop;
    }
  }, [book.currentLocation]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    currentProgressRef.current = progress / 100;
    onProgress(progress, scrollTop.toString());

    // Haptic feedback on page change (scroll threshold)
    if (settings.hapticFeedback && Math.abs(scrollTop - lastScrollTop) > clientHeight * 0.5) {
      triggerHapticFeedback('light');
      setLastScrollTop(scrollTop);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setHighlightPosition({ x: rect.left, y: rect.top - 50 });
        setShowHighlightMenu(true);
      }
    } else { setShowHighlightMenu(false); }
  };

  const addHighlightWithColor = (color: Highlight['color']) => {
    if (selectedText) {
      addHighlight({ bookId: book.id, text: selectedText, color, location: scrollProgress.toString() });
      toast.success('Markiert!');
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const toggleBookmark = () => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop.toString();
    const existing = getBookmarks(book.id).find(b => b.location === scrollTop);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: `${Math.round(scrollProgress)}%`, location: scrollTop }); toast.success('Lesezeichen gesetzt'); }
  };

  const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
  const readingTime = `${calculateReadingTime(content.split(/\s+/).length)} min`;

  // Apply bionic reading if enabled
  const displayContent = useMemo(() => {
    if (settings.bionicReading && book.format !== 'md') {
      return <div dangerouslySetInnerHTML={{ __html: applyBionicReading(content) }} />;
    }
    if (book.format === 'md') {
      return <div className="prose dark:prose-invert max-w-none prose-sm"><ReactMarkdown>{content}</ReactMarkdown></div>;
    }
    return content;
  }, [content, settings.bionicReading, book.format]);

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
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">⏱️ {readingTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShowSpeedReading(true)} title="Speed Reading">
                <Zap className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAIChat(true)} title="KI-Chat"><MessageCircle className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(true)} title="Analyse"><Brain className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(content.substring(0, 5000))}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}><Bookmark className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAISummary(true)}><Sparkles className="w-5 h-5 text-amber-500" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div ref={contentRef} onScroll={handleScroll} onClick={() => setShowMenu(!showMenu)} onMouseUp={handleTextSelection} className="flex-1 overflow-y-auto" style={{ padding: settings.marginSize === 'small' ? '20px' : settings.marginSize === 'large' ? '40px' : '30px' }}>
        <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, fontFamily, textAlign: settings.textAlign, whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '800px', margin: '0 auto' }}>
          {displayContent}
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-center gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Button variant="ghost" onClick={goBack} title="Vorherige Seite">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Progress value={scrollProgress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(scrollProgress)}%</span>
            <Button variant="ghost" onClick={goForward} title="Nächste Seite">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.footer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHighlightMenu && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed z-[100] bg-popover border rounded-lg shadow-xl p-2 flex gap-1" style={{ left: highlightPosition.x, top: highlightPosition.y }}>
            {(['yellow', 'green', 'blue', 'pink', 'purple'] as const).map((color) => (
              <button key={color} onClick={() => addHighlightWithColor(color)} className={`w-8 h-8 rounded-full ${highlightColors[color]} hover:ring-2 hover:ring-primary`} />
            ))}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => tts.speak(selectedText)}><Volume2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowTranslation(true)}><Languages className="w-4 h-4" /></Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTranslation && selectedText && (
          <TranslationPopup text={selectedText} position={highlightPosition} onClose={() => setShowTranslation(false)} />
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
      {showAISummary && <AISummaryPanel text={content.substring(0, 5000)} onClose={() => setShowAISummary(false)} />}
      <AIChatPanel book={book} bookContent={content} open={showAIChat} onOpenChange={setShowAIChat} />
      <BookAnalysisPanel text={content} bookTitle={book.title} author={book.author} open={showAnalysis} onOpenChange={setShowAnalysis} />
      <SpeedReadingPanel text={content} open={showSpeedReading} onOpenChange={setShowSpeedReading} />
    </div>
  );
};
