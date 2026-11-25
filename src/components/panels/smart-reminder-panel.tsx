'use client';

import { useState, useMemo } from 'react';
import { Trash2, Plus, BarChart3, Eye, Zap, EyeOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const SmartReminderPanel = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { smartReminders, addSmartReminder, updateSmartReminder, removeSmartReminder, readingStats } = useBookStore();
  const [newReminder, setNewReminder] = useState({
    enabled: true,
    preferredTimes: ['20:00'],
    reminderMessage: 'Zeit zum Lesen! 📚',
    adaptiveEnabled: true,
  });

  // Analyze reading patterns for smart suggestions
  const readingPattern = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    
    Object.entries(readingStats.dailyStats).forEach(([date, stats]) => {
      const d = new Date(date);
      dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + stats.time;
    });

    // Find best reading time
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      bestDay: bestDay ? ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][parseInt(bestDay[0])] : null,
      currentStreak: readingStats.currentStreak,
      suggestedTimes: ['08:00', '20:00'], // Could be improved with more data
    };
  }, [readingStats]);

  const handleAddReminder = () => {
    addSmartReminder({
      ...newReminder,
      streakDays: readingStats.currentStreak,
    });
    setNewReminder({
      enabled: true,
      preferredTimes: ['20:00'],
      reminderMessage: 'Zeit zum Lesen! 📚',
      adaptiveEnabled: true,
    });
    toast.success('Erinnerung erstellt!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Lese-Erinnerungen
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Reading Pattern Analysis */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Ihr Lesemuster
              </h4>
              <div className="space-y-2 text-sm">
                {readingPattern.bestDay && (
                  <p className="text-muted-foreground">
                    Bester Lesetag: <span className="font-medium text-foreground">{readingPattern.bestDay}</span>
                  </p>
                )}
                <p className="text-muted-foreground">
                  Aktuelle Serie: <span className="font-medium text-foreground">{readingPattern.currentStreak} Tage</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add New Reminder */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neue Erinnerung</h4>
              <div className="space-y-2">
                <Label className="text-xs">Uhrzeit</Label>
                <Input
                  type="time"
                  value={newReminder.preferredTimes[0]}
                  onChange={(e) => setNewReminder({ ...newReminder, preferredTimes: [e.target.value] })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nachricht</Label>
                <Input
                  value={newReminder.reminderMessage}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderMessage: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Adaptive Erinnerungen</Label>
                <input
                  type="checkbox"
                  checked={newReminder.adaptiveEnabled}
                  onChange={(e) => setNewReminder({ ...newReminder, adaptiveEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleAddReminder}>
                <Plus className="w-4 h-4 mr-1" /> Erinnerung erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <div className="space-y-2">
            {smartReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className={`w-4 h-4 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">{reminder.preferredTimes.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => updateSmartReminder(reminder.id, { enabled: !reminder.enabled })}
                      >
                        {reminder.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => removeSmartReminder(reminder.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{reminder.reminderMessage}</p>
                  {reminder.adaptiveEnabled && (
                    <Badge variant="secondary" className="text-[10px] mt-2">
                      <Zap className="w-3 h-3 mr-1" /> Adaptiv
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
