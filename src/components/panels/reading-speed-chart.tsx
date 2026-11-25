'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';

export const ReadingSpeedChart = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingSpeedRecords, settings } = useBookStore();

  const last30Days = useMemo(() => {
    const days: { date: string; day: number; wpm: number; pagesRead: number; timeSpent: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = readingSpeedRecords.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        day: date.getDate(),
        wpm: record?.wpm || 0,
        pagesRead: record?.pagesRead || 0,
        timeSpent: record?.timeSpent || 0,
      });
    }
    return days;
  }, [readingSpeedRecords]);

  const avgWpm = useMemo(() => {
    const recordsWithData = last30Days.filter((d) => d.wpm > 0);
    if (recordsWithData.length === 0) return 0;
    return Math.round(
      recordsWithData.reduce((sum, d) => sum + d.wpm, 0) / recordsWithData.length
    );
  }, [last30Days]);

  const maxWpm = Math.max(...last30Days.map((d) => d.wpm), 1);
  const improvement = avgWpm > 0 ? Math.round(((avgWpm - 200) / 200) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lesegeschwindigkeit
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{avgWpm}</p>
                <p className="text-xs text-muted-foreground">Wörter/Min Ø</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement}%
                </p>
                <p className="text-xs text-muted-foreground">vs. Durchschnitt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">{settings.speedReadingWPM}</p>
                <p className="text-xs text-muted-foreground">Ziel-WPM</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Letzte 30 Tage</h4>
              <div className="flex items-end gap-1 h-32">
                {last30Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-all ${day.wpm > 0 ? 'bg-gradient-to-t from-blue-500 to-cyan-400' : 'bg-muted'}`}
                      style={{ height: `${day.wpm > 0 ? (day.wpm / maxWpm) * 100 : 4}%`, minHeight: '4px' }}
                    />
                    {day.wpm > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {day.wpm} WPM
                      </div>
                    )}
                    {i % 5 === 0 && (
                      <span className="text-[10px] text-muted-foreground mt-1">{day.day}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Vergleich</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ihre Geschwindigkeit</span>
                  <span className="font-bold text-blue-500">{avgWpm} WPM</span>
                </div>
                <Progress value={(avgWpm / 400) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Langsam (100)</span>
                  <span>Durchschnitt (200)</span>
                  <span>Schnell (400)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
