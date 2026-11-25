'use client';

import { Swords, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';

export const ChallengeBattlePanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { challenges, readingStats } = useBookStore();

  const activeBattles = [
    { id: '1', name: 'Seiten-Marathon', target: 100, current: 67, unit: 'Seiten', opponent: 'Team Alpha', deadline: Date.now() + 86400000 },
    { id: '2', name: 'Lese-Streak', target: 7, current: readingStats.currentStreak, unit: 'Tage', opponent: 'Bücherwürmer', deadline: Date.now() + 604800000 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Lese-Challenge Battles
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {activeBattles.map((battle) => {
            const progress = (battle.current / battle.target) * 100;
            const timeLeft = Math.max(0, Math.floor((battle.deadline - Date.now()) / 3600000));

            return (
              <Card key={battle.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{battle.name}</h4>
                      <p className="text-xs text-muted-foreground">gegen {battle.opponent}</p>
                    </div>
                    <Badge variant="outline">
                      ⏰ {timeLeft}h verbleibend
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Du: {battle.current} {battle.unit}</span>
                      <span>Ziel: {battle.target} {battle.unit}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Swords className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-3">
                Fordere Freunde zu Lese-Challenges heraus!
              </p>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Neue Challenge starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
