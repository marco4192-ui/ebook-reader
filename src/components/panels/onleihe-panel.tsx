'use client';

import { useState, useEffect } from 'react';
import {
  BookIcon,
  X,
  Plus,
  Search,
  Tag,
  Globe,
  RefreshCw,
  Heart,
  ExternalLink,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const OnleihePanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addBook } = useBookStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [libraryUrl, setLibraryUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'borrowed' | 'wishlist'>('search');
  const [borrowedBooks, setBorrowedBooks] = useState<{ title: string; author: string; dueDate: string; cover?: string; isbn?: string }[]>([]);
  const [newBorrowTitle, setNewBorrowTitle] = useState('');
  const [newBorrowAuthor, setNewBorrowAuthor] = useState('');
  const [newBorrowDays, setNewBorrowDays] = useState(21);

  const popularLibraries = [
    { name: 'Berlin', url: 'https://www.onleihe.de/berlin' },
    { name: 'München', url: 'https://www.onleihe.de/muenchen' },
    { name: 'Hamburg', url: 'https://www.onleihe.de/hamburg' },
    { name: 'Köln', url: 'https://www.onleihe.de/koeln' },
    { name: 'Frankfurt', url: 'https://www.onleihe.de/frankfurt' },
    { name: 'Stuttgart', url: 'https://www.onleihe.de/stuttgart' },
    { name: 'Düsseldorf', url: 'https://www.onleihe.de/duesseldorf' },
    { name: 'Dresden', url: 'https://www.onleihe.de/dresden' },
    { name: 'Leipzig', url: 'https://www.onleihe.de/leipzig' },
    { name: 'Nürnberg', url: 'https://www.onleihe.de/nuernberg' },
    { name: 'Hannover', url: 'https://www.onleihe.de/hannover' },
    { name: 'Bremen', url: 'https://www.onleihe.de/bremen' },
  ];

  // Load borrowed books from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onleihe-borrowed');
    if (saved) setBorrowedBooks(JSON.parse(saved));
  }, []);

  // Save borrowed books to localStorage
  useEffect(() => {
    localStorage.setItem('onleihe-borrowed', JSON.stringify(borrowedBooks));
  }, [borrowedBooks]);

  const searchOnleihe = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    
    const searchUrl = libraryUrl 
      ? `${libraryUrl}/search?searchTerm=${encodeURIComponent(searchTerm)}`
      : `https://www.onleihe.de/search?searchTerm=${encodeURIComponent(searchTerm)}`;
    
    window.open(searchUrl, '_blank');
    toast.success('Onleihe-Suche in neuem Tab geöffnet');
    setSearching(false);
  };

  const handleISBNLookup = async (isbn: string) => {
    setSearching(true);
    try {
      // Use Open Library API for book info
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      const bookData = data[`ISBN:${isbn}`];
      
      if (bookData) {
        setResults([{
          title: bookData.title,
          author: bookData.authors?.[0]?.name || 'Unbekannt',
          cover: bookData.cover?.medium || bookData.cover?.small,
          isbn,
          publisher: bookData.publishers?.[0]?.name,
          year: bookData.publish_date,
          pages: bookData.number_of_pages,
        }]);
      } else {
        toast.error('Kein Buch mit dieser ISBN gefunden');
      }
    } catch (error) {
      toast.error('Fehler bei der ISBN-Suche');
    }
    setSearching(false);
  };

  const addToWishlist = (book: any) => {
    addBook({
      title: book.title,
      author: book.author,
      format: 'txt',
      file: '',
      fileSize: 0,
      cover: book.cover,
    });
    toast.success(`"${book.title}" zur Bibliothek hinzugefügt!`);
  };

  const addBorrowedBook = () => {
    if (!newBorrowTitle.trim()) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + newBorrowDays);
    
    setBorrowedBooks([...borrowedBooks, {
      title: newBorrowTitle,
      author: newBorrowAuthor || 'Unbekannt',
      dueDate: dueDate.toISOString(),
    }]);
    setNewBorrowTitle('');
    setNewBorrowAuthor('');
    toast.success(`"${newBorrowTitle}" zu ausgeliehenen Büchern hinzugefügt`);
  };

  const removeBorrowedBook = (index: number) => {
    const book = borrowedBooks[index];
    setBorrowedBooks(borrowedBooks.filter((_, i) => i !== index));
    toast.success(`"${book.title}" aus der Liste entfernt`);
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const extendBorrow = (index: number) => {
    const books = [...borrowedBooks];
    const due = new Date(books[index].dueDate);
    due.setDate(due.getDate() + 14); // Extend by 14 days
    books[index].dueDate = due.toISOString();
    setBorrowedBooks(books);
    toast.success('Ausleihe um 14 Tage verlängert');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookIcon className="w-5 h-5 text-blue-500" />
            Onleihe - Digitale Bibliothek
          </SheetTitle>
        </SheetHeader>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4 p-1 bg-muted rounded-lg">
          {[
            { id: 'search', label: 'Suche', icon: Search },
            { id: 'borrowed', label: 'Ausgeliehen', icon: BookIcon, badge: borrowedBooks.length },
            { id: 'wishlist', label: 'Wunschliste', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-background shadow' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Info Card */}
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Digitale Bibliothek</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Die Onleihe bietet kostenlose E-Books und Hörbücher über Ihre lokale Bibliothek. 
                        Sie benötigen einen gültigen Bibliotheksausweis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Library Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ihre Bibliothek auswählen</Label>
                <select 
                  className="w-full p-3 border rounded-lg bg-background"
                  value={selectedLibrary}
                  onChange={(e) => {
                    const lib = popularLibraries.find(l => l.name === e.target.value);
                    setSelectedLibrary(e.target.value);
                    setLibraryUrl(lib?.url || '');
                  }}
                >
                  <option value="">-- Bibliothek wählen --</option>
                  {popularLibraries.map((lib) => (
                    <option key={lib.name} value={lib.name}>{lib.name}</option>
                  ))}
                  <option value="other">Andere Bibliothek...</option>
                </select>
                {selectedLibrary === 'other' && (
                  <Input 
                    placeholder="Onleihe-URL Ihrer Bibliothek eingeben"
                    value={libraryUrl}
                    onChange={(e) => setLibraryUrl(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Buch suchen</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Titel, Autor oder ISBN eingeben..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchOnleihe()}
                  />
                  <Button onClick={searchOnleihe} disabled={searching}>
                    {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* ISBN Quick Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ISBN-Suche (Buchinfo)</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="978-3-..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleISBNLookup(searchTerm)}
                  />
                  <Button variant="outline" onClick={() => handleISBNLookup(searchTerm)}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-3">
                  {results.map((book, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex gap-4">
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                            <BookIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          {book.year && <p className="text-xs text-muted-foreground">{book.year}</p>}
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => addToWishlist(book)}>
                              <Plus className="w-3 h-3 mr-1" />
                              Hinzufügen
                            </Button>
                            {libraryUrl && (
                              <Button size="sm" onClick={() => window.open(`${libraryUrl}/search?searchTerm=${encodeURIComponent(book.title)}`, '_blank')}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                In Onleihe
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Direct Link */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(libraryUrl || 'https://www.onleihe.de', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Onleihe öffnen
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div className="space-y-4">
              {/* Add borrowed book */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ausleihe hinzufügen
                  </h4>
                  <Input 
                    placeholder="Buchtitel"
                    value={newBorrowTitle}
                    onChange={(e) => setNewBorrowTitle(e.target.value)}
                  />
                  <Input 
                    placeholder="Autor (optional)"
                    value={newBorrowAuthor}
                    onChange={(e) => setNewBorrowAuthor(e.target.value)}
                  />
                  <div className="flex gap-2 items-center">
                    <Label className="text-xs whitespace-nowrap">Ausleihdauer:</Label>
                    <select 
                      className="flex-1 p-2 border rounded bg-background text-sm"
                      value={newBorrowDays}
                      onChange={(e) => setNewBorrowDays(parseInt(e.target.value))}
                    >
                      <option value={7}>7 Tage</option>
                      <option value={14}>14 Tage</option>
                      <option value={21}>21 Tage</option>
                      <option value={28}>28 Tage</option>
                    </select>
                    <Button size="sm" onClick={addBorrowedBook}>Hinzufügen</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Borrowed books list */}
              {borrowedBooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Keine ausgeliehenen Bücher</p>
                  <p className="text-xs">Fügen Sie Ihre ausgeliehenen Bücher hinzu, um Rückgabefristen zu verwalten.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {borrowedBooks.map((book, i) => {
                    const daysRemaining = getDaysRemaining(book.dueDate);
                    const isOverdue = daysRemaining < 0;
                    const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;
                    
                    return (
                      <Card key={i} className={`${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : isDueSoon ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{book.title}</h4>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                              <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                {isOverdue ? `⚠️ Überfällig seit ${Math.abs(daysRemaining)} Tag(en)` : 
                                 isDueSoon ? `⏰ Noch ${daysRemaining} Tag(e)` :
                                 `📅 Rückgabe: ${new Date(book.dueDate).toLocaleDateString('de-DE')}`}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => extendBorrow(i)} title="Verlängern">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => removeBorrowedBook(i)} title="Entfernen">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fügen Sie Bücher über die ISBN-Suche hinzu, um Ihre Wunschliste zu erstellen.
              </p>
              {results.length > 0 && (
                <div className="space-y-3">
                  {results.map((book, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => addToWishlist(book)}>
                          <Heart className="w-4 h-4 mr-1" />
                          Speichern
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
