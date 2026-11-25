'use client';

import { useState } from 'react';
import { BookIcon, List, X, Plus, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const ReadingListsWithDeadlinesPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingLists, books, addReadingList, removeReadingList, addBookToList, removeBookFromList, updateReadingList } = useBookStore();
  const [newListName, setNewListName] = useState('');
  const [newListDeadline, setNewListDeadline] = useState('');
  const [selectedList, setSelectedList] = useState<string | null>(null);

  const handleAddList = () => {
    if (!newListName.trim()) return;
    addReadingList({
      name: newListName,
      deadline: newListDeadline ? new Date(newListDeadline).getTime() : undefined,
      bookIds: [],
    });
    setNewListName('');
    setNewListDeadline('');
    toast.success('Leseliste erstellt!');
  };

  const getDaysRemaining = (deadline?: number) => {
    if (!deadline) return null;
    const diff = deadline - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getListProgress = (bookIds: string[]) => {
    const listBooks = books.filter((b) => bookIds.includes(b.id));
    if (listBooks.length === 0) return 0;
    const completed = listBooks.filter((b) => b.progress >= 100).length;
    return Math.round((completed / listBooks.length) * 100);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Leselisten
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New List */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neue Leseliste</h4>
              <Input
                placeholder="Listenname..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <div className="space-y-1">
                <Label className="text-xs">Deadline (optional)</Label>
                <Input
                  type="date"
                  value={newListDeadline}
                  onChange={(e) => setNewListDeadline(e.target.value)}
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleAddList}>
                <Plus className="w-4 h-4 mr-1" /> Erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Reading Lists */}
          <div className="space-y-3">
            {readingLists.map((list) => {
              const daysRemaining = getDaysRemaining(list.deadline);
              const progress = getListProgress(list.bookIds);
              const listBooks = books.filter((b) => list.bookIds.includes(b.id));

              return (
                <Card key={list.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{list.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReadingList(list.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Deadline Warning */}
                    {daysRemaining !== null && (
                      <div className={`text-xs mb-2 flex items-center gap-1 ${daysRemaining <= 3 ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        <Calendar className="w-3 h-3" />
                        {daysRemaining > 0
                          ? `${daysRemaining} Tage verbleibend`
                          : daysRemaining === 0
                            ? 'Heute fällig!'
                            : 'Überfällig!'}
                      </div>
                    )}

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Fortschritt</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {/* Books */}
                    <div className="flex -space-x-2">
                      {listBooks.slice(0, 4).map((book) => (
                        <div
                          key={book.id}
                          className={`w-8 h-10 rounded border-2 border-background flex items-center justify-center ${book.progress >= 100 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'}`}
                        >
                          {book.progress >= 100 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <BookIcon className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                      ))}
                      {listBooks.length > 4 && (
                        <div className="w-8 h-10 rounded bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{listBooks.length - 4}
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
