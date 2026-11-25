'use client';

import { useMemo } from 'react';
import { BookIcon, List, Globe, AlertCircle, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';

export const SavingsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books } = useBookStore();

  const gutenbergBooks = books.filter((b) => b.isFromGutenberg);

  const savings = useMemo(() => {
    // Estimate average book price: $12 for ebooks
    const avgBookPrice = 12;
    const totalSaved = gutenbergBooks.length * avgBookPrice;

    return {
      booksCount: gutenbergBooks.length,
      totalSaved,
      formatted: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalSaved * 0.92), // Convert to EUR
    };
  }, [gutenbergBooks]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Geld gespart
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Total Savings */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6 text-center">
              <PiggyBank className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {savings.formatted}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                durch kostenlose Bücher gespart
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{savings.booksCount}</p>
                <p className="text-xs text-muted-foreground">Kostenlose Bücher</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">Project Gutenberg</p>
                <p className="text-xs text-muted-foreground">Quelle</p>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Wie wird berechnet?</p>
                  <p>
                    Die Ersparnis basiert auf einem durchschnittlichen E-Book-Preis von 12€.
                    Alle Bücher aus Project Gutenberg sind gemeinfrei und kostenlos erhältlich.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books List */}
          {gutenbergBooks.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3">Ihre kostenlosen Bücher</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {gutenbergBooks.map((book) => (
                      <div key={book.id} className="flex items-center gap-2 text-sm">
                        <BookIcon className="w-4 h-4 text-green-500" />
                        <span className="truncate">{book.title}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
