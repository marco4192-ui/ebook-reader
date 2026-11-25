'use client';

import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';

export const ReadingHeatmap = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingHourRecords, readingStats } = useBookStore();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const getIntensity = (hour: number, day: number) => {
    const record = readingHourRecords.find((r) => r.hour === hour && r.day === day);
    if (!record) return 0;
    return Math.min(record.minutes / 60, 1); // Normalize to 0-1
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-muted';
    if (intensity < 0.25) return 'bg-amber-200 dark:bg-amber-900/30';
    if (intensity < 0.5) return 'bg-amber-300 dark:bg-amber-800/50';
    if (intensity < 0.75) return 'bg-amber-400 dark:bg-amber-700/70';
    return 'bg-amber-500 dark:bg-amber-600';
  };

  const getTotalMinutes = (hour: number) => {
    return readingHourRecords
      .filter((r) => r.hour === hour)
      .reduce((sum, r) => sum + r.minutes, 0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Lese-Heatmap
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Hour of Day Heatmap */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Lesezeit nach Uhrzeit</h4>
              <div className="flex gap-0.5">
                {hours.map((hour) => {
                  const totalMinutes = getTotalMinutes(hour);
                  const maxMinutes = Math.max(...hours.map((h) => getTotalMinutes(h)), 1);
                  const height = (totalMinutes / maxMinutes) * 100;
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all group-hover:from-amber-400 group-hover:to-orange-300"
                        style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px' }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {hour}:00 - {Math.round(totalMinutes)} Min
                      </div>
                      {hour % 3 === 0 && (
                        <span className="text-[10px] text-muted-foreground mt-1">{hour}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day of Week Heatmap */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-4">Lesezeit nach Wochentag</h4>
              <div className="space-y-1">
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-muted-foreground">{day}</span>
                    <div className="flex-1 flex gap-0.5">
                      {hours.map((hour) => {
                        const intensity = getIntensity(hour, dayIndex);
                        return (
                          <div
                            key={hour}
                            className={`flex-1 h-4 rounded-sm ${getColor(intensity)} transition-all hover:ring-1 hover:ring-foreground/20`}
                            title={`${day} ${hour}:00 - ${Math.round(intensity * 60)} Min`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
                <span>Weniger</span>
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/30" />
                <div className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800/50" />
                <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700/70" />
                <div className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-600" />
                <span>Mehr</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
