'use client';

import { useState } from 'react';
import {
  BookIcon,
  X,
  Type,
  Plus,
  Tag,
  RefreshCw,
  Star,
  Pin,
  Sparkles,
  QrCode,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

import { QRExportPanel } from '@/components/panels/qr-export-panel';
import { ShareableLinkExport } from '@/components/panels/shareable-link-export';

export const BookDetailPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { updateBook, rateBook, togglePin, addTagToBook, removeTagFromBook } = useBookStore();
  const [newTag, setNewTag] = useState('');
  const [autoTagging, setAutoTagging] = useState(false);
  const [showQRExport, setShowQRExport] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);

  const handleAutoTag = async () => {
    setAutoTagging(true);
    try {
      const response = await fetch('/api/autotag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: { title: book.title, author: book.author } }),
      });
      const data = await response.json();
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag: string) => addTagToBook(book.id, tag));
        toast.success(`${data.tags.length} Tags hinzugefügt!`);
      }
    } catch {
      toast.error('Auto-Tagging fehlgeschlagen');
    }
    setAutoTagging(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle className="flex items-center gap-2"><BookIcon className="w-5 h-5" />Buchdetails</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">{book.title}</h3>
              {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
            </div>
            <div className="space-y-2">
              <Label>Bewertung</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => rateBook(book.id, star)} className="p-1">
                    <Star className={`w-6 h-6 ${book.rating && star <= book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Angepinnt</Label>
              <Button variant="outline" size="icon" onClick={() => togglePin(book.id)}>
                <Pin className={`w-4 h-4 ${book.isPinned ? 'text-primary' : ''}`} />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button variant="ghost" size="sm" onClick={handleAutoTag} disabled={autoTagging}>
                  {autoTagging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="ml-1">Auto</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTagFromBook(book.id, tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Neuer Tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && newTag.trim() && (addTagToBook(book.id, newTag.trim()), setNewTag(''))} />
                <Button size="icon" onClick={() => { if (newTag.trim()) { addTagToBook(book.id, newTag.trim()); setNewTag(''); } }}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fortschritt</Label>
              <Progress value={book.progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-right">{Math.round(book.progress)}%</p>
            </div>
            
            {/* Export Options */}
            <div className="space-y-2">
              <Label>Export & Teilen</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowQRExport(true)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR-Code
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowShareLink(true)}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Link teilen
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
      
      <QRExportPanel book={book} open={showQRExport} onOpenChange={setShowQRExport} />
      <ShareableLinkExport book={book} open={showShareLink} onOpenChange={setShowShareLink} />
    </Sheet>
  );
};
