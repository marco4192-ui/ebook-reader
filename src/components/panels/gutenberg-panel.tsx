'use client';

import { useState, useEffect } from 'react';
import { utf8ToBase64 } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Globe,
  RefreshCw,
  Filter,
  Grid,
  Languages,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

import { languageOptions } from '@/components/reader/translation-popup';

export const GutenbergPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['de', 'en']);
  const { addBook } = useBookStore();

  const fetchBooks = async (searchTerm: string = '', pageNum: number = 1, languages: string[] = ['de', 'en']) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), languages: languages.join(',') });
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/gutenberg?${params}`);
      const data = await response.json();
      
      setBooks(data.books || []);
      setTotalCount(data.count || 0);
    } catch {
      toast.error('Fehler beim Laden der Bücher');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchBooks('', 1, selectedLanguages);
  }, [open]);

  useEffect(() => {
    setPage(1);
    fetchBooks(search, 1, selectedLanguages);
  }, [selectedLanguages]);

  const handleSearch = () => {
    setPage(1);
    fetchBooks(search, 1, selectedLanguages);
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const downloadBook = async (book: any) => {
    toast.info(`Lade "${book.title}" herunter...`);
    try {
      // Prefer EPUB format, fallback to HTML/TXT
      const epubUrl = book.formats?.epub;
      const htmlUrl = book.formats?.html;
      const txtUrl = book.formats?.txt;
      
      // If EPUB is available, open in new tab for download
      if (epubUrl) {
        window.open(epubUrl, '_blank');
        toast.success(`"${book.title}" EPUB wird heruntergeladen. Nach dem Download öffnen Sie die Datei in der App.`);
        return;
      }
      
      // For HTML/TXT, we need to use a proxy or direct link
      if (htmlUrl || txtUrl) {
        const contentUrl = htmlUrl || txtUrl;
        
        // Try direct fetch first
        try {
          const response = await fetch(contentUrl, { mode: 'cors' });
          if (response.ok) {
            const content = await response.text();
            // Store as a data URL
            const base64 = utf8ToBase64(content);
            const dataUrl = `data:text/html;base64,${base64}`;
            addBook({ 
              title: book.title, 
              author: book.author || 'Unbekannt', 
              format: 'txt', 
              file: dataUrl, 
              fileSize: content.length, 
              cover: book.cover 
            });
            toast.success(`"${book.title}" wurde zur Bibliothek hinzugefügt!`);
            return;
          }
        } catch {
          // CORS blocked - open in new tab instead
          window.open(contentUrl, '_blank');
          toast.info(`Das Buch wird in einem neuen Tab geöffnet. Kopieren Sie den Text und fügen Sie ihn als TXT-Datei hinzu.`);
          return;
        }
      }
      
      // Fallback: Open Gutenberg page
      window.open(`https://www.gutenberg.org/ebooks/${book.id}`, '_blank');
      toast.info('Das Buch wird auf Gutenberg geöffnet. Laden Sie es dort herunter.');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download fehlgeschlagen. Öffne Gutenberg-Seite...');
      window.open(`https://www.gutenberg.org/ebooks/${book.id}`, '_blank');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Kostenlose Bücher ({totalCount.toLocaleString()} verfügbar)
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input placeholder="Bücher durchsuchen..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Languages className="w-4 h-4" />
              Sprachen filtern
            </Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <Badge
                  key={lang.code}
                  variant={selectedLanguages.includes(lang.code) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => toggleLanguage(lang.code)}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                  {selectedLanguages.includes(lang.code) && <CheckCircle className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
            {selectedLanguages.length === 0 && (
              <p className="text-xs text-muted-foreground">Wählen Sie mindestens eine Sprache</p>
            )}
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 relative">
                      {book.cover ? (
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Globe className="w-12 h-12 text-blue-500/40" /></div>
                      )}
                      {/* Language badges */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {book.languages?.slice(0, 2).map((lang: string) => {
                          const langInfo = languageOptions.find(l => l.code === lang);
                          return langInfo ? (
                            <Badge key={lang} variant="secondary" className="text-[10px] px-1">
                              {langInfo.flag} {langInfo.code.toUpperCase()}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-xs line-clamp-2">{book.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{book.author}</p>
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => downloadBook(book)}>
                        <Download className="w-3 h-3 mr-1" />Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > 32 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => { setPage(p => p - 1); fetchBooks(search, page - 1, selectedLanguages); }} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="flex items-center px-4 text-sm">Seite {page}</span>
                  <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); fetchBooks(search, page + 1, selectedLanguages); }}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
