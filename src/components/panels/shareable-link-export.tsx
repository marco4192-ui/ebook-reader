'use client';

import { useState, useEffect } from 'react';
import { BookIcon, Tag, Link2, Copy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type Book } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const ShareableLinkExport = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);

  useEffect(() => {
    if (open && book) {
      // Generate a mock shareable link
      const shareId = Math.random().toString(36).substring(2, 10);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setShareLink(`${baseUrl}/share/${shareId}`);
    }
  }, [open, book, expiryHours]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.info('Link kopiert – enthält nur eine zufällige ID ohne Server (echtes Teilen ist geplant).');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Schau dir "${book.title}" an${book.author ? ` von ${book.author}` : ''}`,
          url: shareLink,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Teilen-Link erstellen
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Der generierte Link enthält nur eine zufällige ID ohne Server dahinter – echtes Teilen über einen Link ist eine geplante Funktion." />
        <div className="mt-6 space-y-6">
          {/* Book Info */}
          <Card>
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-16 rounded bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                <BookIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{book.title}</h3>
                {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{book.format.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">{Math.round(book.progress)}% gelesen</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiry Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Link gültig für</Label>
            <div className="flex gap-2">
              {[1, 24, 168].map((hours) => (
                <Button
                  key={hours}
                  variant={expiryHours === hours ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiryHours(hours)}
                  className="flex-1"
                >
                  {hours === 1 ? '1 Stunde' : hours === 24 ? '1 Tag' : '1 Woche'}
                </Button>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Teilen-Link</Label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1 text-sm" />
              <Button onClick={copyLink} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex gap-3">
            <Button onClick={shareNative} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Der Link ermöglicht es anderen, das Buch in ihrer Bibliothek zu speichern.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
