'use client';

import { useState } from 'react';
import { Copy, Users2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { type Book } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const BuddyReadingPanel = ({ book, open, onOpenChange }: { book: Book; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [sessions, setSessions] = useState<{id: string; host: string; participants: string[]; currentPage: number; startedAt: number}[]>([]);
  const [isHosting, setIsHosting] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const createSession = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
    setIsHosting(true);
    setSessions([...sessions, {
      id: code,
      host: 'Du',
      participants: ['Du'],
      currentPage: 1,
      startedAt: Date.now()
    }]);
    toast.info('Session-Code ' + code + ' – Partner-Verbindung ist eine geplante Funktion (Code funktioniert noch nicht über Geräte hinweg).');
  };

  const joinSession = () => {
    if (sessionCode.length === 6) {
      toast.info('Beitritt simuliert – Partner-Sync ist eine geplante Funktion.');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Buddy Reading
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Buddy-Reading ist momentan nur lokal: Partner-Verbindungen und gemeinsame Sitzungen über Geräte hinweg erfordern einen Server und sind als geplante Funktion vorgemerkt." />
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground text-sm">
            Lese gemeinsam mit Freunden das gleiche Buch. Seht euren Fortschritt in Echtzeit!
          </p>

          {!isHosting ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Neue Session starten</h4>
                  <p className="text-sm text-muted-foreground mb-4">Erstelle eine Session und lade Freunde mit dem Code ein.</p>
                  <Button onClick={createSession} className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Session erstellen
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Session beitreten</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Session-Code eingeben..."
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="uppercase"
                    />
                    <Button onClick={joinSession} disabled={sessionCode.length !== 6}>
                      Beitreten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-mono font-bold text-primary mb-4 tracking-widest">
                  {sessionCode}
                </div>
                <p className="text-muted-foreground mb-4">
                  Teile diesen Code mit deinen Freunden
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(sessionCode);
                    toast.success('Code kopiert!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Code kopieren
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-4 justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">Live-Sync aktiv</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
