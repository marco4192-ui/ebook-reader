'use client';

import { useState } from 'react';
import {
  BookIcon,
  BookOpen,
  Type,
  Highlighter,
  Clock,
  Edit3,
  RefreshCw,
  Grid,
  Sparkles,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';

export const ReadingJournalPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, highlights, notes, readingStats, readingSessions } = useBookStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [generating, setGenerating] = useState(false);

  const getFilteredData = () => {
    const now = Date.now();
    const periods = { week: 7, month: 30, year: 365, all: Infinity };
    const days = periods[selectedPeriod];
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return {
      books: books.filter(b => b.lastRead && b.lastRead >= cutoff),
      highlights: highlights.filter(h => h.createdAt >= cutoff),
      notes: notes.filter(n => n.createdAt >= cutoff),
      sessions: readingSessions.filter(s => s.startTime >= cutoff),
    };
  };

  const filtered = getFilteredData();

  const generateJournal = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journal',
          data: {
            books: filtered.books,
            highlights: filtered.highlights,
            notes: filtered.notes,
            stats: {
              totalBooks: filtered.books.length,
              totalPages: readingStats.totalPagesRead,
              totalHighlights: filtered.highlights.length,
              totalNotes: filtered.notes.length,
              readingStreak: readingStats.currentStreak,
            }
          }
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lese-journal-${selectedPeriod}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal erstellt!');
    } catch {
      toast.error('Fehler beim Erstellen');
    }
    setGenerating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Lese-Journal
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Period Selection */}
          <div className="flex gap-2">
            {[
              { id: 'week', label: 'Diese Woche' },
              { id: 'month', label: 'Dieser Monat' },
              { id: 'year', label: 'Dieses Jahr' },
              { id: 'all', label: 'Alles' },
            ].map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <BookIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{filtered.books.length}</p>
                <p className="text-xs text-muted-foreground">Bücher</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{filtered.highlights.length}</p>
                <p className="text-xs text-muted-foreground">Markierungen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Edit3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{filtered.notes.length}</p>
                <p className="text-xs text-muted-foreground">Notizen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold">{readingStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Tage Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Highlights */}
          {filtered.highlights.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Wichtige Zitate
                </h4>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {filtered.highlights.slice(0, 5).map((h) => {
                      const book = books.find(b => b.id === h.bookId);
                      return (
                        <div key={h.id} className="p-2 bg-muted rounded-lg">
                          <p className="text-sm italic">"{h.text.slice(0, 100)}..."</p>
                          {book && <p className="text-xs text-muted-foreground mt-1">— {book.title}</p>}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Button onClick={generateJournal} disabled={generating} className="w-full">
            {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            Journal als PDF erstellen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
