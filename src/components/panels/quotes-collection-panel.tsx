'use client';

import { useState } from 'react';
import { Trash2, Plus, Star, Share2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const QuotesCollectionPanel = ({
  bookId,
  open,
  onOpenChange,
}: {
  bookId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { quotes, addQuote, removeQuote, toggleQuoteFavorite, books } = useBookStore();
  const [newQuote, setNewQuote] = useState({ text: '', note: '', tags: '' });
  
  const filteredQuotes = bookId ? quotes.filter(q => q.bookId === bookId) : quotes;
  const favoriteQuotes = filteredQuotes.filter(q => q.isFavorite);
  const currentBook = bookId ? books.find(b => b.id === bookId) : null;

  const handleAddQuote = () => {
    if (newQuote.text.trim() && bookId && currentBook) {
      addQuote({
        bookId,
        bookTitle: currentBook.title,
        author: currentBook.author,
        text: newQuote.text.trim(),
        note: newQuote.note.trim() || undefined,
        tags: newQuote.tags.split(',').map(t => t.trim()).filter(Boolean),
        isFavorite: false,
      });
      setNewQuote({ text: '', note: '', tags: '' });
      toast.success('Zitat gespeichert!');
    }
  };

  const shareQuote = async (quote: typeof quotes[0]) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Zitat aus "${quote.bookTitle}"`,
          text: `"${quote.text}"${quote.author ? ` - ${quote.author}` : ''}`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`"${quote.text}" - ${quote.author || quote.bookTitle}`);
      toast.success('Zitat kopiert!');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Zitate-Sammlung ({filteredQuotes.length})
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Add new quote */}
          {bookId && (
            <Card className="mb-4">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Neues Zitat</h4>
                <Textarea
                  placeholder="Zitat eingeben..."
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="min-h-[80px]"
                />
                <Input
                  placeholder="Notiz (optional)..."
                  value={newQuote.note}
                  onChange={(e) => setNewQuote({ ...newQuote, note: e.target.value })}
                />
                <Input
                  placeholder="Tags (kommagetrennt)..."
                  value={newQuote.tags}
                  onChange={(e) => setNewQuote({ ...newQuote, tags: e.target.value })}
                />
                <Button size="sm" className="w-full" onClick={handleAddQuote}>
                  <Plus className="w-4 h-4 mr-1" /> Zitat speichern
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Favorites section */}
          {favoriteQuotes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Favoriten
              </h4>
              <div className="space-y-2">
                {favoriteQuotes.map((quote) => (
                  <Card key={quote.id} className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="p-3">
                      <p className="text-sm italic">"{quote.text}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {quote.author || quote.bookTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => toggleQuoteFavorite(quote.id)}
                        >
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => shareQuote(quote)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => removeQuote(quote.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All quotes */}
          <div className="space-y-2">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="p-3">
                  <p className="text-sm italic">"{quote.text}"</p>
                  {!bookId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      aus: {quote.bookTitle}
                    </p>
                  )}
                  {quote.note && (
                    <p className="text-xs text-muted-foreground mt-1">{quote.note}</p>
                  )}
                  {quote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {quote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString('de-DE')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => toggleQuoteFavorite(quote.id)}
                      >
                        <Star className={`w-3 h-3 ${quote.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => shareQuote(quote)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => removeQuote(quote.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
