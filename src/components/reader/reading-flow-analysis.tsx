'use client';

import { Pause, TrendingUp, Focus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useBookStore } from '@/lib/book-store';

export const ReadingFlowAnalysis = ({
  bookId,
  open,
  onOpenChange,
}: {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { getReadingFlowData } = useBookStore();
  const flowData = getReadingFlowData(bookId);

  const latestSession = flowData[flowData.length - 1];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lese-Fluss-Analyse
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {latestSession ? (
            <div className="space-y-4">
              {/* Focus Score */}
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-sm mb-2">Fokus-Score</h4>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {latestSession.focusScore}
                  </div>
                  <Progress value={latestSession.focusScore} className="h-2" />
                </CardContent>
              </Card>

              {/* Reading Speed */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Lesegeschwindigkeit</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ø WPM</span>
                    <span className="text-2xl font-bold">{latestSession.averageWPM || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pause Analysis */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Pausen-Analyse</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Anzahl Pausen</span>
                      <span>{latestSession.pauses.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gesamte Pausenzeit</span>
                      <span>{Math.round(latestSession.totalPauseTime / 60)} Min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ø Pausendauer</span>
                      <span>
                        {latestSession.pauses.length > 0
                          ? Math.round(latestSession.pauses.reduce((sum, p) => sum + p.duration, 0) / latestSession.pauses.length)
                          : 0}{' '}
                        Sek
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scroll Pattern */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Scroll-Muster</h4>
                  <Badge variant="secondary" className="capitalize">
                    {latestSession.scrollPattern === 'smooth' ? 'Glatt' :
                     latestSession.scrollPattern === 'jumpy' ? 'Sprunghaft' : 'Stetig'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">💡 Tipps</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {latestSession.focusScore < 50 && (
                      <li>• Versuchen Sie, Ablenkungen zu reduzieren</li>
                    )}
                    {latestSession.pauses.length > 10 && (
                      <li>• Viele kurze Pausen - vielleicht sind Sie müde?</li>
                    )}
                    {latestSession.averageWPM < 150 && (
                      <li>• Langsame Geschwindigkeit - genießen Sie das Buch!</li>
                    )}
                    {latestSession.averageWPM > 350 && (
                      <li>• Schnelles Lesen - achten Sie auf Verständnis</li>
                    )}
                    {latestSession.focusScore >= 70 && (
                      <li>• Großartige Konzentration! Weiter so!</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Daten vorhanden</p>
              <p className="text-sm">Beginnen Sie zu lesen, um Ihre Analyse zu sehen</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
