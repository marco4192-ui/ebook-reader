'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookIcon,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  BookmarkCheck,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Columns,
  Rows,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useBookStore, type Book } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { toast } from 'sonner';

export const ComicReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isManga, setIsManga] = useState(book.isManga || false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  // Echte Seitenverfolgung für die Reading-Session (statt hartkodierter 1)
  const maxPageRef = useRef(0);
  const { settings, updateSettings, startReadingSession, endReadingSession, addBookmark, getBookmarks, removeBookmark } = useBookStore();

  // Start reading session
  useEffect(() => {
    sessionIdRef.current = startReadingSession(book.id);
    maxPageRef.current = 0;
    return () => {
      if (sessionIdRef.current) {
        // Tatsächlich gelesene Comic-Seiten (0-basiert) + 1
        const pagesRead = maxPageRef.current + 1;
        endReadingSession(sessionIdRef.current, pagesRead);
      }
    };
  }, [book.id]);

  // Höchste erreichte Seite verfolgen (0-basiert)
  useEffect(() => {
    maxPageRef.current = Math.max(maxPageRef.current, currentPage);
  }, [currentPage]);

  // Load comic pages from various archive formats
  useEffect(() => {
    const loadComic = async () => {
      setLoading(true);
      setLoadingProgress(0);
      try {
        // Buchdatei aus dem Store oder IndexedDB laden
        const source = book.file || (await getFile(book.id)) || '';
        if (!source) {
          setError('Buchdatei nicht gefunden (IndexedDB leer oder Migration ausstehend)');
          toast.error('Buchdatei nicht gefunden – bitte Buch erneut hinzufügen');
          setLoading(false);
          return;
        }
        // Extract base64 data
        const base64Data = source.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }

        const imageFiles: string[] = [];
        const format = book.format;

        // Helper function to sort files naturally
        const sortFiles = (names: string[]) => {
          return names.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b, undefined, { numeric: true });
          });
        };

        // Helper to check if file is an image
        const isImage = (name: string) => 
          /\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i.test(name) && 
          !name.startsWith('__MACOSX') && 
          !name.startsWith('.');

        if (format === 'cbz') {
          // CBZ = ZIP format
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(bytes);
          
          const fileNames = sortFiles(Object.keys(zip.files).filter(isImage));
          
          let loaded = 0;
          for (const fileName of fileNames) {
            const file = zip.files[fileName];
            const blob = await file.async('blob');
            const url = URL.createObjectURL(blob);
            imageFiles.push(url);
            loaded++;
            setLoadingProgress(Math.round((loaded / fileNames.length) * 50));
          }
        } else if (format === 'cbr' || format === 'cb7' || format === 'cbt' || format === 'acv') {
          // CBR = RAR, CB7 = 7z, CBT = TAR, ACV = various
          // Use libarchive.js for these formats
          try {
            const { Archive } = await import('libarchive.js');
            // libarchive.js erwartet ein File-Objekt, keinen rohen Uint8Array
            const archive = await Archive.open(new File([bytes], `${book.title || 'comic'}.${format}`, { type: 'application/octet-stream' }));
            const extractedFiles = await archive.extractFiles();
            
            const fileNames = sortFiles(Object.keys(extractedFiles).filter(isImage));
            
            let loaded = 0;
            for (const fileName of fileNames) {
              const file = extractedFiles[fileName];
              if (file && file.extracted) {
                const url = URL.createObjectURL(file.extracted);
                imageFiles.push(url);
              }
              loaded++;
              setLoadingProgress(Math.round((loaded / fileNames.length) * 50));
            }
          } catch (archiveError) {
            console.error('Archive extraction failed, trying JSZip fallback:', archiveError);
            // Fallback to JSZip for formats that might be misnamed
            const JSZip = (await import('jszip')).default;
            try {
              const zip = await JSZip.loadAsync(bytes);
              const fileNames = sortFiles(Object.keys(zip.files).filter(isImage));
              
              for (const fileName of fileNames) {
                const file = zip.files[fileName];
                const blob = await file.async('blob');
                const url = URL.createObjectURL(blob);
                imageFiles.push(url);
              }
            } catch {
              toast.error('Format wird noch nicht vollständig unterstützt');
            }
          }
        }

        setPages(imageFiles);
        setLoadingProgress(100);
        
        // Restore last page
        if (book.currentLocation) {
          const lastPage = parseInt(book.currentLocation);
          if (!isNaN(lastPage) && lastPage >= 0 && lastPage < imageFiles.length) {
            setCurrentPage(lastPage);
          }
        }
      } catch (error) {
        console.error('Error loading comic:', error);
        toast.error('Fehler beim Laden des Comics');
      }
      setLoading(false);
    };

    loadComic();

    return () => {
      // Cleanup blob URLs
      pages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [book.file, book.format]);

  // Update progress
  useEffect(() => {
    if (pages.length > 0) {
      const progress = ((currentPage + 1) / pages.length) * 100;
      onProgress(progress, currentPage.toString(), currentPage + 1);
    }
  }, [currentPage, pages.length]);

  // Navigation
  const goNext = () => {
    if (isManga) {
      setCurrentPage(p => Math.max(0, p - 1));
    } else {
      setCurrentPage(p => Math.min(pages.length - 1, p + 1));
    }
  };

  const goPrev = () => {
    if (isManga) {
      setCurrentPage(p => Math.min(pages.length - 1, p + 1));
    } else {
      setCurrentPage(p => Math.max(0, p - 1));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          goPrev();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isManga, isFullscreen]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleBookmark = () => {
    const existing = getBookmarks(book.id).find(b => b.location === currentPage.toString());
    if (existing) {
      removeBookmark(existing.id);
      toast.success('Lesezeichen entfernt');
    } else {
      addBookmark({ bookId: book.id, title: `Seite ${currentPage + 1}`, location: currentPage.toString(), page: currentPage + 1 });
      toast.success('Lesezeichen gesetzt');
    }
  };

  const isBookmarked = getBookmarks(book.id).some(b => b.location === currentPage.toString());

  // View mode rendering
  const renderPage = () => {
    const fitStyle: React.CSSProperties = {
      objectFit: settings.comicFitMode === 'fit-width' ? 'contain' :
                 settings.comicFitMode === 'fit-height' ? 'contain' :
                 settings.comicFitMode === 'fit-screen' ? 'contain' : 'none',
      width: settings.comicFitMode === 'fit-width' ? '100%' : 'auto',
      height: settings.comicFitMode === 'fit-height' ? '100%' : 'auto',
      maxWidth: settings.comicFitMode !== 'original' ? '100%' : 'none',
      maxHeight: settings.comicFitMode !== 'original' ? '100vh' : 'none',
      transform: `scale(${zoom})`,
      transformOrigin: 'center center',
    };

    if (settings.comicViewMode === 'vertical' || settings.comicViewMode === 'webtoon') {
      return (
        <div className="flex flex-col items-center overflow-y-auto h-full" style={{ gap: settings.comicViewMode === 'webtoon' ? '0' : '20px' }}>
          {pages.map((page, index) => (
            <img key={index} src={page} alt={`Seite ${index + 1}`} className="max-w-full" loading="lazy" />
          ))}
        </div>
      );
    }

    if (settings.comicViewMode === 'double' && currentPage < pages.length - 1) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <img src={isManga ? pages[currentPage + 1] : pages[currentPage]} alt="" style={fitStyle} className="mr-0.5" />
          <img src={isManga ? pages[currentPage] : pages[currentPage + 1]} alt="" style={fitStyle} className="ml-0.5" />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full w-full">
        <img src={pages[currentPage]} alt={`Seite ${currentPage + 1}`} style={fitStyle} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground mb-2">Lade Comic...</p>
        {loadingProgress > 0 && (
          <div className="w-48">
            <Progress value={loadingProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1">{loadingProgress}%</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setShowMenu(!showMenu)}>
      {/* Menu Header */}
      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-black/90 backdrop-blur z-10">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white"><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm text-white">{book.title}</h2>
              <p className="text-xs text-gray-400">Seite {currentPage + 1} von {pages.length}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-white"><ZoomOut className="w-5 h-5" /></Button>
              <span className="text-white text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-white"><ZoomIn className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white"><Maximize className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark} className="text-white">{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-white"><Settings className="w-5 h-5" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {renderPage()}
        
        {/* Navigation Areas */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} />
      </div>

      {/* Menu Footer */}
      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center gap-4 p-4 bg-black/90 backdrop-blur">
            <Button variant="ghost" size="lg" onClick={goPrev} className="text-white"><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={pages.length - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm">{currentPage + 1}/{pages.length}</span>
            </div>
            <Button variant="ghost" size="lg" onClick={goNext} className="text-white"><ChevronRight className="w-6 h-6" /></Button>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Comic-Einstellungen</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ansichtsmodus</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'single', label: 'Einzelseite', icon: <BookIcon className="w-4 h-4" /> },
                  { value: 'double', label: 'Doppelseite', icon: <Columns className="w-4 h-4" /> },
                  { value: 'vertical', label: 'Vertikal', icon: <Rows className="w-4 h-4" /> },
                  { value: 'webtoon', label: 'Webtoon', icon: <Rows className="w-4 h-4" /> },
                ].map((mode) => (
                  <Button key={mode.value} variant={settings.comicViewMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ comicViewMode: mode.value as any })} className="flex items-center gap-2">
                    {mode.icon}
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Leserichtung</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={settings.comicReadingDirection === 'ltr' ? 'default' : 'outline'} size="sm" onClick={() => { updateSettings({ comicReadingDirection: 'ltr' }); setIsManga(false); }} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Links → Rechts (Comic)
                </Button>
                <Button variant={settings.comicReadingDirection === 'rtl' ? 'default' : 'outline'} size="sm" onClick={() => { updateSettings({ comicReadingDirection: 'rtl' }); setIsManga(true); }} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Rechts → Links (Manga)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Bildanpassung</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'fit-width', label: 'Breite anpassen' },
                  { value: 'fit-height', label: 'Höhe anpassen' },
                  { value: 'fit-screen', label: 'Bildschirm anpassen' },
                  { value: 'original', label: 'Originalgröße' },
                ].map((mode) => (
                  <Button key={mode.value} variant={settings.comicFitMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ comicFitMode: mode.value as any })}>
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</Label>
              <Slider value={[zoom * 100]} onValueChange={([value]) => setZoom(value / 100)} min={50} max={300} step={25} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
