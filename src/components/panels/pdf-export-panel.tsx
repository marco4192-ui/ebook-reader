'use client';

import { useState } from 'react';
import { BookOpen, Type, Highlighter, RefreshCw, Share2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const PDFExportPanel = ({ open, onOpenChange, bookId }: { open: boolean; onOpenChange: (open: boolean) => void; bookId?: string }) => {
  const { books, highlights, notes, readingStats } = useBookStore();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'highlights' | 'journal' | 'quote-card'>('highlights');

  const handleExport = async () => {
    setExporting(true);
    try {
      const filteredHighlights = bookId 
        ? highlights.filter(h => h.bookId === bookId)
        : highlights;
      
      const enrichedHighlights = filteredHighlights.map(h => ({
        ...h,
        bookTitle: books.find(b => b.id === h.bookId)?.title
      }));

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: exportType,
          data: exportType === 'highlights' ? enrichedHighlights : 
                exportType === 'journal' ? {
                  books: books.slice(0, 20),
                  highlights: enrichedHighlights,
                  notes: notes,
                  stats: {
                    totalBooks: books.length,
                    totalPages: readingStats.totalPagesRead,
                    totalHighlights: highlights.length,
                    totalNotes: notes.length,
                    readingStreak: readingStats.currentStreak,
                  }
                } : enrichedHighlights[0],
          bookTitle: bookId ? books.find(b => b.id === bookId)?.title : undefined,
          bookAuthor: bookId ? books.find(b => b.id === bookId)?.author : undefined,
        }),
      });

      if (!response.ok) throw new Error('Export fehlgeschlagen');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exportiert!');
    } catch {
      toast.error('Export fehlgeschlagen');
    }
    setExporting(false);
  };

  const highlightCount = bookId ? highlights.filter(h => h.bookId === bookId).length : highlights.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-red-500" />
            PDF Export
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'highlights', label: 'Markierungen', icon: <Highlighter className="w-5 h-5" />, count: highlightCount },
              { id: 'journal', label: 'Lese-Journal', icon: <BookOpen className="w-5 h-5" />, count: books.length },
              { id: 'quote-card', label: 'Zitat-Karte', icon: <Share2 className="w-5 h-5" />, count: highlightCount > 0 ? 1 : 0 },
            ].map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${exportType === type.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                onClick={() => setExportType(type.id as typeof exportType)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">{type.icon}</div>
                  <h4 className="font-medium text-sm">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.count} Einträge</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-medium">Export-Vorschau</h4>
              <p className="text-sm text-muted-foreground">
                {exportType === 'highlights' && `Exportiert ${highlightCount} Markierungen als PDF mit Formatierung und Notizen.`}
                {exportType === 'journal' && `Erstellt ein vollständiges Lese-Journal mit Statistiken, Buchliste und wichtigen Zitaten.`}
                {exportType === 'quote-card' && `Erstellt eine schöne Zitat-Postkarte zum Teilen.`}
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            {exporting ? 'Exportiere...' : 'Als PDF exportieren'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
