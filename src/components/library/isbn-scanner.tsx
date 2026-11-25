'use client';

import { useState } from 'react';
import { BookIcon, Plus, Search, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useBookStore, type Book } from '@/lib/book-store';
import { utf8ToBase64 } from '@/lib/utils';
import { toast } from 'sonner';

export const ISBNScanner = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isbn, setISBN] = useState('');
  const [searching, setSearching] = useState(false);
  const [bookInfo, setBookInfo] = useState<{
    title: string;
    author: string;
    cover?: string;
    description?: string;
    publisher?: string;
    publishedDate?: string;
  } | null>(null);

  const searchISBN = async () => {
    if (!isbn.trim()) return;
    setSearching(true);
    try {
      // Use Open Library API to look up book by ISBN
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn.trim()}&format=json&jscmd=data`);
      const data = await response.json();
      const bookData = data[`ISBN:${isbn.trim()}`];

      if (bookData) {
        setBookInfo({
          title: bookData.title || 'Unbekannter Titel',
          author: bookData.authors?.map((a: any) => a.name).join(', ') || 'Unbekannter Autor',
          cover: bookData.cover?.medium || bookData.cover?.small,
          description: bookData.notes,
          publisher: bookData.publishers?.[0]?.name,
          publishedDate: bookData.publish_date,
        });
        toast.success('Buch gefunden!');
      } else {
        toast.error('Buch nicht gefunden');
      }
    } catch {
      toast.error('Fehler bei der Suche');
    }
    setSearching(false);
  };

  const handleAddToLibrary = () => {
    if (bookInfo) {
      const { addBook } = useBookStore.getState();
      addBook({
        title: bookInfo.title,
        author: bookInfo.author,
        cover: bookInfo.cover,
        format: 'txt',
        file: `data:text/plain;base64,${utf8ToBase64(bookInfo.description || 'Keine Beschreibung verfügbar')}`,
        fileSize: (bookInfo.description || '').length,
      });
      toast.success(`"${bookInfo.title}" wurde hinzugefügt!`);
      setBookInfo(null);
      setISBN('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            ISBN-Scanner
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ISBN eingeben oder scannen..."
              value={isbn}
              onChange={(e) => setISBN(e.target.value.replace(/[^0-9X]/gi, ''))}
              onKeyDown={(e) => e.key === 'Enter' && searchISBN()}
              className="flex-1"
            />
            <Button onClick={searchISBN} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Geben Sie eine ISBN ein (z.B. 978-3-423-21458-1) oder nutzen Sie einen Barcode-Scanner.
          </p>

          {bookInfo && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {bookInfo.cover ? (
                    <img src={bookInfo.cover} alt={bookInfo.title} className="w-24 h-36 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-36 bg-muted rounded flex items-center justify-center">
                      <BookIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{bookInfo.title}</h3>
                    <p className="text-sm text-muted-foreground">{bookInfo.author}</p>
                    {bookInfo.publisher && (
                      <p className="text-xs text-muted-foreground mt-1">Verlag: {bookInfo.publisher}</p>
                    )}
                    {bookInfo.publishedDate && (
                      <p className="text-xs text-muted-foreground">Erschienen: {bookInfo.publishedDate}</p>
                    )}
                    <Button className="mt-3" onClick={handleAddToLibrary}>
                      <Plus className="w-4 h-4 mr-2" />
                      Zur Bibliothek hinzufügen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
