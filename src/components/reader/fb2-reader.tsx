'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Volume2, VolumeX, Clock, Edit3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBookStore, type Book, calculateReadingTime } from '@/lib/book-store';
import { getFile } from '@/lib/file-storage';
import { toast } from 'sonner';

import { NotesPanel } from '@/components/panels/notes-panel';
import { useTTS } from '@/hooks/use-tts';

export const FB2Reader = ({ book, onClose, onProgress }: { book: Book; onClose: () => void; onProgress: (progress: number, location: string, page?: number) => void }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(book.progress);
  const contentRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  // Echte Fortschrittsverfolgung für die Reading-Session (statt hartkodierter 1)
  const startProgressRef = useRef((book.progress || 0) / 100);
  const currentProgressRef = useRef((book.progress || 0) / 100);
  const contentLengthRef = useRef(0);
  const { settings, addBookmark, getBookmarks, removeBookmark, startReadingSession, endReadingSession } = useBookStore();
  const [showNotes, setShowNotes] = useState(false);
  const tts = useTTS();

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

  // Parse FB2 file
  useEffect(() => {
    const parseFB2 = async () => {
      try {
        // Buchdatei aus dem Store oder IndexedDB laden
        const source = book.file || (await getFile(book.id)) || '';
        if (!source) {
          setContent('<p>Buchdatei nicht gefunden (IndexedDB leer oder Migration ausstehend)</p>');
          return;
        }
        let xmlContent = '';

        // Handle base64 data
        if (source.includes(',')) {
          const base64Data = source.split(',')[1];
          // Check if it's base64 encoded
          if (source.startsWith('data:')) {
            const binaryData = atob(base64Data);
            // Convert to UTF-8
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            xmlContent = new TextDecoder('utf-8').decode(bytes);
          } else {
            xmlContent = new TextDecoder('utf-8').decode(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
          }
        } else {
          xmlContent = source;
        }

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        // Get title
        const titleEl = xmlDoc.querySelector('book-title');
        if (titleEl) setTitle(titleEl.textContent || book.title);

        // Get author
        const authorEl = xmlDoc.querySelector('author');
        if (authorEl) {
          const firstName = authorEl.querySelector('first-name')?.textContent || '';
          const lastName = authorEl.querySelector('last-name')?.textContent || '';
          setAuthor(`${firstName} ${lastName}`.trim());
        }

        // Get cover image
        const coverEl = xmlDoc.querySelector('coverpage image');
        if (coverEl) {
          const binaryId = coverEl.getAttribute('l:href')?.replace('#', '');
          if (binaryId) {
            const binaryEl = xmlDoc.querySelector(`binary[id="${binaryId}"]`);
            if (binaryEl) {
              setCover(`data:image/jpeg;base64,${binaryEl.textContent}`);
            }
          }
        }

        // Get body content
        const bodyEl = xmlDoc.querySelector('body');
        if (bodyEl) {
          // Convert FB2 elements to HTML
          let html = '';
          
          // Process sections
          const sections = bodyEl.querySelectorAll(':scope > section');
          if (sections.length > 0) {
            sections.forEach(section => {
              html += processFB2Section(section);
            });
          } else {
            html = processFB2Section(bodyEl);
          }
          
          setContent(html);
          contentLengthRef.current = html.length;
        }
      } catch (error) {
        console.error('Error parsing FB2:', error);
        setContent('<p>Fehler beim Laden der FB2-Datei</p>');
      }
    };

    const processFB2Section = (section: Element): string => {
      let html = '';
      
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        let content = '';
        el.childNodes.forEach(child => {
          content += processNode(child);
        });

        switch (tagName) {
          case 'p':
            return `<p>${content}</p>`;
          case 'title':
          case 'subtitle':
            return `<h2 class="text-xl font-bold my-4">${content}</h2>`;
          case 'section':
            return `<section class="mb-8">${content}</section>`;
          case 'epigraph':
            return `<blockquote class="italic border-l-4 pl-4 my-4">${content}</blockquote>`;
          case 'poem':
            return `<div class="poem my-4">${content}</div>`;
          case 'stanza':
            return `<div class="stanza mb-4">${content}</div>`;
          case 'v':
            return `<p class="verse">${content}</p>`;
          case 'text-author':
            return `<p class="text-author italic text-right">${content}</p>`;
          case 'date':
            return `<span class="text-muted-foreground">${content}</span>`;
          case 'strong':
          case 'b':
            return `<strong>${content}</strong>`;
          case 'emphasis':
          case 'i':
            return `<em>${content}</em>`;
          case 'strikethrough':
            return `<del>${content}</del>`;
          case 'sub':
            return `<sub>${content}</sub>`;
          case 'sup':
            return `<sup>${content}</sup>`;
          case 'code':
            return `<code class="bg-muted px-1 rounded">${content}</code>`;
          case 'image':
            const href = el.getAttribute('l:href') || el.getAttribute('href');
            if (href) {
              return `<img src="${href}" alt="" class="max-w-full my-4" />`;
            }
            return '';
          case 'empty-line':
            return '<br />';
          case 'a':
            const linkHref = el.getAttribute('l:href') || el.getAttribute('href');
            return `<a href="${linkHref}" class="text-primary underline">${content}</a>`;
          case 'cite':
            return `<cite class="block italic my-2">${content}</cite>`;
          default:
            return content;
        }
      };

      section.childNodes.forEach(child => {
        html += processNode(child);
      });

      return html;
    };

    parseFB2();
  }, [book.file]);

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
  };

  const toggleBookmark = () => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop.toString();
    const existing = getBookmarks(book.id).find(b => b.location === scrollTop);
    if (existing) { removeBookmark(existing.id); toast.success('Entfernt'); }
    else { addBookmark({ bookId: book.id, title: `${Math.round(scrollProgress)}%`, location: scrollTop }); toast.success('Lesezeichen gesetzt'); }
  };

  const fontFamily = settings.dyslexiaFont ? 'OpenDyslexic, sans-serif' : settings.fontFamily;
  const readingTime = `${calculateReadingTime(content.replace(/<[^>]*>/g, '').split(/\s+/).length)} min`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <AnimatePresence>
        {showMenu && (
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b z-10">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            <div className="flex-1 text-center px-2">
              <h2 className="font-semibold truncate text-sm">{title || book.title}</h2>
              {author && <p className="text-xs text-muted-foreground">{author}</p>}
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">⏱️ {readingTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(content.replace(/<[^>]*>/g, '').substring(0, 5000))}>{tts.isSpeaking ? <VolumeX className="w-5 h-5 text-amber-500" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Button variant="ghost" size="icon" onClick={toggleBookmark}><Bookmark className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setShowNotes(true)}><Edit3 className="w-5 h-5" /></Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div ref={contentRef} onScroll={handleScroll} onClick={() => setShowMenu(!showMenu)} className="flex-1 overflow-y-auto" style={{ padding: settings.marginSize === 'small' ? '20px' : settings.marginSize === 'large' ? '40px' : '30px' }}>
        <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight, fontFamily, textAlign: settings.textAlign, whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '800px', margin: '0 auto' }}>
          {cover && <img src={cover} alt="Cover" className="max-w-full mb-8 mx-auto" />}
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-center gap-4 p-4 bg-background/95 backdrop-blur border-t">
            <Progress value={scrollProgress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{Math.round(scrollProgress)}%</span>
          </motion.footer>
        )}
      </AnimatePresence>

      <NotesPanel book={book} open={showNotes} onOpenChange={setShowNotes} />
    </div>
  );
};
