'use client';

import { useState } from 'react';
import { utf8ToBase64 } from '@/lib/utils';
import {
  List,
  X,
  Type,
  Plus,
  RefreshCw,
  Rss,
  Radio,
  ExternalLink,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore, type RSSFeed, type RSSArticle } from '@/lib/book-store';
import { toast } from 'sonner';

export const RSSPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { rssFeeds, rssArticles, addRSSFeed, removeRSSFeed, addRSSArticle, removeRSSArticle, addBook } = useBookStore();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);

  const handleAddFeed = () => {
    if (newFeedUrl.trim() && newFeedName.trim()) {
      addRSSFeed({
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
      });
      setNewFeedUrl('');
      setNewFeedName('');
      toast.success('RSS-Feed hinzugefügt!');
    }
  };

  const fetchFeed = async (feedId: string) => {
    const feed = rssFeeds.find(f => f.id === feedId);
    if (!feed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: feed.url, feedId: feed.id }),
      });
      const data = await response.json();

      if (data.articles) {
        data.articles.forEach((article: any) => {
          addRSSArticle({
            feedId: feed.id,
            title: article.title,
            content: article.content || article.description,
            url: article.link,
            publishedAt: new Date(article.pubDate || Date.now()).getTime(),
          });
        });
        toast.success(`${data.articles.length} Artikel geladen`);
      }
    } catch {
      toast.error('Fehler beim Laden des Feeds');
    }
    setLoading(false);
  };

  const saveArticleAsBook = (article: RSSArticle) => {
    addBook({
      title: article.title,
      format: 'txt',
      file: `data:text/plain;base64,${utf8ToBase64(article.content)}`,
      fileSize: article.content.length,
    });
    toast.success('Artikel als Buch gespeichert!');
  };

  const sampleFeeds = [
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'Spiegel Online', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Rss className="w-5 h-5 text-primary" />
            RSS-Feeds
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-80px)] mt-4 gap-4">
          {/* Feed List */}
          <div className="w-72 flex flex-col">
            <div className="space-y-2 mb-4">
              <Input
                placeholder="Feed-Name..."
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
              />
              <Input
                placeholder="RSS-URL..."
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
              <Button onClick={handleAddFeed} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Feed hinzufügen
              </Button>
            </div>

            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Beispiel-Feeds:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {sampleFeeds.map((feed) => (
                  <Badge
                    key={feed.url}
                    variant="outline"
                    className="cursor-pointer text-[10px]"
                    onClick={() => {
                      setNewFeedName(feed.name);
                      setNewFeedUrl(feed.url);
                    }}
                  >
                    {feed.name}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {rssFeeds.map((feed) => (
                  <Card
                    key={feed.id}
                    className={`cursor-pointer ${selectedFeed?.id === feed.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedFeed(feed)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{feed.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchFeed(feed.id);
                            }}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRSSFeed(feed.id);
                              if (selectedFeed?.id === feed.id) setSelectedFeed(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Articles */}
          <div className="flex-1">
            {selectedFeed ? (
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {rssArticles
                    .filter((a) => a.feedId === selectedFeed.id)
                    .sort((a, b) => b.publishedAt - a.publishedAt)
                    .map((article) => (
                      <Card key={article.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(article.publishedAt).toLocaleDateString('de-DE')}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                {article.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(article.url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Öffnen
                            </Button>
                            <Button size="sm" onClick={() => saveArticleAsBook(article)}>
                              <Save className="w-3 h-3 mr-1" />
                              Als Buch speichern
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {rssArticles.filter((a) => a.feedId === selectedFeed.id).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Keine Artikel</p>
                      <p className="text-sm">Klicken Sie auf Aktualisieren, um Artikel zu laden</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Rss className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Wählen Sie einen Feed aus</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
