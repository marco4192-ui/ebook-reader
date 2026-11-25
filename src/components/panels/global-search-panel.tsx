'use client';

import { useState } from 'react';
import {
  Type,
  Trash2,
  FileText,
  Search,
  RefreshCw,
  Network,
  Filter,
  MapPin,
  Users,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';

// Ergebnis-Schema, wie es /api/search-all und die lokale Suche liefern
interface GlobalSearchResult {
  id: string;
  bookId: string;
  bookTitle: string;
  author?: string;
  type: 'text' | 'character' | 'quote' | 'location' | 'cross_reference';
  text: string;
  context?: string;
  location?: string;
  relevance: number;
}

export const GlobalSearchPanel = ({
  open,
  onOpenChange,
  onBookSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSelect?: (bookId: string) => void;
}) => {
  const { books, characters, locations, highlights, notes, searchHistory, addSearchToHistory, clearSearchHistory } = useBookStore();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'characters' | 'locations' | 'quotes' | 'text'>('all');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    addSearchToHistory(query);

    const searchResults: GlobalSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in books
    if (searchType === 'all' || searchType === 'text') {
      for (const book of books) {
        if (
          book.title.toLowerCase().includes(lowerQuery) ||
          (book.author && book.author.toLowerCase().includes(lowerQuery)) ||
          book.tags.some(t => t.toLowerCase().includes(lowerQuery))
        ) {
          searchResults.push({
            id: `book-${book.id}`,
            bookId: book.id,
            bookTitle: book.title,
            author: book.author,
            type: 'text',
            text: book.title,
            context: book.author ? `von ${book.author}` : undefined,
            relevance: 1,
          });
        }
      }
    }

    // Search in characters
    if (searchType === 'all' || searchType === 'characters') {
      for (const char of characters) {
        if (char.name.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === char.bookId);
          searchResults.push({
            id: `char-${char.id}`,
            bookId: char.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'character',
            text: char.name,
            context: char.description,
            relevance: 2,
          });
        }
      }
    }

    // Search in locations
    if (searchType === 'all' || searchType === 'locations') {
      for (const loc of locations) {
        if (loc.name.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === loc.bookId);
          searchResults.push({
            id: `loc-${loc.id}`,
            bookId: loc.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'location',
            text: loc.name,
            context: loc.description,
            relevance: 1.5,
          });
        }
      }
    }

    // Search in highlights (as quotes)
    if (searchType === 'all' || searchType === 'quotes') {
      for (const highlight of highlights) {
        if (highlight.text.toLowerCase().includes(lowerQuery)) {
          const book = books.find(b => b.id === highlight.bookId);
          searchResults.push({
            id: `quote-${highlight.id}`,
            bookId: highlight.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'quote',
            text: highlight.text,
            context: highlight.note,
            location: highlight.location,
            relevance: 2,
          });
        }
      }
    }

    // Search in notes
    if (searchType === 'all' || searchType === 'text') {
      for (const note of notes) {
        if (
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
        ) {
          const book = books.find(b => b.id === note.bookId);
          searchResults.push({
            id: `note-${note.id}`,
            bookId: note.bookId,
            bookTitle: book?.title || '',
            author: book?.author,
            type: 'text',
            text: note.title,
            context: note.content.substring(0, 100),
            relevance: 1.5,
          });
        }
      }
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults.slice(0, 50));
    setLoading(false);
  };

  const typeIcons = {
    character: <Users className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    quote: <Quote className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    cross_reference: <Network className="w-4 h-4" />,
  };

  const typeLabels = {
    character: 'Charakter',
    location: 'Ort',
    quote: 'Zitat',
    text: 'Text',
    cross_reference: 'Querverweis',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Alle Bücher durchsuchen
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen Sie in allen Büchern..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={performSearch} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Search Type Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Alle' },
              { value: 'characters', label: 'Charaktere' },
              { value: 'locations', label: 'Orte' },
              { value: 'quotes', label: 'Zitate' },
              { value: 'text', label: 'Text' },
            ].map((type) => (
              <Badge
                key={type.value}
                variant={searchType === type.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSearchType(type.value as typeof searchType)}
              >
                {type.label}
              </Badge>
            ))}
          </div>

          {/* Search History */}
          {query === '' && searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Letzte Suchen</Label>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearSearchHistory}>
                  <Trash2 className="w-3 h-3 mr-1" /> Löschen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((h, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => { setQuery(h); }}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[calc(100vh-350px)]">
            {results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{results.length} Ergebnisse</p>
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => {
                      onBookSelect?.(result.bookId);
                      onOpenChange(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {typeIcons[result.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {typeLabels[result.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.bookTitle}
                            </span>
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{result.text}</p>
                          {result.context && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {result.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Ergebnisse gefunden</p>
              </div>
            ) : null}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
