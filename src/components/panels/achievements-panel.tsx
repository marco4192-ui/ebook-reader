'use client';

import { Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';

export const AchievementsPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { achievements } = useBookStore();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" />Erfolge ({unlockedCount}/{achievements.length})</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlockedAt ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : 'opacity-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {achievement.unlockedAt && <Badge variant="secondary" className="mt-2"><CheckCircle className="w-3 h-3 mr-1" />Freigeschaltet</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
