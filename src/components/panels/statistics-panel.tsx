'use client';

import { useMemo } from 'react';
import { BookOpen, FileText, Highlighter, Clock, Target, BarChart3, Edit3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';

import { formatTime } from '@/lib/reading/format';

export const StatisticsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingStats, books, highlights, notes } = useBookStore();
  
  const last7Days = useMemo(() => {
    const days: { day: string; pages: number; time: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = readingStats.dailyStats[dateStr] || { pages: 0, time: 0 };
      days.push({ day: date.toLocaleDateString('de-DE', { weekday: 'short' }), pages: stats.pages, time: stats.time });
    }
    return days;
  }, [readingStats.dailyStats]);

  const maxPages = Math.max(...last7Days.map(d => d.pages), 1);
  const completedBooks = books.filter(b => b.progress >= 100).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Lesestatistiken</SheetTitle></SheetHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Card><CardContent className="p-4 text-center"><BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" /><p className="text-2xl font-bold">{completedBooks}</p><p className="text-xs text-muted-foreground">Bücher gelesen</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><FileText className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="text-2xl font-bold">{readingStats.totalPagesRead}</p><p className="text-xs text-muted-foreground">Seiten gesamt</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" /><p className="text-2xl font-bold">{formatTime(readingStats.totalReadingTime)}</p><p className="text-xs text-muted-foreground">Lesezeit</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Target className="w-8 h-8 mx-auto mb-2 text-red-500" /><p className="text-2xl font-bold">{readingStats.currentStreak}</p><p className="text-xs text-muted-foreground">Tage in Folge</p></CardContent></Card>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card><CardContent className="p-4 text-center"><Highlighter className="w-6 h-6 mx-auto mb-2 text-yellow-500" /><p className="text-xl font-bold">{highlights.length}</p><p className="text-xs text-muted-foreground">Markierungen</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Edit3 className="w-6 h-6 mx-auto mb-2 text-purple-500" /><p className="text-xl font-bold">{notes.length}</p><p className="text-xs text-muted-foreground">Notizen</p></CardContent></Card>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Letzte 7 Tage</h3>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t" style={{ height: `${(day.pages / maxPages) * 100}%`, minHeight: day.pages > 0 ? '4px' : '0' }} />
                <p className="text-xs mt-2 text-muted-foreground">{day.day}</p>
                <p className="text-xs font-medium">{day.pages}</p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
