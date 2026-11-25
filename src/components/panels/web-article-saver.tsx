'use client';

import { useState } from 'react';
import { utf8ToBase64 } from '@/lib/utils';
import { Type, Globe, Loader2, Save, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const WebArticleSaver = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { addBook } = useBookStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<{
    title: string;
    content: string;
    author?: string;
    source?: string;
  } | null>(null);

  const fetchArticle = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/web-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await response.json();

      if (data.article) {
        setArticle({
          title: data.article.title || 'Ohne Titel',
          content: data.article.content || data.article.textContent,
          author: data.article.author,
          source: data.article.source,
        });
        toast.success('Artikel geladen!');
      } else {
        toast.error('Artikel konnte nicht geladen werden');
      }
    } catch {
      toast.error('Fehler beim Laden des Artikels');
    }
    setLoading(false);
  };

  const saveAsBook = () => {
    if (article) {
      addBook({
        title: article.title,
        author: article.author,
        format: 'txt',
        file: `data:text/plain;base64,${utf8ToBase64(article.content)}`,
        fileSize: article.content.length,
      });
      toast.success('Artikel als Buch gespeichert!');
      setArticle(null);
      setUrl('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Web-Artikel speichern
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Artikel-URL eingeben..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchArticle()}
              className="flex-1"
            />
            <Button onClick={fetchArticle} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Geben Sie die URL eines Artikels ein, um ihn als lesbaren Text zu speichern.
          </p>

          {article && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{article.title}</h3>
                {article.author && (
                  <p className="text-sm text-muted-foreground">Von: {article.author}</p>
                )}
                {article.source && (
                  <Badge variant="outline" className="mt-1">{article.source}</Badge>
                )}
                <ScrollArea className="h-64 mt-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{article.content.substring(0, 2000)}...</p>
                  </div>
                </ScrollArea>
                <Button className="mt-4 w-full" onClick={saveAsBook}>
                  <Save className="w-4 h-4 mr-2" />
                  Als Buch speichern
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
