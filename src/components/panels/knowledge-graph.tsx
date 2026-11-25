'use client';

import { BookIcon, Network, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';

export const KnowledgeGraph = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, notes, crossReferences } = useBookStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Network className="w-5 h-5" />Wissensgraph</SheetTitle></SheetHeader>
        <div className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500" /><span className="text-sm">Bücher ({books.length})</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500" /><span className="text-sm">Notizen ({notes.length})</span></div>
                <div className="flex items-center gap-2"><Network className="w-4 h-4" /><span className="text-sm">Verbindungen ({crossReferences.length})</span></div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {books.map(book => (
                    <div key={book.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <BookIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-sm truncate flex-1">{book.title}</span>
                      {book.rating && <div className="flex">{[...Array(book.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
