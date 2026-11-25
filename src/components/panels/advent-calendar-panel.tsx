'use client';

import { motion } from 'framer-motion';
import { Tag, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookStore } from '@/lib/book-store';
import { toast } from 'sonner';

export const AdventCalendarPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, readingStats } = useBookStore();
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();

  // Only show in December
  const isDecember = currentMonth === 11;

  const doors = Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    opened: i + 1 < currentDay || (i + 1 === currentDay && isDecember),
    reward: [
      '📚 Neues Theme freigeschaltet!',
      '⭐ +50 XP Bonus',
      '🎵 Neuer Ambient Sound',
      '📖 Kostenloses Gutenberg-Buch',
      '🎨 Custom Font freigeschaltet',
      '🏆 Achievement: Advent-Leser',
      '💝 Lese-Postkarten freigeschaltet',
      '🌙 Nacht-Modus Pro',
      '🎧 Hörbuch-Speed Boost',
      '📖 Double XP Tag!',
    ][i % 10]
  }));

  const handleOpenDoor = (day: number) => {
    if (day === currentDay && isDecember) {
      toast.success(`Türchen ${day} geöffnet! ${doors[day-1].reward}`);
    }
  };

  if (!isDecember) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Lese-Adventskalender
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 text-center">
            <Calendar className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bis Dezember geduld...</h3>
            <p className="text-muted-foreground">
              Der Adventskalender ist nur im Dezember verfügbar. 
              Dann gibt es jeden Tag eine Überraschung!
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Lese-Adventskalender 🎄
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] mt-4">
          <div className="grid grid-cols-4 gap-3">
            {doors.map((door) => (
              <motion.div
                key={door.day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer aspect-square ${
                    door.opened
                      ? 'bg-gradient-to-br from-green-500/20 to-red-500/20 border-green-500/50'
                      : 'bg-gradient-to-br from-red-600 to-green-700'
                  }`}
                  onClick={() => handleOpenDoor(door.day)}
                >
                  <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
                    {door.opened ? (
                      <>
                        <span className="text-2xl mb-1">
                          {['🎁', '⭐', '📚', '🎄', '❄️', '🎵', '📖', '✨'][door.day % 8]}
                        </span>
                        <span className="text-xs font-bold">{door.day}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {door.reward}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-white">{door.day}</span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Deine Dezember-Statistik</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{readingStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Tage in Folge</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{doors.filter(d => d.opened).length}</p>
                  <p className="text-xs text-muted-foreground">Türchen</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{books.length}</p>
                  <p className="text-xs text-muted-foreground">Bücher</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
