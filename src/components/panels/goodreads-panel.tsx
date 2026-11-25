'use client';

import { useState } from 'react';
import { BookIcon, Upload, Download, Star, CheckCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const GoodreadsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, rateBook } = useBookStore();
  const [connected, setConnected] = useState(false);

  const handleSync = () => {
    toast.info('Keine echte Goodreads-Synchronisation – geplante Funktion.');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookIcon className="w-5 h-5 text-amber-600" />
            Goodreads-Sync
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Der Goodreads-Import ist eine geplante Funktion. Bewertungen und Bücher werden nicht wirklich mit Goodreads ausgetauscht." />
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookIcon className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                <h4 className="font-medium mb-2">Mit Goodreads verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Synchronisieren Sie Ihre Bewertungen und Leselisten mit Goodreads.
                </p>
                <Button onClick={() => { setConnected(true); toast.info('Simulierter Verbindungsstatus – geplante Funktion.'); }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Verbinden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Mit Goodreads verbunden</span>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium">Synchronisierung</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleSync}>
                      <Download className="w-4 h-4 mr-2" />
                      Bewertungen importieren
                    </Button>
                    <Button variant="outline" onClick={handleSync}>
                      <Upload className="w-4 h-4 mr-2" />
                      Bewertungen exportieren
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Zu synchronisierende Bücher</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {books.filter(b => b.rating).slice(0, 5).map((book) => (
                        <div key={book.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm truncate flex-1">{book.title}</span>
                          <div className="flex">
                            {[...Array(book.rating || 0)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
