'use client';

import { useState } from 'react';
import { BookIcon, X, BookOpen, FileText, Plus, Clock, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useBookStore, type Book, type ReadingGoal } from '@/lib/book-store';
import { toast } from 'sonner';

export const GoalTrackingPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { readingGoals, readingStats, books, addReadingGoal, removeReadingGoal, updateGoalProgress } = useBookStore();
  const [newGoalType, setNewGoalType] = useState<ReadingGoal['type']>('books');
  const [newGoalTarget, setNewGoalTarget] = useState(12);

  const currentYear = new Date().getFullYear();

  const yearGoals = readingGoals.filter((g) => g.year === currentYear);

  const getProgress = (goal: ReadingGoal) => {
    switch (goal.type) {
      case 'books':
        return books.filter((b) => b.progress >= 100).length;
      case 'pages':
        return readingStats.totalPagesRead;
      case 'time':
        return Math.round(readingStats.totalReadingTime / 60);
      case 'streak':
        return readingStats.currentStreak;
      default:
        return 0;
    }
  };

  const handleAddGoal = () => {
    addReadingGoal({
      type: newGoalType,
      target: newGoalTarget,
      year: currentYear,
      startDate: Date.now(),
    });
    toast.success('Leseziel erstellt!');
  };

  const getProjectedCompletion = (goal: ReadingGoal) => {
    const progress = getProgress(goal);
    const elapsed = Date.now() - goal.startDate;
    const daysElapsed = elapsed / (1000 * 60 * 60 * 24);
    const daysRemaining = 365 - daysElapsed;

    if (daysElapsed === 0 || progress === 0) return null;

    const rate = progress / daysElapsed;
    const projectedTotal = rate * 365;

    return {
      projected: Math.round(projectedTotal),
      onTrack: projectedTotal >= goal.target,
    };
  };

  const goalLabels: Record<ReadingGoal['type'], { name: string; unit: string; icon: typeof BookOpen }> = {
    books: { name: 'Bücher', unit: 'Bücher', icon: BookIcon },
    pages: { name: 'Seiten', unit: 'Seiten', icon: FileText },
    time: { name: 'Zeit', unit: 'Stunden', icon: Clock },
    streak: { name: 'Streak', unit: 'Tage', icon: Target },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Leseziele {currentYear}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {/* Create New Goal */}
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Neues Ziel</h4>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value as ReadingGoal['type'])}
              >
                <option value="books">Bücher lesen</option>
                <option value="pages">Seiten lesen</option>
                <option value="time">Stunden lesen</option>
                <option value="streak">Lesestreak erreichen</option>
              </select>
              <Input
                type="number"
                placeholder="Zielwert..."
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
              />
              <Button size="sm" className="w-full" onClick={handleAddGoal}>
                <Plus className="w-4 h-4 mr-1" /> Ziel erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <div className="space-y-3">
            {yearGoals.map((goal) => {
              const progress = getProgress(goal);
              const percentage = Math.min((progress / goal.target) * 100, 100);
              const projected = getProjectedCompletion(goal);
              const label = goalLabels[goal.type];

              return (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label.icon className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">{label.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReadingGoal(goal.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{progress} / {goal.target} {label.unit}</span>
                        <span className="font-bold">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Projected */}
                    {projected && (
                      <div className={`text-xs ${projected.onTrack ? 'text-green-500' : 'text-amber-500'}`}>
                        {projected.onTrack ? (
                          <span>✓ Auf Kurs für {projected.projected} {label.unit}</span>
                        ) : (
                          <span>⚡ Projiziert: {projected.projected} {label.unit}</span>
                        )}
                      </div>
                    )}

                    {/* Due date indicator */}
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {Math.ceil((new Date(currentYear, 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tage verbleibend
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
