'use client';

import { useState } from 'react';
import { BookOpen, Download, RefreshCw, CheckCircle, Link2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const CalibreConnectPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addBook } = useBookStore();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [calibreBooks, setCalibreBooks] = useState<any[]>([]);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate connection
    await new Promise(r => setTimeout(r, 1500));
    setConnected(true);
    // Mock calibre library
    setCalibreBooks([
      { id: 1, title: 'Der Prozess', author: 'Franz Kafka', format: 'EPUB', size: '1.2 MB' },
      { id: 2, title: 'Die Verwandlung', author: 'Franz Kafka', format: 'EPUB', size: '0.8 MB' },
      { id: 3, title: 'Steppenwolf', author: 'Hermann Hesse', format: 'PDF', size: '3.5 MB' },
    ]);
    setConnecting(false);
    toast.info('Keine echte Calibre-Verbindung – dies ist eine geplante Funktion.');
  };

  const importBook = (book: any) => {
    addBook({
      title: book.title,
      author: book.author,
      format: book.format.toLowerCase(),
      file: 'calibre-import',
      fileSize: parseFloat(book.size) * 1024 * 1024,
    });
    toast.info(`"${book.title}" als Demo-Eintrag hinzugefügt (kein echter Calibre-Import).`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-500" />
            Calibre-Sync
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Die Calibre-Anbindung ist eine geplante Funktion. Es existiert noch keine echte Verbindung zu Calibre-Bibliotheken – gezeigte Bücher sind Beispieldaten." />
        <div className="mt-6 space-y-6">
          {!connected ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Calibre Content Server</h4>
                    <p className="text-sm text-muted-foreground">Verbinden Sie Ihre Calibre-Bibliothek</p>
                  </div>
                </div>
                <Input 
                  placeholder="http://localhost:8080" 
                  value={serverUrl} 
                  onChange={(e) => setServerUrl(e.target.value)} 
                />
                <Button onClick={handleConnect} disabled={connecting} className="w-full">
                  {connecting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                  {connecting ? 'Verbinde...' : 'Verbinden'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Verbunden</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
                  Trennen
                </Button>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {calibreBooks.map((book) => (
                    <Card key={book.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium text-sm">{book.title}</h4>
                            <p className="text-xs text-muted-foreground">{book.author} • {book.format}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => importBook(book)}>
                          <Download className="w-4 h-4 mr-1" />
                          Import
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
