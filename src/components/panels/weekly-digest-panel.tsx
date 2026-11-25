'use client';

import { useState } from 'react';
import { BookIcon, Highlighter, Clock, RefreshCw, CheckCircle, TrendingUp, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useBookStore, type Book } from '@/lib/book-store';
import { toast } from 'sonner';
import { FutureFeatureNotice } from '@/components/future-feature-notice';

export const WeeklyDigestPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { books, highlights, readingStats, readingSessions } = useBookStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);

  // Calculate weekly stats
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklySessions = readingSessions.filter(s => s.startTime >= weekAgo);
  const weeklyHighlights = highlights.filter(h => h.createdAt >= weekAgo);
  const weeklyPages = weeklySessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      toast.info('Zusammenfassung wird lokal erstellt – E-Mail-Versand ist geplant.');
    }
  };

  const sendTestDigest = async () => {
    setSending(true);
    // Simulate sending digest
    await new Promise(r => setTimeout(r, 1500));
    toast.info('Kein E-Mail-Server angebunden – Versand ist eine geplante Funktion.');
    setSending(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Wöchentliche Zusammenfassung
          </SheetTitle>
        </SheetHeader>
        <FutureFeatureNotice description="Die Wochen-Zusammenfassung wird lokal aus Lese-Spuren erstellt; ein E-Mail-Versand ist als geplante Funktion vorgemerkt (kein Mail-Server angebunden)." />
        <div className="mt-6 space-y-6">
          {/* Weekly Stats Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-4">Diese Woche im Überblick</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <BookIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-bold">{weeklyPages}</p>
                  <p className="text-xs text-muted-foreground">Seiten</p>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{Math.round(weeklyMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Minuten</p>
                </div>
                <div className="text-center">
                  <Highlighter className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-lg font-bold">{weeklyHighlights.length}</p>
                  <p className="text-xs text-muted-foreground">Markierungen</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold">{readingStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Tage Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Subscription */}
          {!subscribed ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium">E-Mail-Benachrichtigung einrichten</h4>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie jede Woche eine Zusammenfassung Ihrer Leseaktivität.
                </p>
                <div className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="ihre@email.de" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <Button onClick={handleSubscribe}>Anmelden</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Aktiviert!</h4>
                  <p className="text-sm text-muted-foreground">Sie erhalten die Zusammenfassung jeden Sonntag.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Digest Preview */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium">Inhalt der Zusammenfassung:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gelesene Seiten und Zeit</li>
                <li>• Wichtigste Markierungen der Woche</li>
                <li>• Lese-Fortschritt bei aktuellen Büchern</li>
                <li>• Motivierende Statistiken</li>
                <li>• Lese-Empfehlungen</li>
              </ul>
              <Button variant="outline" onClick={sendTestDigest} disabled={sending} className="w-full">
                {sending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Test-E-Mail senden
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
