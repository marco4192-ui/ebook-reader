'use client';

import { useState, useEffect } from 'react';
import { BookIcon, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore, type Book, type SmartShelf } from '@/lib/book-store';
import { toast } from 'sonner';

export const SmartShelvesPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, smartShelves, addSmartShelf, removeSmartShelf, refreshSmartShelves } = useBookStore();
  const [newShelfName, setNewShelfName] = useState('');
  const [newShelfRule, setNewShelfRule] = useState<SmartShelf['rule']>('unread');
  const [newShelfColor, setNewShelfColor] = useState('#f59e0b');

  const shelfColors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Blau', value: '#3b82f6' },
    { name: 'Grün', value: '#22c55e' },
    { name: 'Rot', value: '#ef4444' },
    { name: 'Lila', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const ruleLabels: Record<SmartShelf['rule'], string> = {
    unread: 'Ungelesene Bücher',
    in_progress: 'Aktuell am Lesen',
    completed: 'Fertig gelesen',
    favorites: 'Favoriten (4+ Sterne)',
    recently_added: 'Kürzlich hinzugefügt',
    long_books: 'Lange Bücher (>100k Wörter)',
    short_books: 'Kurze Bücher (<30k Wörter)',
    genre: 'Nach Genre',
    custom: 'Benutzerdefiniert',
  };

  useEffect(() => {
    if (open) refreshSmartShelves();
  }, [open, books]);

  const handleAddShelf = () => {
    if (!newShelfName.trim()) return;
    addSmartShelf({ name: newShelfName, rule: newShelfRule, color: newShelfColor });
    setNewShelfName('');
    toast.success('Smart Shelf erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookIcon className="w-5 h-5" />
            Intelligente Regale
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Shelf */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neues Regal erstellen</h4>
              <Input
                placeholder="Regalname..."
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
              />
              <div className="space-y-2">
                <Label className="text-xs">Regel</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={newShelfRule}
                  onChange={(e) => setNewShelfRule(e.target.value as SmartShelf['rule'])}
                >
                  {Object.entries(ruleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Farbe</Label>
                <div className="flex gap-2">
                  {shelfColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-6 h-6 rounded-full border-2 ${newShelfColor === color.value ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewShelfColor(color.value)}
                    />
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleAddShelf}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Existing Shelves */}
          <div className="space-y-3">
            {smartShelves.map((shelf) => {
              const shelfBooks = books.filter((b) => shelf.bookIds.includes(b.id));
              return (
                <Card key={shelf.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shelf.color }}
                        />
                        <span className="font-medium text-sm">{shelf.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {shelfBooks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeSmartShelf(shelf.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ruleLabels[shelf.rule]}
                    </p>
                    <div className="flex -space-x-2">
                      {shelfBooks.slice(0, 5).map((book) => (
                        <div
                          key={book.id}
                          className="w-8 h-10 rounded bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-background flex items-center justify-center"
                        >
                          <BookIcon className="w-4 h-4 text-amber-600" />
                        </div>
                      ))}
                      {shelfBooks.length > 5 && (
                        <div className="w-8 h-10 rounded bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{shelfBooks.length - 5}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
