'use client';

import { useState } from 'react';
import { Copy, Share2, Check, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Highlight } from '@/lib/book-store';
import { toast } from 'sonner';

export const SocialShareCard = ({ open, onOpenChange, highlight }: { open: boolean; onOpenChange: (open: boolean) => void; highlight?: Highlight }) => {
  const { books } = useBookStore();
  const [selectedStyle, setSelectedStyle] = useState<'minimal' | 'elegant' | 'bold' | 'nature'>('elegant');
  const [copied, setCopied] = useState(false);

  const book = highlight ? books.find(b => b.id === highlight.bookId) : null;

  const styles = {
    minimal: { bg: 'bg-white dark:bg-gray-900', text: 'text-gray-900 dark:text-white', accent: 'border-l-4 border-gray-300' },
    elegant: { bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', text: 'text-amber-900 dark:text-amber-100', accent: 'border-l-4 border-amber-400' },
    bold: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white', accent: 'border-l-4 border-white' },
    nature: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', text: 'text-green-900 dark:text-green-100', accent: 'border-l-4 border-green-400' },
  };

  const style = styles[selectedStyle];

  const shareText = highlight?.text 
    ? `"${highlight.text}"${book ? ` — ${book.title}${book.author ? ` von ${book.author}` : ''}` : ''}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('In Zwischenablage kopiert!');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  if (!highlight) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Zitat teilen
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground">Wählen Sie eine Markierung zum Teilen aus</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Zitat teilen
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Style Selection */}
          <div className="flex gap-2">
            {[
              { id: 'minimal', label: 'Minimal', color: 'bg-gray-200' },
              { id: 'elegant', label: 'Elegant', color: 'bg-amber-200' },
              { id: 'bold', label: 'Bold', color: 'bg-purple-400' },
              { id: 'nature', label: 'Nature', color: 'bg-green-200' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id as typeof selectedStyle)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${selectedStyle === s.id ? 'border-primary' : 'border-transparent'}`}
              >
                <div className={`w-4 h-4 rounded ${s.color}`} />
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Preview Card */}
          <Card className="overflow-hidden">
            <CardContent className={`p-6 ${style.bg} ${style.accent}`}>
              <p className={`text-lg font-serif italic ${style.text}`}>
                "{highlight.text}"
              </p>
              {book && (
                <p className={`text-sm mt-4 ${style.text} opacity-75`}>
                  — {book.title}{book.author ? `, ${book.author}` : ''}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Kopieren
            </Button>
            <Button variant="outline" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" onClick={() => toast.success('Instagram Story Link kopiert!')}>
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
