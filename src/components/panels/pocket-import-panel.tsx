'use client';

import { useState } from 'react';
import { Download, Link2, Save, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const PocketImportPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addWebArticle } = useBookStore();
  const [service, setService] = useState<'pocket' | 'instapaper'>('pocket');
  const [connected, setConnected] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  const handleConnect = async () => {
    // Simulate connection
    await new Promise(r => setTimeout(r, 1000));
    setConnected(true);
    setArticles([
      { id: 1, title: 'The Future of AI', url: 'https://example.com/ai', source: 'Medium' },
      { id: 2, title: 'Deep Learning Basics', url: 'https://example.com/dl', source: 'Blog' },
      { id: 3, title: 'Web Development Trends 2024', url: 'https://example.com/web', source: 'Dev.to' },
    ]);
    toast.info('Simulierte Verbindung – Pocket/Instapaper-Import ist geplant.');
  };

  const importArticle = (article: any) => {
    addWebArticle({
      title: article.title,
      url: article.url,
      content: '',
      source: article.source,
    });
    toast.info(`"${article.title}" lokal als Beispiel gespeichert.`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-red-500" />
            Artikel speichern
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Pocket-/Instapaper-Import ist eine geplante Funktion. Die hier gezeigten Artikel sind Beispieldaten." />
        <div className="mt-6 space-y-6">
          <div className="flex gap-2">
            <Button 
              variant={service === 'pocket' ? 'default' : 'outline'} 
              onClick={() => setService('pocket')}
              className="flex-1"
            >
              Pocket
            </Button>
            <Button 
              variant={service === 'instapaper' ? 'default' : 'outline'} 
              onClick={() => setService('instapaper')}
              className="flex-1"
            >
              Instapaper
            </Button>
          </div>

          {!connected ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Save className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h4 className="font-medium mb-2">Mit {service === 'pocket' ? 'Pocket' : 'Instapaper'} verbinden</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Importieren Sie gespeicherte Artikel zum Lesen.
                </p>
                <Button onClick={handleConnect}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Verbinden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {articles.map((article) => (
                  <Card key={article.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Newspaper className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-sm">{article.title}</h4>
                          <p className="text-xs text-muted-foreground">{article.source}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => importArticle(article)}>
                        <Download className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
