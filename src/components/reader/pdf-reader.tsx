'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  BookmarkCheck,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBookStore, type Book } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { toast } from 'sonner';

export const PDFReader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const sessionIdRef = useRef<string>('');
  const { settings, addBookmark, getBookmarks, removeBookmark, startReadingSession, endReadingSession } = useBookStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [renderedPages, setRenderedPages] = useState<Map<number, string>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Echte Seitenverfolgung für die Reading-Session (statt hartkodierter 1)
  const startPageRef = useRef(1);
  const maxPageRef = useRef(1);

  // Start reading session
  useEffect(() => {
    sessionIdRef.current = startReadingSession(book.id);
    // Startseite aus dem gespeicherten Fortschritt wiederherstellen
    const saved = parseInt(book.currentLocation || '', 10);
    startPageRef.current = !isNaN(saved) && saved > 0 ? saved : 1;
    maxPageRef.current = startPageRef.current;
    return () => {
      if (sessionIdRef.current) {
        // Tatsächlich gelesene Seiten = höchste erreichte Seite − Startseite + 1
        const pagesRead = Math.max(1, maxPageRef.current - startPageRef.current + 1);
        endReadingSession(sessionIdRef.current, pagesRead);
      }
    };
  }, [book.id]);

  // Höchste erreichte Seite verfolgen
  useEffect(() => {
    maxPageRef.current = Math.max(maxPageRef.current, currentPage);
  }, [currentPage]);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Dynamic import of pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker path – lokal gehostet statt CDN (das CDN lieferte 404,
        // relative URL funktioniert sowohl im Server- als auch im GitHub-Pages-Build)
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

        // Buchdatei aus dem Store oder IndexedDB laden
        const file = book.file || (await getFile(book.id)) || '';
        if (!file) {
          setError('Buchdatei nicht gefunden (IndexedDB leer oder Migration ausstehend)');
          setLoading(false);
          return;
        }

        let pdfData: any;

        if (file.startsWith('data:')) {
          // Data URL - convert to Uint8Array
          const base64 = file.split(',')[1];
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfData = bytes;
        } else {
          // URL
          pdfData = file;
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        
        // Set initial page from book progress
        if (book.currentLocation) {
          const savedPage = parseInt(book.currentLocation);
          if (!isNaN(savedPage) && savedPage > 0 && savedPage <= pdf.numPages) {
            setCurrentPage(savedPage);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('PDF loading error:', err);
        setError(err?.message || 'Fehler beim Laden des PDF');
        setLoading(false);
      }
    };
    
    loadPDF();
  }, [book.file, book.currentLocation]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current || !canvasRef.current) return;
      
      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const viewport = page.getViewport({ scale: scale * window.devicePixelRatio });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
        canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Update progress
        const progress = (currentPage / totalPages) * 100;
        onProgress(progress, currentPage.toString(), currentPage);
        
      } catch (err) {
        console.error('Page render error:', err);
      }
    };
    
    renderPage();
  }, [currentPage, scale, totalPages, onProgress]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goNext = () => goToPage(currentPage + 1);
  const goPrev = () => goToPage(currentPage - 1);

  const toggleBookmark = () => {
    const existing = getBookmarks(book.id).find(b => b.location === currentPage.toString());
    if (existing) {
      removeBookmark(existing.id);
      toast.success('Lesezeichen entfernt');
    } else {
      addBookmark({ bookId: book.id, title: `Seite ${currentPage}`, location: currentPage.toString() });
      toast.success('Lesezeichen gesetzt');
    }
  };

  const isBookmarked = getBookmarks(book.id).some(b => b.location === currentPage.toString());

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-muted-foreground">PDF wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Fehler beim Laden</h2>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <Button onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Schließen
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" onClick={() => setShowMenu(!showMenu)}>
      {/* Header */}
      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{book.title}</h2>
              <p className="text-xs text-muted-foreground">Seite {currentPage} von {totalPages}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.25))}><ZoomOut className="w-5 h-5" /></Button>
              <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.25))}><ZoomIn className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}>
                {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/30">
        <canvas ref={canvasRef} className="shadow-lg" />
        
        {/* Navigation Areas */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} />
      </div>

      {/* Footer */}
      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Button variant="ghost" size="lg" onClick={goPrev} disabled={currentPage <= 1}><ChevronLeft className="w-6 h-6" /></Button>
            <div className="flex-1 flex items-center gap-2">
              <Progress value={(currentPage / totalPages) * 100} className="h-2" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{currentPage}/{totalPages}</span>
            </div>
            <Button variant="ghost" size="lg" onClick={goNext} disabled={currentPage >= totalPages}><ChevronRight className="w-6 h-6" /></Button>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
};
